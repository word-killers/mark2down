#!/usr/bin/env python2

import sys
import re
import os

import subprocess
import web

import markdown
import alignment_extension
import graph_com_ann_extension
import highlight_extension
from markdown.extensions.toc import TocExtension
from requests import get

import auth

# read client_id and client_secret from CLI, otherwise set to 0 (causes credentials err.)
if len(sys.argv) == 4:
    client_id = sys.argv[2]
    client_secret = sys.argv[3]
else:
    client_id = 0
    client_secret = 0

    print """
Warning: Bad arguments.
Usage: ./server.py <PORT> <OAUTH_CLIENT_ID> <OAUTH_CLIENT_SECRET>
Application will run without OAuth (no ability to log in).
"""

# OAuth scopes (permissions)
scopes = ['repo', 'user']

# URL handling
urls = (
    '/', 'Index',
    '/markdown', 'Markdown',
    '/auth', 'Auth',
    '/test', 'Test',
    '/list-repos', 'List_repos',
    '/list-repo-tree', 'List_repo_tree',
    '/commit-file', 'Commit_file',
    '/get-file', 'Get_file',
    '/create-file', 'Create_file',
    '/set-repo-name', 'Set_repo_name',
    '/logout', 'Logout'
)

# Application setup
app = web.application(urls, locals())
templates = web.template.render('templates')
web.config.debug = False  # Must be disabled because conflicts with sessions (disable only temporarily)

if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore('sessions'),
                                  initializer={'token': None, 'repository': None, 'userName' : None, 'openFile': None})
    web.config._session = session
else:
    session = web.config._session


# Session setup



class Index:
    def GET(self):
        login_link = auth.generate_auth_link(client_id, scopes)
        data = [
            [
                ["share", "<i class=\"fa fa-share-alt\"></i> Share", "id='btnShare'"],
                ["export", "<i class=\"fa fa-download\"></i> Export", "onclick='exportDocument()' id='btnExport'"],
                ["print", "<i class=\"fa fa-print\"></i> Print", "onclick='printDocument()' id='btnPrint'"],
                ["login", "<i class=\"fa fa-user\"></i> Login",
                 'onclick="login(\'' + login_link + '\')" id="btnLogin"'],
                ["help", "<i class=\"fa fa-info-circle\"></i>",
                 'onclick="window.open(\'https://github.com/word-killers/mark2down/wiki/U%C5%BEivatelsk%C3%A1-dokumentace\')\" id="btnHelp"'],
                ["", 'set Repo', 'onClick="getRepos()"'],
                ["", 'Commit', 'onClick="commit()"'],
                ["", 'new File', 'onClick="newFileDialog()"'],
                ["", 'logout', 'onClick="logout()"']
            ], [
                ["Heading 1", "H1", "onclick=\"putChar('# ', 2)\" id='btnH1'"],
                ["Heading 2", "H2", "onclick=\"putChar('## ', 3)\" id='btnH2'"],
                ["Heading 3", "H3", "onclick=\"putChar('### ', 4)\" id='btnH3'"],
                ["Heading 4", "H4", "onclick=\"putChar('#### ', 5)\" id='btnH4'"],
                ["Heading 5", "H5", "onclick=\"putChar('##### ', 6)\" id='btnH5'"],
                ["Heading 6", "H6", "onclick=\"putChar('###### ', 7)\" id='btnH6'"],
            ], [
                ["Bold", "<i class=\"fa fa-bold\"></i>", "onclick=\"putChar('++  ++', 3)\" id='btnBold'"],
                ["Italic", "<i class=\"fa fa-italic\"></i>", "onclick=\"putChar('~~  ~~', 3)\" id='btnItalic'"],
                ["Underline", "<i class=\"fa fa-underline\"></i>",
                 "onclick=\"putChar('__  __', 3)\" id='btnUnderline'"],
                ["StrikeThrough", "<i class=\"fa fa-strikethrough\"></i>",
                 "onclick=\"putChar('--  --', 3)\" id='btnStrikeThrough'"],
                ["typewriting", "T", "onclick=\"putChar('```  ```', 4)\" id='btnTypewriting'"],
            ], [
                ["align-left", "<i class=\"fa fa-align-left\"></i>",
                 "onclick=\"putChar('{{\\n', 3)\" id='btnAlignLeft'"],
                ["align-center", "<i class=\"fa fa-align-center\"></i>",
                 "onclick=\"putChar('}{\\n', 3)\" id='btnAlignCenter'"],
                ["align-block", "<i class=\"fa fa-align-justify\"></i>",
                 "onclick=\"putChar('{}\\n', 3)\" id='btnAlignBlock'"],
                ["align-right", "<i class=\"fa fa-align-right\"></i>",
                 "onclick=\"putChar('}}\\n', 3)\" id='btnAlignRight'"],
            ], [
                ["cislovany seznam", "<i class=\"fa fa-list-ol\"></i>",
                 "onclick=\"putChar('1. ', 3)\" id='btnNumerate'"],
                ["odrazkovy seznam", "<i class=\"fa fa-list-ul\"></i>", "onclick=\"putChar('- ', 2)\" id='btnList'"],
            ], [
                ["table", "<i class=\"fa fa-table\"></i>", "id=\"tableButton\" onclick=\"createTable(6, 3)\""],
                ["include", "<i class=\"fa fa-paperclip\"></i>", " onclick=\"putChar('{!  !}',3)\" id='btnInclude'"],
                ["image", "<i class=\"fa fa-file-photo-o\"></i>",
                 " onclick='putChar(\"![alt text](image path \\\"Tooltip text\\\")\", 27)' id='btnImage'"],
                ["graph", "<i class=\"fa fa-bar-chart\"></i>",
                 "onclick=\"putChar('```graph\\n\\n```', 10)\" id='btnGraph'"],
                ["code", "<i class=\"fa fa-code\"></i>", "onclick=\"putChar('```\\n\\t\\n```', 5)\" id='btnCode'"]
            ], [
                ["preview", "Preview", "id=\"previewOpen\""],
                ["render", 'Render Mermaid', "onclick='switchMermaid();' id='mermaidBtn'"]
            ]
        ]
        return templates.index(data)


