### Introduction

A Discord Bot that does whatever I want it to do.

### Features

- Music Commands
  - Play
  - Pause
  - Remove
  - Skip
  - Disconnect
- Dad Jokes
- Auto Role (Bots and Humans)
- Random Dice

### Prerequisites

.ENV file with following keys
- YOUTUBE_API_KEY
- BOT_LOGIN
- MEME_USERNAME
- MEME_PASSWORD
- DAD_JOKE_API_KEY


### Build

docker build . -t degenbot

### Run

##### Windows

`docker run -it --volume "%cd%":/app degenbot`

##### Linux

`docker run -it --volume (pwd):/app degenbot`
