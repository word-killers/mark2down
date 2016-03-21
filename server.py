#!/usr/bin/env python2

import web
import markdown

urls = (
	'/', 'Index',
	'/markdown', 'Markdown',
	'/auth', 'Auth'
)

app = web.application(urls, globals())
templates = web.template.render('templates')


class Index:
	def GET(self):
		return templates.index()


if __name__ == "__main__":
	app.run()

class Markdown:
	def POST(self):
		data = web.input()
		md = markdown.Markdown()
		return md.convert(data.text)

class Auth:
	def POST(self):
		token = web.input().auth
		pass