class Markdown:
    def POST(self):
        data = web.input()
        graph_com_ann_ext = graph_com_ann_extension.Extensions(data['final'], data['annotations'].split(',,,'))
        highlight_ext = highlight_extension.HighlightExtension()
        alignment_ext = alignment_extension.Extensions()
        md = markdown.Markdown(safe_mode='escape', extensions=[
            'markdown_include.include',  # option to include other files
            graph_com_ann_ext,  # graph, comment, annotation
            highlight_ext,  # strong, italic, underline, cross
            alignment_ext,  # alignment
            'markdown.extensions.tables',  # tables
            'markdown.extensions.sane_lists',  # using lists like in normal mardkown
            TocExtension(slugify=self.code, separator='-')  # table of contents
        ])

        data = '<?xml version="1.0" encoding="utf-8" ?><reply><preview><div id="documentView">' + md.convert(data[
                                                                                                                 'data']) + '</div></preview><toc>' + md.toc + '</toc><comments>' + graph_com_ann_ext.comment_list + '</comments><annotations>' + graph_com_ann_ext.annotation_strings + '</annotations></reply>'
        return data

    def code(self, value, separator):
        value = re.sub(r"[^\w\s]", '', value)
        value = re.sub(r"\s+", '-', value)
        return 'header' + separator + value


class Set_repo_name:
    def POST(self):
        data = web.input()
        print session.userName
        print session.token
        if data.get('userName') is None:
            return session.get('userName') is not None or session.get('token') is None
        else:
            session.userName = data.get('userName')
        return ''


