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

  if (skip(message)) return

  var direct = new RegExp(`^<@${rtm.activeUserId}>`);

  // loop through all our listeners
  Object.keys(Listeners).forEach((endpoint) => {
    var listener = Listeners[endpoint];
    if (
      (listener.direct == (message.text.match(direct) !== null)) &&
      (!listener.channel || listener.channel === message.channel) &&
      (!listener.filter || message.text.match(listener.filter) !== null)
    ){
      // [TODO] add metric for receiving this event
      // [TODO] add log saying what message was heard
      console.log('Will post to ' + endpoint);
      request.post({
        headers: {'Content-Type': 'application/json'},
        url: endpoint,
        body: message
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
    if (req.url == '/subscribe/responds' || req.url == '/subscribe/hears') {
      // [TODO] log new listener
      console.log('New subscribe')

      Listeners[data.endpoint] = {
          direct: (req.url == '/subscribe/responds'),
          channel: data.channel,
          pattern: (data.pattern ? new RegExp(data.pattern) : null),
      };
      res.writeHead(200, {'Content-type':'text/plan'});
      res.end('subscribed');

    } else if (req.url == '/unsubscribe') {
      // [TODO] log new listener
      console.log('New unsubscribe')

      delete Listeners[data.endpoint];
      res.writeHead(200, {'Content-type':'text/plan'});
      res.end('unsubscribed');

    } else if (req.url == '/send') {
      // Send a message
      web.chat.postMessage(data)
        .then((res) => {
          console.log('Message sent: ', res.ts);
          res.writeHead(200, {'Content-type':'text/plan'});
          res.end('Sent');
        })
        .catch((err) => {
          console.error(err);
          res.writeHead(500, {'Content-type':'text/plan'});
          res.end(err);
        });

    } else {
      // [TODO] log new listener
      console.error('Bad request')

      res.writeHead(400, {'Content-type':'text/plan'});
      res.end('Bad request');
    }
  });
}).listen(process.env.PUBSUB_PORT || 5000);
