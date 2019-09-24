# _Slack_ OMG Microservice

[![Open Microservice Guide](https://img.shields.io/badge/OMG%20Enabled-👍-green.svg?)](https://microservice.guide)

This microservice's goal is to fully utilise the Slack API.

## Direct usage in [Storyscript](https://storyscript.io/):

##### Send
```coffee
>>> slack send text:'messageText' channel:'channelName' attachments:'attachmentsList' token:'token'
```
##### Responds
```coffee
>>> slack bot responds pattern:'pattern'
```
##### Users
```coffee
>>> slack users token:'token' limit:'limit' cursor:'cursor'
```
##### Channels
```coffee
>>> slack channels token:'token' limit:'limit' types:'listOfTypes'
```
##### Direct Channels
```coffee
>>> slack directChannels token:'token' limit:'limit'
```

Curious to [learn more](https://docs.storyscript.io/)?

✨🍰✨

## Usage with [OMG CLI](https://www.npmjs.com/package/omg)

##### Send
```shell
$ omg run send -a text=<MESSAGE_TEXT> -a channel=<ID/NAME> -a attachments=<ATTACHMENT_LIST> -a token=<TOKEN> -e BOT_TOKEN=<BOT_TOKEN>
```
##### Responds
```shell
$ omg subscribe bot responds -a pattern=<PATTERN> -e BOT_TOKEN=<BOT_TOKEN>
```
##### Users
```shell
$ omg run users -a token=<TOKEN> -a limit=<LIMIT> -a cursor=<CURSOR> -e BOT_TOKEN=<BOT_TOKEN>
```
##### Channels
```shell
$ omg run channels -a token=<TOKEN> -a limit=<LIMIT> -a types=<LIST_OF_TYPES> -e BOT_TOKEN=<BOT_TOKEN>
```
##### Direct Channels
```shell
$ omg run directChannels -a token=<TOKEN> -a limit=<LIMIT> -e BOT_TOKEN=<BOT_TOKEN>
```
##### Bot
```shell
$ omg subscribe bot hears -a pattern=<PATTERN> -a channel=<ID/NAME> -e BOT_TOKEN=<BOT_TOKEN>
```

**Note**: The OMG CLI requires [Docker](https://docs.docker.com/install/) to be installed.

## License
[MIT License](https://github.com/omg-services/slack/blob/master/LICENSE).


<!-- ## [Asyncy](https://asyncy.com) Example

The `slack` service is published in the [Asyncy Hub](https://hub.asyncy.com/service/slack)

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

# send a post
slack send text:'Hello world!' to:'general'
``` -->
