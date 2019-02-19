# -*- coding: utf-8 -*-

from slackclient import SlackClient
from flask import Flask
import os


slack = SlackClient(os.getenv('BOT_TOKEN'))

server = Flask(__name__)
