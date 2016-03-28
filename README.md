# Mark2Down
Online Markdown editor with some special features. Server-side is written in [Python](http://python.org/) using [web.py](http://webpy.org) library.

[![Build Status](https://travis-ci.org/word-killers/mark2down.svg?branch=master)](https://travis-ci.org/word-killers/mark2down)
[![codecov.io](https://codecov.io/github/word-killers/mark2down/coverage.svg?branch=master)](https://codecov.io/github/word-killers/mark2down?branch=master)

Live Demo: https://mark2down.herokuapp.com/

## Instalation & Development Server
- Make sure that the right version of Python - __Python 2.x.x__ is installed:
```
> python --version
```
The output should be similar to this (the version might slightly differ):
```
Python 2.7.11
```

If not, you may use `python2` command instead or install the appropriate version.

- And clone this repository:
```
> git clone https://github.com/word-killers/mark2down.git
> cd mark2down
```

- Next, install required dependencies:

```
> pip install -r requirements.txt
```
> Note: Pip for Python 2 is required. ([Install howto](https://pip.pypa.io/en/stable/installing/))

- Now, you should be able to run the development server.
  - On Linux/Mac/UN*X:

```
> cd mark2down
> chmod +x server.py
> ./server.py
```

  - On Windows:
```
> python server.py
```

The server should be running on http://localhost:8080/.

## Production Server
The steps are almost the same but instead of running the server from the python script, clone the project to the server root and run the web server. Server setup for Apache, Nginx and Lighttpd is described in [web.py 
documentation](http://webpy.org/install#prod).
