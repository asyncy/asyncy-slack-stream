# _Slack_ Open Microservice

> Wrapper for the Slack API

[![Open Microservice Specification Version](https://img.shields.io/badge/Open%20Microservice-1.0-477bf3.svg)](https://openmicroservices.org) [![Open Microservices Spectrum Chat](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/open-microservices) [![Open Microservices Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](https://github.com/oms-services/.github/blob/master/CODE_OF_CONDUCT.md) [![Open Microservices Commitzen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## Introduction

This project is an example implementation of the [Open Microservice Specification](https://openmicroservices.org), a standard originally created at [Storyscript](https://storyscript.io) for building highly-portable "microservices" that expose the events, actions, and APIs inside containerized software.

## Getting Started

The `oms` command-line interface allows you to interact with Open Microservices. If you're interested in creating an Open Microservice the CLI also helps validate, test, and debug your `oms.yml` implementation!

See the [oms-cli](https://github.com/microservices/oms) project to learn more!

### Installation

```
npm install -g @microservices/oms
```

## Usage

### Open Microservices CLI Usage

Once you have the [oms-cli](https://github.com/microservices/oms) installed, you can run any of the following commands from within this project's root directory:

#### Actions

##### send

> Sends a message to a channel.
https://api.slack.com/methods/chat.postMessage

##### Action Arguments

| Argument Name | Type | Required | Default | Description |
|:------------- |:---- |:-------- |:--------|:----------- |
| text | `string` | `true` | None | Text of the message to send. |
| channel | `string` | `true` | None | What channel to send message in. This can be a "#channel" "@user" or a channel id.  |
| attachments | `list` | `false` | None | No description provided. |
| token | `string` | `false` | None | Authentication token bearing required scopes. Environment variable BOT_TOKEN used by default.  |
| BOT_TOKEN | `string` | `false` | None | The Slack bot token |

``` shell
oms run send \ 
    -a text='*****' \ 
    -a channel='*****' \ 
    -a attachments='*****' \ 
    -a token='*****' \ 
    -e BOT_TOKEN=$BOT_TOKEN
```

##### hears

> Triggered anytime a messages matches the pattern
##### Action Arguments

| Argument Name | Type | Required | Default | Description |
|:------------- |:---- |:-------- |:--------|:----------- |
| pattern | `string` | `false` | None | A regexp pattern to filter messages |
| channel | `string` | `true` | None | Only listen in a specific channel |
| BOT_TOKEN | `string` | `false` | None | The Slack bot token |

``` shell
oms subscribe hears \ 
    -a pattern='*****' \ 
    -a channel='*****' \ 
    -e BOT_TOKEN=$BOT_TOKEN
```
,##### responds

> Triggered by direct messages to the bot
##### Action Arguments

| Argument Name | Type | Required | Default | Description |
|:------------- |:---- |:-------- |:--------|:----------- |
| pattern | `string` | `false` | None | A regexp pattern to filter messages |
| BOT_TOKEN | `string` | `false` | None | The Slack bot token |

``` shell
oms subscribe responds \ 
    -a pattern='*****' \ 
    -e BOT_TOKEN=$BOT_TOKEN
```

##### users

> 
##### Action Arguments

| Argument Name | Type | Required | Default | Description |
|:------------- |:---- |:-------- |:--------|:----------- |
| token | `string` | `false` | None | Authentication token bearing required scopes. Environment variable BOT_TOKEN used by default.  |
| include_locale | `boolean` | `false` | None | Set this to true to receive the locale for users. Defaults to false  |
| limit | `int` | `false` | None | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the users list hasn't been reached.  |
| cursor | `string` | `false` | None | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail.  |
| BOT_TOKEN | `string` | `false` | None | The Slack bot token |

``` shell
oms run users \ 
    -a token='*****' \ 
    -a include_locale='*****' \ 
    -a limit='*****' \ 
    -a cursor='*****' \ 
    -e BOT_TOKEN=$BOT_TOKEN
```

##### channels

> Get a list of channels
##### Action Arguments

| Argument Name | Type | Required | Default | Description |
|:------------- |:---- |:-------- |:--------|:----------- |
| token | `string` | `false` | None | Authentication token bearing required scopes. Environment variable BOT_TOKEN used by default.  |
| limit | `int` | `false` | None | Limit the number of channels to return. Must be less than 1000. |
| exclude_archived | `boolean` | `false` | None | Set to true to exclude archived channels from the list |
| types | `list` | `false` | None | Mix and match channel types: public_channel, private_channel, mpim, im Default is public_channel only.  |
| BOT_TOKEN | `string` | `false` | None | The Slack bot token |

``` shell
oms run channels \ 
    -a token='*****' \ 
    -a limit='*****' \ 
    -a exclude_archived='*****' \ 
    -a types='*****' \ 
    -e BOT_TOKEN=$BOT_TOKEN
```

##### directChannels

> Lists direct message channels for the calling user.
##### Action Arguments

| Argument Name | Type | Required | Default | Description |
|:------------- |:---- |:-------- |:--------|:----------- |
| token | `string` | `false` | None | Authentication token bearing required scopes. Environment variable BOT_TOKEN used by default.  |
| limit | `int` | `false` | None | Limit the number of channels to return. Must be less than 1000. |
| BOT_TOKEN | `string` | `false` | None | The Slack bot token |

``` shell
oms run directChannels \ 
    -a token='*****' \ 
    -a limit='*****' \ 
    -e BOT_TOKEN=$BOT_TOKEN
```

## Contributing

All suggestions in how to improve the specification and this guide are very welcome. Feel free share your thoughts in the Issue tracker, or even better, fork the repository to implement your own ideas and submit a pull request.

[![Edit slack on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/oms-services/slack)

This project is guided by [Contributor Covenant](https://github.com/oms-services/.github/blob/master/CODE_OF_CONDUCT.md). Please read out full [Contribution Guidelines](https://github.com/oms-services/.github/blob/master/CONTRIBUTING.md).

## Additional Resources

* [Install the CLI](https://github.com/microservices/oms) - The OMS CLI helps developers create, test, validate, and build microservices.
* [Example OMS Services](https://github.com/oms-services) - Examples of OMS-compliant services written in a variety of languages.
* [Example Language Implementations](https://github.com/microservices) - Find tooling & language implementations in Node, Python, Scala, Java, Clojure.
* [Storyscript Hub](https://hub.storyscript.io) - A public registry of OMS services.
* [Community Chat](https://spectrum.chat/open-microservices) - Have ideas? Questions? Join us on Spectrum.
