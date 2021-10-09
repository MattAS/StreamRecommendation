const axios = require("axios").default;
const fs = require("fs");
const { MongoClient } = require("mongodb");

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

const check_live = (streamer) => {
  const instance = axios.create({
    baseURL: "https://api.twitch.tv/helix/streams",
    headers: {
      "Client-ID": "7cud78uflv2g253xvxhle6jtcal7dk",
      Authorization: "Bearer 67hfj30r7jwlqj9iow26xjk0paeidv",
    },
  });
  let query_string = "";
  for (let i = 0; i < streamer.length; i++) {
    query_string += `user_login=${streamer[i]}`;
    if (i != streamer.length - 1) {
      query_string += "&";
    }
  }
  return instance.get(`?${query_string}`).then((res) => res.data);
};

const get_chatters = async (streamers, client) => {
  const instance = axios.create({
    baseURL: "https://tmi.twitch.tv/group",
  });

  let streamers_100 = streamers.splice(0, 100);
  const streamer_data = check_live(streamers_100).then((res) => res.data);
  console.log(streamer_data);
  streamer_data.then((res) => {
    for (let i = 0; i < res.length; i++) {
      let data = {};
      console.log(res[i]);
      if (res.length != 0) {
        data["game_name"] = res[i].game_name;
        data["is_mature"] = res[i].is_mature;
        data["title"] = res[i].title;
        data["started_at"] = res[i].started_at;
        data["tag_ids"] = res[i].tag_ids;
        data["viewer_count"] = res[i].viewer_count;
        // console.log(data);
        data["streamer"] = res[i].user_login;
        let streamer = res[i].user_login;
        instance.get(`/user/${streamer}/chatters`).then(async (res) => {
          console.log(res);
          data["vips"] = res.data.chatters.vips;
          data["moderators"] = res.data.chatters.moderators;
          data["viewers"] = res.data.chatters.viewers;
          try {
            await client
              .db("streamer_data")
              .collection(`streamer_data_${streamer}_${Date.now()}`)
              .insertOne(data);
          } catch (err) {
            console.log(err);
          }

          //   console.log(res.data.chatter.vips);
        });
      }
    }
  });
};

async function main() {
  const uri =
    "mongodb+srv://dbUser:dbUserPassword@cluster0.jemq8.mongodb.net/database?retryWrites=true&w=majority";
  const instance = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  instance.connect((err, client) => {
    streamers = read_streamer_list();
    get_chatters(streamers, client);
  });
}

main();
