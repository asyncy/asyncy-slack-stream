# -*- coding: utf-8 -*-
 
import requests
import re
from time import sleep
import threading
from json import dumps
from flask import request
from app import server, slack
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
        print('e1', message)
        return True
    # From bot
    elif message.get('subtype') == 'bot_message':
        print('e2')
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


debug = server.logger.debug  # for less dot == faster


def received(message):
    if skip(message):
        debug('Skip message %s', message)
        return
    
    is_direct = False # message['text']
    
    for id, listener in Listeners.items():
        if is_direct and not listener['direct']:
            debug('Not a direct message %s', message)
            continue
        elif not matches_channel(listener['channel'], message['channel']):
            debug('Not listening to this channel %s', message)
            continue
        elif not listener['pattern'](message['text']):
            debug('Message text does not match pattern %s', message)
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
        server.logger.info('SlackRTM Starting')
        self.stopped = False
        super(SlackRTM, self).start()

    def stop(self):
        server.logger.info('SlackRTM Stopping')
        self.stopped = True

    def run(self):
        if self.stopped is False:
            self.stopped = False
            if slack.rtm_connect(auto_reconnect=True):
                while not self.stopped:
                    for msg in slack.rtm_read():
                        received(msg)
                    sleep(.2)
            else:
                server.logger.warn('SlackRTM connectin failed')


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

    server.logger.info('New subscription started')

    rtm.start()
    
    return 'Subscribed'


@server.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    Listeners.pop(request.json['id'], None)

    server.logger.info('Unsubscribing to', request.json['id'])

    if len(Listeners) == 0:
        rtm.stop()

    return 'Unsubscribed'
