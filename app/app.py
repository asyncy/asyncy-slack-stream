# -*- coding: utf-8 -*-

from slackclient import SlackClient
from flask import Flask
import os
import logging


slack = SlackClient(os.getenv('BOT_TOKEN'))

server = Flask(__name__)

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)-15s %(levelname)s %(message)s')
logger = logging.getLogger('app')
