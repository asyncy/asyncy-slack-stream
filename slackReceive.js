const request = require('request');
const { RTMClient } = require('@slack/client');

const rtm = new RTMClient(process.env.BOT_TOKEN);
rtm.start();

rtm.on('message', (event) => {
  // Skip messages that are from a bot or my own user ID
  if ((event.subtype && event.subtype === 'bot_message') || (!event.subtype && event.user === rtm.activeUserId)) {
    return;
  }
  request.post({
    headers: {
      'Content-Type': 'application/json'
    },
    url: process.env.MG_ENDPOINT,
    body: event
  });
});
