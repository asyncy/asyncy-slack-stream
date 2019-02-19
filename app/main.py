# -*- coding: utf-8 -*-

from app import server
import api
import bot
import os


if __name__ == '__main__':
    try:
        server.run(
            host=os.getenv('FLASK_HOST', '0.0.0.0'),
            port=int(os.getenv('FLASK_PORT', 8000)),
            debug=(os.getenv('FLASK_DEBUG') == 'TRUE')
        )
    except:
        bot.rtm.stop()
