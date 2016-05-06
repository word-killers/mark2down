# Mark2Down
Online [Markdown](https://daringfireball.net/projects/markdown/) editor with some special features. Server-side is written in [Python](http://python.org/) using [web.py](http://webpy.org) library.

[![Build Status](https://travis-ci.org/word-killers/mark2down.svg?branch=master)](https://travis-ci.org/word-killers/mark2down)
[![codecov.io](https://codecov.io/github/word-killers/mark2down/coverage.svg?branch=master)](https://codecov.io/github/word-killers/mark2down?branch=master)

Live Demo: https://mark2down.herokuapp.com/

## Instalation & Development Server
Install Python 2 and virtualenv, e.g. on Debian:
```
# apt-get install python python-virtualenv
```
> The installation may differ on other systems.

Clone this repository
```
$ git clone https://github.com/word-killers/mark2down.git
```

Create a virtual environment and install dependencies:
```
$ virtualenv mark2down -p /usr/bin/python2
$ cd mark2down
$ source bin/activate
$ pip install -r requirements.txt
```

Run the development server:
- Make the server script executable:
```
$ chmod +x server.py
```

- Run without GitHub login:
```
$ ./server.py
```

- Or with GitHub login:
```
$ ./server.py 8080 <CLIENT_ID> <CLIENT_SECRET>
```
> Replace \<CLIENT_ID\> and \<CLIENT_SECRET\> with the values from GitHub OAuth [Application registration](https://github.com/settings/applications/new).

## Production Server
The configuration is similar to plain web.py (described [here](http://webpy.org/install#prod)) except the 'CLIENT_ID' and 'CLIENT_SECRET' values passed as command line arguments to the server script. As in the original configuration, Apache and Lighttpd servers are supported.

Example config for lighttpd:
```
server.port = 80
server.username = "http"
server.groupname = "http"
server.errorlog = "/var/log/lighttpd/error.log"
dir-listing.activate = "disable"

mimetype.assign = (
	".html" => "text/html",
	".txt" => "text/plain",
	".css" => "text/css",
	".js" => "application/x-javascript",
	".png" => "image/png",
	"" => "application/octet-stream"
)

server.modules = ("mod_fastcgi", "mod_rewrite")
server.document-root = "/srv/http/"
fastcgi.server = (
	"/server.py" => ((
		"socket" => "/tmp/fastcgi.socket",
		"bin-path" => "/srv/http/server.py 80 <CLIENT_ID> <CLIENT_SECRET>",
		"max-procs" => 1,
		"bin-environment" => (
			"REAL_SCRIPT_NAME" => ""
		),
		"check-local" => "disable"
	))
)

url.rewrite-once = (
	"^/favicon.ico$" => "/static/favicon.ico",
	"^/static/(.*)$" => "/static/$1",
	"^/(.*)$" => "/server.py/$1"
)
```
> Replace \<CLIENT_ID\> and \<CLIENT_SECRET\> with the values from GitHub OAuth [Application registration](https://github.com/settings/applications/new).
