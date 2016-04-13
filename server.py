#!/usr/bin/env python2

import sys

import web, urllib, requests
import markdown
import alignment_extension
import graph_com_ann_extension
import highlight_extension
from markdown.extensions.toc import TocExtension
import re

# read client_id and client_secret from CLI, otherwise set to 0 (causes credentials err.)
if len(sys.argv) == 4:
    client_id = sys.argv[2]
    client_secret = sys.argv[3]
else:
    client_id = 0
    client_secret = 0

    print  """
	Warning: Bad arguments.
	Usage: ./server.py <PORT> <OAUTH_CLIENT_ID> <OAUTH_CLIENT_SECRET>
	Application will run without OAuth (no ability to login).
	"""

# OAuth scopes (permissions)
scopes = ['repo', 'user']

# URL handling
urls = (
    '/', 'Index',
    '/markdown', 'Markdown',
    '/auth', 'Auth',
    '/test', 'Test'
)

# Application setup
app = web.application(urls, globals())
templates = web.template.render('templates')
# web.config.debug = False # disable debug mode because of sessions support

# Session setup
session = web.session.Session(
    app,
    web.session.DiskStore('sessions'),
    initializer={
        'access_token': 0
    }
)


class Index:
    def GET(self):
        login_link = "https://github.com/login/oauth/authorize?" + urllib.urlencode({
            "client_id": client_id,
            "scope": ','.join(scopes)
        })
        data = [
            [
                ["share", "<i class=\"fa fa-share-alt\"></i> Share", ""],
                ["export", "<i class=\"fa fa-download\"></i> Export", "onclick='downloadHTML()'"],
                ["print", "<i class=\"fa fa-print\"></i> Print", "onclick='print()'"],
                ["login", "<i class=\"fa fa-user\"></i> Login", 'onclick="location.href=\'' + login_link + '\'"']
            ], [
                ["Heading 1", "H1", "onclick=\"putChar('# ', 2)\""],
                ["Heading 2", "H2", "onclick=\"putChar('## ', 3)\""],
                ["Heading 3", "H3", "onclick=\"putChar('### ', 4)\""],
                ["Heading 4", "H4", "onclick=\"putChar('#### ', 5)\""],
                ["Heading 5", "H5", "onclick=\"putChar('##### ', 6)\""],
                ["Heading 6", "H6", "onclick=\"putChar('###### ', 7)\""],
            ], [
                ["Bold", "<i class=\"fa fa-bold\"></i>", "onclick=\"putChar('++  ++', 3)\""],
                ["Italic", "<i class=\"fa fa-italic\"></i>", "onclick=\"putChar('~~  ~~', 3)\""],
                ["Underline", "<i class=\"fa fa-underline\"></i>", "onclick=\"putChar('__  __', 3)\""],
                ["StrikeThrough", "<i class=\"fa fa-strikethrough\"></i>", "onclick=\"putChar('--  --', 3)\""],
                ["typewriting", "T", "onclick=\"putChar('```  ```', 4)\""],
            ], [
                ["align-left", "<i class=\"fa fa-align-left\"></i>", "onclick=\"putChar('{{\\n', 3)\""],
                ["align-center", "<i class=\"fa fa-align-center\"></i>", "onclick=\"putChar('}{\\n', 3)\""],
                ["align-block", "<i class=\"fa fa-align-justify\"></i>", "onclick=\"putChar('{}\\n', 3)\""],
                ["align-right", "<i class=\"fa fa-align-right\"></i>", "onclick=\"putChar('}}\\n', 3)\""],
            ], [
                ["cislovany seznam", "<i class=\"fa fa-list-ol\"></i>", "onclick=\"putChar('1. ', 3)\""],
                ["odrazkovy seznam", "<i class=\"fa fa-list-ul\"></i>", "onclick=\"putChar('- ', 2)\""],
            ], [
                ["table", "<i class=\"fa fa-table\"></i>", "id=\"tableButton\" onclick=\"createTable(6, 3)\""],
                ["include", "<i class=\"fa fa-paperclip\"></i>", ""],
                ["graph", "<i class=\"fa fa-bar-chart\"></i>", "onclick=\"putChar('```graph\\n\\n```', 10)\""],
                ["code", "<i class=\"fa fa-code\"></i>", "onclick=\"putChar('```\\n\\t\\n```', 5)\""]
            ], [
                ["preview", "Preview", "id=\"previewOpen\""]
            ]
        ]
        return templates.index(data)


class Markdown:
    def POST(self):
        data = web.input()
        graph_com_ann_ext = graph_com_ann_extension.Extensions(data['final'], data['annotations'].split(',,,'))
        highlight_ext = highlight_extension.HighlightExtension()
        alignment_ext = alignment_extension.Extensions()
        md = markdown.Markdown(safe_mode='escape', extensions=
        [graph_com_ann_ext,  # graph, comment, annotation
         highlight_ext,  # strong, italic, underline, cross
         alignment_ext,  # alignment
         'markdown.extensions.tables',  # tables
         'markdown.extensions.sane_lists',  # using lists like in normal mardkown
         TocExtension(slugify=self.code, separator='-'),  # table of contents
         'markdown_include.include'  # option to include other files
         ])

        data = '<?xml version="1.0" encoding="utf-8" ?><reply><preview>' + md.convert(data[
                                                                                          'data']) + '</preview><toc>' + md.toc + '</toc><comments>' + graph_com_ann_ext.comment_list + '</comments><annotations>'+graph_com_ann_ext.annotation_list+'</annotations></reply>'
        return data

    def code(self, value, separator):
        value = re.sub(r"[^\w\s]", '', value)
        value = re.sub(r"\s+", '-', value)
        return 'header' + separator + value


class Auth:
    def GET(self):
        input = web.input()
        if 'code' in input:
            response = requests.post(
                'https://github.com/login/oauth/access_token',
                data={
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'code': input.code
                },
                headers={
                    'Accept': 'application/json'
                }
            )
            json = response.json()
            if 'access_token' in json:
                session.access_token = json['access_token']
                raise web.seeother('/')
            else:
                return "Failed to get the access token"
        else:
            return "Failed to get the access code"


if __name__ == "__main__":
    app.run()
