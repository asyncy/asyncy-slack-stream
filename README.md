# Slack Bot Microservice

[![Microservice.Guide](https://img.shields.io/badge/Microservice.Guide-ready-brightgreen.svg?style=for-the-badge)](https://microservice.guide)

## Asyncy Example

The `slack-bot run` command will listen for all messages in the Slack room.

```storyscript
slack-bot run as message
    if message.subtype == 'channel_join'
      slack-bot send message:"Welcome!" to:message.user
```
> See all message data here: https://api.slack.com/events/message
