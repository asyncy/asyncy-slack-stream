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
  // there was a reply in a thread
  // if (message.subtype && message.subtype === 'message_replied') return true;
  // From me
  if (!message.subtype && message.user === rtm.activeUserId) return true;
}

var channelCache = {};

function findChannel(channel, callback){
  if (channel){
    if (channelCache[channel]) {
      callback(channelCache[channel]);

    } else if (channel[0] === '#') {
      web.channels.list().then((result) => {
        let c = (
          result.ok &&
          result.channels.find(c => {
            return c.name === channel.substr(1)
          })
        );
        if (c) {
          channelCache[channel] = c.id;
          callback(c.id);
        } else {
          callback(c.id);
        }
      });

    } else if (channel[0] === '@') {
      web.users.list().then((result) => {
        let c = (
          result.ok &&
          result.members.find(c => {
            return c.name === channel.substr(1)
          })
        );
        if (c) {
          channelCache[channel] = c.id;
          callback(c.id);
        } else {
          callback(c.id);
        }
      });

    } else {
      callback(channel);
    }
  } else {
      callback();
  }
}

// https://api.slack.com/rtm
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
      (!listener.pattern || message.text.match(listener.pattern) !== null)
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
    var data = (body ? JSON.parse(body) : {})
    if (req.url == '/subscribe') {
      console.log('New subscribe '+body);

      findChannel(data.data.channel, (channel) => {
        console.log('sub to', channel);
        if (data.data.channel && !channel) {
          res.writeHead(400);
          res.write('Channel not found.');
          res.end();
          return
        }
        Listeners[data.id] = {
          id: data.id,
          direct: (data.event === 'responds'),
          endpoint: data.endpoint,
          channel: channel,
          pattern: (data.data.pattern ? new RegExp(data.data.pattern) : null),
        };
        res.writeHead(204);
        res.end();
      });

    } else if (req.url == '/unsubscribe') {
      // [TODO] log new listener
      console.log('New unsubscribe');

      delete Listeners[data.id];
      res.writeHead(204);
      res.end();

    } else if (req.url == '/send') {
      // if # then look it up. else use the channel id
      findChannel(data.to, (channel) => {
        if (channel) {
          web.chat.postMessage({
            channel: channel,
            text: data.text
          })
          .then((r) => {
            console.log('Message sent: ', r.ts);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.write(JSON.stringify(r));
            res.end();
          })
          .catch((err) => {
            console.error(err);
            res.writeHead(500);
            res.end(err);
          });
        } else {
          res.writeHead(400);
          res.write('Channel or destination not found.');
          res.end();
        }
      });

    } else if (req.url == '/listUsers') {
      web.users.list(data).then(results => {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(results));
        res.end();
      });

    } else if (req.url == '/channels') {
      const param = {
        exclude_archived: data.exclude_archived,
        types: (data.types ? data.types.join(',') : 'public_channel'),
        limit: data.limit || 100
      };
      web.conversations.list(param).then(results => {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(results.channels));
        res.end();
      });
    } else {
      // [TODO] log new listener
      console.error('Bad request');

      res.writeHead(400);
      res.end('Bad request');
    }
  });
}).listen(process.env.PUBSUB_PORT || 5000);
