
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

function ifDirectMessage(channel, user, callback){
  if (ChannelCache[channel] === user) {
    callback(channel);
  } else {
    web.channels.info({'channel': channel}).then((result) => {
      // ...
    });
  }
}

// https://api.slack.com/rtm
rtm.on('message', (message) => {
  console.debug('Received', message);

  if (skip(message)) return;

  var directRegexp = new RegExp(`^<@${rtm.activeUserId}>`);

  // loop through all our listeners
  Object.keys(Listeners).forEach((id) => {
    var listener = Listeners[id];
    var isDirect = (message.text.match(directRegexp) !== null);
    if (listener.direct && !isDirect && !listener.channel) {
      // could be a direct message (not "@bot ..." but in the bot channel)
      ifDirectMessage(message.channel, message.user, (channel) => {
        
      });
    }
    if (
      (listener.direct === isDirect) &&
      (!listener.channel || listener.channel === message.channel) &&
      (!listener.pattern || message.text.match(listener.pattern) !== null)
    ){
      // [TODO] add metric for receiving this event
      const url = listener.endpoint || process.env.OMG_ENDPOINT;
      console.debug('Publish', listener);
      let body = JSON.stringify({
        eventType: ((listener.direct) ? 'responds' : 'hears'),
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

// web serv