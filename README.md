# Slack Bot Microservice

[![Microservice.Guide](https://img.shields.io/badge/Microservice.Guide-ready-brightgreen.svg?style=for-the-badge)](https://microservice.guide)

[TODO] add descriptions/features here

See all message data here: https://api.slack.com/events/message

## Asyncy Example

The `slack` service is published in the Asyncy Hub

```storyscript
slack bot as bot
    when bot.hears channel:'general' pattern:/^welcome/ as event
        event emoji key:'thumbs_up'
        event reply message:'Nice to have you here'

    when bot.responds pattern:/foo/ as event
        # respond to direct messages
        event reply message:'bar'

    when bot.slash pattern:/deploy/ as event
        # when user does /deploy do something awesome

```
