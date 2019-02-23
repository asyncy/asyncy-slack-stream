# -*- coding: utf-8 -*-

from flask import request, jsonify
from app import server, slack
from helpers import find_channel


def prepare(data):
    if data.get('channel'):
        data['channel'] = find_channel(data['channel'])

    # Reduce by removing values equal to None
    return {k: v for k, v in data.items() if v is not None}


@server.route('/api/<endpoint>', methods=['POST'])
def api(endpoint):
    res = slack.api_call(
        endpoint, **prepare(request.json)
    )
    return jsonify(res)
