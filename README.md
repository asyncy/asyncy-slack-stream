# Slack as a microservice

[![Open Microservice Guide](https://img.shields.io/badge/OMG-enabled-brightgreen.svg?style=for-the-badge)](https://microservice.guide)

This microservice's goal is to fully utilise the Slack API.

## [OMG](hhttps://microservice.guide) CLI

### Slack Bot
```sh
omg exec -e TOKEN=<secret> -c bot
```

Subscribe to an event.
```sh
omg subscribe -e hears -a "pattern=/^hello/"
```


## [Asyncy](https://asyncy.com) Example

The `slack` service is published in the [Asyncy Hub](https://hub.asyncy.com/r/microservice/slack)

```storyscript
slack bot as client
    when client hears channel:'general' pattern:/^welcome/ as msg
        msg emoji key:'thumbs_up'
        msg reply message:'Nice to have you here'

    when client responds pattern:/foo/ as msg
        # respond to direct messages
        msg reply message:'bar'

    when client slash pattern:/deploy/ as msg
        # when user does /deploy do something awesome

```
