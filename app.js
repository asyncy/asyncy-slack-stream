const request = require('request');
const { RTMClient, WebClient } = require('@slack/client');
const http = require('http');

const token = process.env.BOT_TOKEN;
const rtm = new RTMClient(token);
const web = new WebClient(token);

rtm.start();

const Listeners = {};
// 'http://dest' : {channel: null, pattern: null}

function skip(message){
  // From bot
  if (message.subtype && message.subtype === 'bot_message') return true;
  // juse mentioning there was a reply in a thread
  if (message.subtype && message.subtype === 'message_replied') return true;
  // From me
  if (!message.subtype && message.user === rtm.activeUserId) return true;
}

rtm.on('message', (message) => {
  console.debug('Received message', message);

  if (skip(message)) return;

  var direct = new RegExp(`^<@${rtm.activeUserId}>`);

  // loop through all our listeners
  Object.keys(Listeners).forEach((id) => {
    var listener = Listeners[id];
    var isDirect = (message.text.match(direct) !== null);
    if (
      (listener.direct === isDirect) &&
      (!listener.channel || listener.channel === message.channel) &&
      (!listener.filter || message.text.match(listener.filter) !== null)
    ){
      // [TODO] add metric for receiving this event
      const url = listener.endpoint || process.env.OMG_ENDPOINT;
      console.log('Publishing to ' + listener.id + ' @ ' + url);
      let body = JSON.stringify({
        eventType: ((isDirect) ? 'responds' : 'hears'),
        cloudEventsVersion: '0.1',
        contentType: 'application/vnd.omg.object+json',
        eventID: message.client_msg_id,
        data: message,
      });
      request.post({
        headers: {'Content-Type': 'application/json'},
        url: url,
        body: body
      }, function(err, response, body) {
        if (err) {
          console.error("Failed to publish event!", err);
        }
      });
    }
  });
});

// web server to acccept new listeners from platform
http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    var data = JSON.parse(body);
    if (req.url == '/subscribe') {
      // [TODO] log new listener
      console.log('New subscribe '+body);

      Listeners[data.id] = {
          id: data.id,
          direct: (data.event === 'responds'),
          endpoint: data.endpoint,
          channel: data.channel,
          pattern: (data.pattern ? new RegExp(data.pattern) : null),
      };
      res.writeHead(204);
      res.end();

    } else if (req.url == '/unsubscribe') {
      // [TODO] log new listener
      console.log('New unsubscribe');

      delete Listeners[data.id];
      res.writeHead(204);
      res.end();

    } else if (req.url == '/send') {
      // Send a message
      web.chat.postMessage(data)
        .then((r) => {
          console.log('Message sent: ', r.ts);
          res.writeHead(204);
          res.end();
        })
        .catch((err) => {
          console.error(err);
          res.writeHead(500);
          res.end(err);
        });

    } else {
      // [TODO] log new listener
      console.error('Bad request');

      res.writeHead(400);
      res.end('Bad request');
    }
  });
}).listen(process.env.PUBSUB_PORT || 5000);