class Auth:
    def GET(self):
        query = web.input()
        if 'code' in query:
            token = auth.get_auth_token(client_id, client_secret, query['code'])

            if token is None:
                return 'Login failed - no access token received.'

            session.token = token
            raise web.seeother('/')  # redirect users back to the editor
        else:
            return 'Login failed - no auth. code received.'

class Logout:
    def POST(self):
        session.repository = None
        session.token = None
        session.userName = None
        session.openFile = None

class List_repos:
    def POST(self):
        if session.get('token') is not None:
            data = web.input().get('name')
            if data is not None:
                session.repository = data
                Create_repo(session.token)
            else:
                response = get(
                    'https://api.github.com/users/{0}/repos'.format(session.userName),
                    headers={
                        'Accept': 'application/json'
                    }
                )
                json = response.json()
                repo = ''
                if len(json):
                    for one in json:
                        if 'name' in one:
                            repo += '<button onClick="setRepo(\'{0}\')">{0}</button>'.format(one['name'])

                    if repo is not '':
                        return '<div>' + repo + '</div>'
                    else:
                        return 'can\'t display repositories.'

            return ''


class List_repo_tree:
    def POST(self):
        if session.get('token') is not None:
            return self.getDirTree('')

    def getDirTree(self, path):
        list = '<ul>'

        long_path = 'repositories/{0}/{1}/{2}'.format(session.token, session.repository, path)
        for file in os.listdir(long_path):
            if file != '.git':
                if len(path) == 0:
                    new_path = file
                else:
                    new_path = path + '/' + file

                if os.path.isdir(os.path.join(long_path, file)):
                    list += '<li>' + file + self.getDirTree(new_path) + '</li>'
                else:
                    list += '<li onClick="getFile(\'{0}\');">{1}</li>'.format(new_path, file)
        print session.get('repository')
        return list + '</ul>'


class Commit_file:
    def POST(self):
        if session.get('token') is not None and session.get('openFile') is not None:

            if os.path.exists("repositories/{0}".format(session.get('token'))):
                out = open(
                    "repositories/{0}/{1}/{2}".format(session.get('token'), session.repository,
                                                      session.get('openFile').encode(encoding='UTF-8')), "w")
                out.write(web.input().get('data').encode(encoding="UTF-8"))
                out.close()

            result = subprocess.check_output(
                "cd repositories/{0}/{3} && (git pull https://{0}@github.com/{2}/{3}.git || exit /b 0) && git add * && git commit -m {1} && git push https://{0}@github.com/{2}/{3}.git || exit /b 0 ".format(
                    session.get('token'), "rewrite " + session.get('openFile').encode(encoding='UTF-8'),
                    session.userName, session.repository
                ), shell=True, stderr=subprocess.STDOUT)
        return result


class Get_file:
    def POST(self):
        if session.get('token') is not None:
            data = web.input()
            text = ""
            if data.get('fileName'):
                if data['fileName'].find('..') is -1:
                    file = open(
                        "repositories/{0}/{1}/{2}".format(session.get('token'), session.repository,
                                                          data['fileName'].encode(encoding='UTF-8')), "r")
                    text = file.read()
                    session.openFile = data['fileName']
            return text


class Create_file:
    def POST(self):
        if session.get('token') is not None:
            data = web.input()
            if data.get('fileName') and data['fileName'].find('..') is -1:
                open("repositories/{0}/{1}/{2}".format(session.get('token'), session.repository,
                                                       data['fileName'].encode(encoding='UTF-8')), "a").close()
                session.openFile = data['fileName']
            return ''


class Create_repo:
    def __init__(self, token):
        print 'Testing folder'
        if not os.path.exists('repositories/{0}'.format(token)):
            os.makedirs('repositories/{0}'.format(token))
        if not os.path.exists('repositories/{0}/{1}'.format(token, session.repository)):
            os.system("cd repositories/{0} && git clone https://{0}@github.com/{1}/{2}.git".format(
                token, session.userName, session.repository  # TODO
            ))


if __name__ == "__main__":
    app.run()
