const express = require('express');
const bodyParser = require('body-parser');
const { RTMClient } = require('@slack/client');

const app = express();
app.set('port', 5000);
app.use(bodyParser.json());

const rtm = new RTMClient(process.env.BOT_TOKEN);
rtm.start();

app.post('/send', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (!req.body || !req.body.message || !req.body.conversation_id) {
    res.status(400).send({error: 'must provide message and conversation_id via body'});
  } else {
    rtm.sendMessage(req.body.message, req.body.conversation_id)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
});

app.listen(app.get('port'));

process.stdout.write(`Listening on port ${app.get('port')}`);
