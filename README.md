# Mark2Down
Online [Markdown](https://daringfireball.net/projects/markdown/) editor with some special features. Server-side is written in [Python](http://python.org/) using [web.py](http://webpy.org) library.

[![Build Status](https://travis-ci.org/word-killers/mark2down.svg?branch=master)](https://travis-ci.org/word-killers/mark2down)
[![codecov.io](https://codecov.io/github/word-killers/mark2down/coverage.svg?branch=master)](https://codecov.io/github/word-killers/mark2down?branch=master)

Live Demo: https://mark2down.herokuapp.com/

## Instalation & Development Server
 - Install Python 2 and virtualenv, e.g. on Debian:
```
# apt-get install python python-virtualenv
```
The installation may differ on other systems.

- Clone this repository
```
$ git clone https://github.com/word-killers/mark2down.git
```

- Create a virtual environment and install dependencies
```
$ virtualenv mark2down -p /usr/bin/python2
$ cd mark2down
$ source bin/activate
$ pip install -r requirements.txt
```



## Production Server
