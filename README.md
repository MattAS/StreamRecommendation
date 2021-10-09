# Stream Recommendation
## Project Description
Recently, there has been alot of social media platforms adopting live streaming for purposes other than entertaiment. More companies are using them to promote items by using mediums such as the new Tiktok shop, Instagram Live, or sponsored streams on Twitch. With an increase in live streaming adoption, companies need to adopt a new method to recommend live streams to their users. The concept of recommending live streams are different to recommending Youtube videos since a single live stream may contain multiple topics. My goal for this project is to create a recommendation engine for live streams. To be more specific, I will be using my own Twitch data along with other user data from Twitch streams. 

Aside from personal Twitch data, I will scrape the names of the top 1000 streamers on the platform through the [twitchtracker](https://twitchtracker.com/channels/viewership/english?page=1) website. I will be filtering the streamers for only those who are categorized as english streams because I only watch english streams. Since the twitchtracker collects the top streamers per month, I will be using the top 100 streamers for October 2021. Furthermore, I will also be using the Twitch API to further gather information about streamers and viewers. The first API endpoint that I will be using is [tmi.twitch.tv](tmi.twitch.tv). This endpoint outputs as JSON the current chatters in a given stream. Since [tmi.twitch.tv](tmi.twitch.tv) only looks at current users in the chat, I will also use the Twitch developer API to create automated requests to find whether a given streamer is Live and gather information on the chatters. With this information I can draw connections on common chatters across different streamers along with the type of games the streamers play. 
