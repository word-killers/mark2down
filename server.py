#!/usr/bin/env python2

import web

urls = (
	'/', 'Editor'
)

app = web.application(urls, globals())
templates = web.template.render('templates')

class Editor:
	def GET(self):
		return templates.editor()

if __name__ == "__main__":
	app.run()
