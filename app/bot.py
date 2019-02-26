# -*- coding: utf-8 -*-
 
import requests
import re
from time import sleep
import threading
from json import dumps
from flask import request
from app import server, slack, logger
from helpers import find_channel

Listeners = {}


def pattern(string):
    if string:
        return re.compile(string).match
    else:
        return bool  # nice hack to always return true


def skip(message):
    if not message:
        return True
    elif message.get('type') != 'message':
        return True
    # From bot
    elif message.get('subtype') == 'bot_message':
        return True
    # # there was a reply in a thread
    # elif not message.get('subtype') and message['user'] == rtm.activeUserId:
    #     print('e3')
    #     return True
    return False


def matches_channel(left, right):
    if left and left != right:
        return False
    return True 


botId = None


def received(message):
    if skip(message):
        logger.debug('Skip message %s', message)
        return

    global botId
    if botId is None:
        botId = f'<@{slack.server.users.find(slack.server.username).id}>'
    
    is_direct = message['text'].startswith(botId)
    if is_direct:
        # remove the <@BOTID> from the message
        message['text'] = message['text'].replace(botId, '', 1).strip()
    
    for id, listener in Listeners.items():
        if is_direct is not listener['direct']:
            logger.debug('Skip listener is(nt) direct %s', message)
            continue
        elif not matches_channel(listener['channel'], message['channel']):
            logger.debug('Not listening to this channel %s', message)
            continue
        elif not listener['pattern'](message['text']):
            logger.debug('Message text does not match pattern %s', message)
            continue
        
        requests.post(
            listener['endpoint'],
            headers={'Content-Type': 'application/json'},
            data=dumps(dict(
                eventType='responds' if is_direct else 'hears',
                cloudEventsVersion='0.1',
                contentType='application/vnd.omg.object+json',
                eventID=message['client_msg_id'],
                data=message
            ))
        )


class SlackRTM(threading.Thread):
    stopped = True

    def start(self):
        logger.info('SlackRTM Starting')
        self.stopped = False
        super(SlackRTM, self).start()

    def stop(self):
        logger.info('SlackRTM Stopping')
        self.stopped = True

    def run(self):
        if self.stopped is False:
            self.stopped = False
            if slack.rtm_connect(auto_reconnect=True):
                while self.stopped is False and slack.server.connected is True:
                    for msg in slack.rtm_read():
                        received(msg)
                    sleep(.2)
            else:
                logger.error('SlackRTM connection failed')


rtm = SlackRTM()


@server.route('/subscribe', methods=['POST'])
def subscribe():
    body = request.json
    channel = find_channel(body['data'].get('channel'))
    assert channel is not None, 'Channel not found'

    Listeners[body['id']] = {
        'id': body['id'],
        'direct': (body['event'] == 'responds'),
        'endpoint': body['endpoint'],
        'channel': channel,
        'pattern': pattern(body['data'].get('pattern'))
    }

    logger.info('New subscription started')

    rtm.start()
    
    return 'Subscribed'


@server.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    Listeners.pop(request.json['id'], None)

    logger.info('Unsubscribing to %s', request.json['id'])

    if len(Listeners) == 0:
        rtm.stop()

    return 'Unsubscribed'
