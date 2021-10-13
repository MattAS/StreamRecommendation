const axios = require("axios").default;
const fs = require("fs");
const { MongoClient } = require("mongodb");
const cron = require("node-cron");
const shell = require("shelljs");

require("dotenv").config();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const read_streamer_list = () => {
  const file_path = "../webscrape/streamer.txt";
  const streamer_data = fs.readFileSync(file_path, "utf-8");
  const streamer_split = streamer_data.split("\r\n");
  let streamer_name = [];
  for (let i = 0; i < streamer_split.length; i++) {
    if (streamer_split[i] != "") {
      streamer_name.push(streamer_split[i]);
    }
  }
  return streamer_name;
};

const check_live = async (streamer) => {
  const instance = axios.create({
    baseURL: "https://api.twitch.tv/helix/streams",
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      Authorization: process.env.BEARER_TOKEN,
    },
  });
  const streamers_100 = streamer.slice(0, 100);
  const formatStreamerLogin = streamers_100.map(
    (login) => `user_login=${login}`
  );
  const query_string = formatStreamerLogin.join("&");

  try {
    const res = (await instance.get(`?${query_string}`)).data;
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

const get_live_stream_data = async (streamers, client) =>
  Promise.all(
    streamers.map(async (streamer) => {
      const {
        game_name,
        is_mature,
        title,
        started_at,
        tag_ids,
        viewer_count,
        user_login,
      } = streamer;

      const chatters = await get_user_chatters(user_login);

      const { vips, moderators, viewers } = chatters;

      return {
        game_name,
        is_mature,
        title,
        started_at,
        tag_ids,
        viewer_count,
        user_login,
        vips,
        moderators,
        viewers,
      };
    })
  );

const get_user_chatters = async (streamer) => {
  const instance = axios.create({
    baseURL: "https://tmi.twitch.tv/group",
  });

  try {
    return (await instance.get(`/user/${streamer}/chatters`)).data.chatters;
  } catch (err) {
    console.error(err);
  }
};

const write_document = async (streamer_data, client) => {
  console.log(client);
  return await client.collection("streams").insertMany(streamer_data);
};

const get_chatters = async (streamers, client) => {
  // console.log(client);
  try {
    const liveStreamers = await check_live(streamers);
    const streamerData = await get_live_stream_data(liveStreamers);
    try {
      await client
        .db("stream_data")
        .collection("streams")
        .insertMany(streamerData);
    } catch (err) {
      console.error(err);
    } finally {
      client.close();
    }
  } catch (err) {
    console.error(err);
  }
};

function main() {
  const streamers = read_streamer_list();
  const uri = `mongodb+srv://dbUser:${process.env.DB_PASS}@cluster0.jemq8.mongodb.net/database?retryWrites=true&w=majority`;
  const instance = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  instance.connect((err, client) => {
    if (err) {
      console.log(err);
    }
    get_chatters(streamers, client);
  });
}

main();

cron.schedule("0 0 */3 * * *", function () {
  console.log("Getting Stream Data...");
  main();
});
