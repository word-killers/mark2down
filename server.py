#!/usr/bin/env python2

import web
import markdown

urls = (
    '/', 'Editor',
    '/markdown', 'Markdown'
)

app = web.application(urls, globals())
templates = web.template.render('templates')


class Editor:
    def GET(self):
        return templates.editor()


if __name__ == "__main__":
    app.run()

class Markdown:
    def POST(self):
        data = web.input()
        md = markdown.Markdown()
        return md.convert(data.text)