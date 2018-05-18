const { RTMClient } = require('@slack/client');

const token = process.env.SLACK_TOKEN;

const rtm = new RTMClient(token);
rtm.start();

const conversationId = '#genral'; // can get this via http

rtm.sendMessage('Hello there', conversationId)
  .then((res) => {
    console.log('Message sent: ', res.ts);
  })
  .catch(console.error);

rtm.on('message', (event) => {
  const message = event;
  console.log(event);

  // Skip messages that are from a bot or my own user ID
  if ( (message.subtype && message.subtype === 'bot_message') ||
    (!message.subtype && message.user === rtm.activeUserId) ) {
    return;
  }

  console.log(`(channel:${message.channel}) ${message.user} says: ${message.text}`);
});
