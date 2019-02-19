# -*- coding: utf-8 -*-

from app import slack

channel_cache = {}

def find_channel(channel):
    # False == any channel
    # string == specific channel
    if not channel:
        return False

    if channel_cache.get(channel):
        return channel_cache[channel]

    if channel[0] == '#':
        _channel = channel[1:]
        res = slack.api_call('channels.list')
        if res['ok']:
            for c in res['channels']:
                if c['name'] == _channel:
                    return channel_cache.setdefault(channel, c['id'])

    elif channel[0] == '@':
        _channel = channel[1:]
        res = slack.api_call('users.list')
        if res['ok']:
            for member in res['members']:
                if member['name'] == _channel:
                    return channel_cache.setdefault(channel, member['id'])

    else:
        return channel