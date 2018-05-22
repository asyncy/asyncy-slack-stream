const express = require('express');
const { RTMClient } = require('@slack/client');

const app = express();
app.set('port', (process.env.PORT || 5000));

const rtm = new RTMClient(process.env.BOT_TOKEN);
rtm.start();

app.post('/send', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (!req.query || !req.query.message || !req.query.conversation_id) {
    res.status(400).send({error: 'must provide message and conversation_id via query parameters'});
  } else {
    rtm.sendMessage(req.query.message, req.query.conversation_id)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(400).send(err);
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
