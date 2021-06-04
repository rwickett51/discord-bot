### Build

docker build . -t degenbot

### Run

##### Windows

`docker run -it --volume "%cd%":/app degenbot`

##### Linux

`docker run -it --volume (pwd):/app degenbot`
