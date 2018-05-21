const express = require('express');
const { RTMClient } = require('@slack/client');

const token = process.env.SLACK_TOKEN;

const app = express();
app.set('port', (process.env.PORT || 5000));

const rtm = new RTMClient(token);
rtm.start();

app.post('/send', (req, res) => {
  if (!req.query || !req.query.messasge || !req.query.coversation_id) {
    const error_message = {error: 'must provide message and conversation_id via query parameters'};
    process.stderr.write(error_message);
    res.status(400).send(error_message);
  } else {
    rtm.sendMessage(req.query.message, req.query.conversation_id)
      .then((data) => {
        res.send('Message sent: ' + data.ts);
      })
      .catch((err) => {
        process.stderr.write(err);
        res.status(500).send(err)
      });
  }
});

rtm.on('message', (event) => {
  // Skip messages that are from a bot or my own user ID
  if ((event.subtype && event.subtype === 'bot_message') || (!event.subtype && event.user === rtm.activeUserId)) {
    return;
  }
  process.stdout.write(JSON.stringify(event))
});

app.listen(app.get('port'));

process.stdout.write(`Listening on port ${app.get('port')}`);
