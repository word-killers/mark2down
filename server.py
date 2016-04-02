#!/usr/bin/env python2

import web
import markdown
import extension

urls = (
	'/', 'Index',
	'/markdown', 'Markdown',
	'/auth', 'Auth',
    '/test', 'Test'
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
                ["Heading 1", "H1", "onclick=\"putChar('# ', 2)\""],
                ["Heading 2", "H2", "onclick=\"putChar('## ', 3)\""],
                ["Heading 3", "H3", "onclick=\"putChar('### ', 4)\""],
                ["Heading 4", "H4", "onclick=\"putChar('#### ', 5)\""],
                ["Heading 5", "H5", "onclick=\"putChar('##### ', 6)\""],
                ["Heading 6", "H6", "onclick=\"putChar('###### ', 7)\""],
            ], [
                ["Bold", "<i class=\"fa fa-bold\"></i>", "onclick=\"putChar('__  __', 3)\""],
                ["Italic", "<i class=\"fa fa-italic\"></i>", "onclick=\"putChar('_  _', 2)\""],
                ["Underline", "<i class=\"fa fa-underline\"></i>", "onclick=\"putChar('++  ++', 3)\""],
                ["StrikeThrough", "<i class=\"fa fa-strikethrough\"></i>", "onclick=\"putChar('~~  ~~', 3)\""],
                ["typewriting", "T", "onclick=\"putChar('```  ```', 4)\""],
            ], [
                ["align-left", "<i class=\"fa fa-align-left\"></i>", "onclick=\"putChar('<<\\n', 3)\""],
                ["align-center", "<i class=\"fa fa-align-center\"></i>", "onclick=\"putChar('><\\n', 3)\""],
                ["align-block", "<i class=\"fa fa-align-justify\"></i>", "onclick=\"putChar('<>\\n', 3)\""],
                ["align-right", "<i class=\"fa fa-align-right\"></i>", "onclick=\"putChar('>>\\n', 3)\""],
            ], [
                ["cislovany seznam", "<i class=\"fa fa-list-ol\"></i>", "onclick=\"putChar('1. ', 3)\""],
                ["odrazkovy seznam", "<i class=\"fa fa-list-ul\"></i>", "onclick=\"putChar('- ', 2)\""],
            ], [
                ["table", "<i class=\"fa fa-table\"></i>", "id=\"tableButton\" onclick=\"createTable(6, 3)\""],
                ["include", "<i class=\"fa fa-paperclip\"></i>", ""],
                ["graph", "<i class=\"fa fa-bar-chart\"></i>", "onclick=\"putChar('````graph\\n\\n```', 10)\""],
                ["code", "<i class=\"fa fa-code\"></i>", "onclick=\"putChar('```\\n\\t\\n```', 5)\""]
            ]
        ]
        return templates.index(data)


if __name__ == "__main__":
    app.run()

class Markdown:
    def POST(self):
        data = web.input()
        print data
        md = markdown.Markdown(extensions=
                               [extension.Extensions(),
                                'markdown.extensions.tables',   #tables
                                'markdown.extensions.sane_lists', #using lists like in normal mardkown
                                #'markdown_include.include' #option to include other files
                                ])
        return md.convert(data['data'])

class Test:
    def GET(self):
        return templates.test()

class Auth:
    def POST(self):
        token = web.input().auth
        pass
