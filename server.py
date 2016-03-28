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
        data = [
            [
                ["share", "<i class=\"fa fa-share-alt\"></i> Share", ""],
                ["export", "<i class=\"fa fa-download\"></i> Export",""],
                ["login", "<i class=\"fa fa-user\"></i> Login", ""]
            ], [
                ["back", "<i class=\"fa fa-rotate-left\"></i>", ""],
                ["forward", "<i class=\"fa fa-rotate-right\"></i>", ""]
            ], [
                ["Heading 1", "H1", "onclick=\"putChar('# ', false)\""],
                ["Heading 2", "H2", "onclick=\"putChar('## ', false)\""],
                ["Heading 3", "H3", "onclick=\"putChar('### ', false)\""],
                ["Heading 4", "H4", "onclick=\"putChar('#### ', false)\""],
                ["Heading 5", "H5", "onclick=\"putChar('##### ', false)\""],
                ["Heading 6", "H6", "onclick=\"putChar('###### ', false)\""],
            ], [
                ["Bold", "<i class=\"fa fa-bold\"></i>", "onclick=\"putChar('__  __', true)\""],
                ["Italic", "<i class=\"fa fa-italic\"></i>", "onclick=\"putChar('_  _', true)\""],
                ["Underline", "<i class=\"fa fa-underline\"></i>", "onclick=\"putChar('++  ++', true)\""],
                ["StrikeThrough", "<i class=\"fa fa-strikethrough\"></i>", "onclick=\"putChar('~~  ~~', true)\""],
                ["typewriting", "T", "onclick=\"putChar('```  ```', true)\""],
            ], [
                ["align-left", "<i class=\"fa fa-align-left\"></i>", "onclick=\"putChar('<<\\n')\""],
                ["align-center", "<i class=\"fa fa-align-center\"></i>", "onclick=\"putChar('><\\n')\""],
                ["align-block", "<i class=\"fa fa-align-justify\"></i>", "onclick=\"putChar('<>\\n')\""],
                ["align-right", "<i class=\"fa fa-align-right\"></i>", "onclick=\"putChar('>>\\n')\""],
            ], [
                ["cislovany seznam", "<i class=\"fa fa-list-ol\"></i>", "onclick=\"putChar('1. ', false)\""],
                ["odrazkovy seznam", "<i class=\"fa fa-list-ul\"></i>", "onclick=\"putChar('- ', false)\""],
            ], [
                ["table", "<i class=\"fa fa-table\"></i>", "id=\"tableButton\" onclick=\"createTable(6, 3)\""],
                ["include", "<i class=\"fa fa-paperclip\"></i>", ""],
                ["graph", "<i class=\"fa fa-bar-chart\"></i>", ""],
                ["code", "<i class=\"fa fa-code\"></i>", "onclick=\"putChar('```  ```', true)\""]
            ]
        ]
        return templates.index(data)


if __name__ == "__main__":
    app.run()

class Markdown:
    def POST(self):
        data = web.input()
        md = markdown.Markdown()
        return md.convert(data['data'])


class Auth:
    def POST(self):
        token = web.input().auth
        pass
