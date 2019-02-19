# -*- coding: utf-8 -*-

from app import server
import api
import bot


if __name__ == '__main__':
    try:
        server.run(host='0.0.0.0', port=8000, debug=True)
    except:
        bot.rtm.stop()
