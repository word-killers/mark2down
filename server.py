import sys
import re
import os

import json

import subprocess
import web

from requests import get
from shutil import copy

import auth
import time
import requests
from requests_oauthlib import OAuth1

from mistune_contrib.toc import TocMixin
import mistune
from xml.dom import minidom
from xml.parsers.expat import ExpatError
from web import http


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
scopes = ['repo', 'user', 'user:email']

# URL handling
urls = (
    '/', 'Index',
    '/markdown', 'Markdown',
    '/auth', 'Auth',
    '/test', 'Test',
    '/list-repos', 'List_repos',
    '/list-repo-tree', 'List_repo_tree',
    '/save-file', 'Save_file',
    '/commit-file', 'Commit_file',
    '/get-file', 'Get_file',
    '/create-file', 'Create_file',
    '/create-dir', 'Create_dir',
    '/set-repo-name', 'Set_repo_name',
    '/logout', 'Logout',
    '/merge', 'Merge',
    '/status', 'Status',
    '/reset-repo', 'Reset_repo',
    '/get-css', 'Get_css',
    '/login', 'Login', 
    '/create-branch', 'Create_branch',
    '/delete', 'Delete',
    '/list-branches', 'List_branches',
    '/title', 'Title',
    '/modified', 'Modified',
    '/commit', 'Commit',
    '/push', 'Push',
    '/fetch', 'Fetch',
    "/css/(.*)", 'Css'
)

# Application setup
app = web.application(urls, locals())
templates = web.template.render('templates')
web.config.debug = False  # Must be disabled because conflicts with sessions (disable only temporarily)
AUTHORIZATION_NOTE = "MARK2DOWN_AUTHORIZATION_NOTE"

# Session setup
if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore('sessions'),
                                  initializer={'token': None, 'repository': None, 'userName': None, 'openFile': None})
    web.config._session = session
else:
    session = web.config._session


class TocRenderer(TocMixin, mistune.Renderer):
    pass
    
class Login:
    def POST(self):
        data = web.input()
        auth = GitHub().authorize(data['username'], data['password'])
        if auth is not None:
            raise web.seeother('/')
        else :
            raise web.Unauthorized()

                
class Index:
    """
    Render main window of application.
    """

    def GET(self):
        if (web.ctx.env.get('SERVER_PORT') == '8080'):
            #if port is 8080 we are in develope or try mode
            logUrl = ("http://%s/login" % web.ctx.env.get('HTTP_HOST'))
        else:
            #production mode
            logUrl = ("https://%s/login" % web.ctx.env.get('HTTP_HOST'))
        data = [
            [
                ["export", "<i class=\"fa fa-download\"></i> Export", "onclick='exportDocument()' id='btnExport'"],
                ["print", "<i class=\"fa fa-print\"></i> Print", "onclick='printDocument()' id='btnPrint'"],
                ["login", "<i class=\"fa fa-user\"></i> Login",
                 'onclick="openLoginDialog()" id="btnLogin"'],
                ["logout", '<i class=\"fa fa-user\"></i> Logout', 'onClick="logout()" id="btnLogout"'],
                ["help", "<i class=\"fa fa-info-circle\"></i>",
                 'onclick="window.open(\'https://github.com/word-killers/mark2down/wiki/U%C5%BEivatelsk%C3%A1-dokumentace\')\" id="btnHelp"']
            ], [
                ["Heading 1", "H1", "onclick=\"putChar('# ', 2)\" id='btnH1'"],
                ["Heading 2", "H2", "onclick=\"putChar('## ', 3)\" id='btnH2'"],
                ["Heading 3", "H3", "onclick=\"putChar('### ', 4)\" id='btnH3'"],
                ["Heading 4", "H4", "onclick=\"putChar('#### ', 5)\" id='btnH4'"],
                ["Heading 5", "H5", "onclick=\"putChar('##### ', 6)\" id='btnH5'"],
                ["Heading 6", "H6", "onclick=\"putChar('###### ', 7)\" id='btnH6'"],
                
            ], [
            
                ["<HR>", "HR", "onclick=\"putChar('\\n___ \\n', 6)\" id='hr'"],
            ],
            [
                ["Bold", "<i class=\"fa fa-bold\"></i>", "onclick=\"putChar('**  **', 3)\" id='btnBold'"],
                ["Italic", "<i class=\"fa fa-italic\"></i>", "onclick=\"putChar('_  _', 2)\" id='btnItalic'"],
                ["Bold Italic", "<i class=\"fa fa-bold-italic\">BI</i>",
                 "onclick=\"putChar('**_  _**', 4)\" id='btnUnderline'"],
                ["StrikeThrough", "<i class=\"fa fa-strikethrough\"></i>",
                 "onclick=\"putChar('~~~~', 2)\" id='btnStrikeThrough'"],
                ["typewriting", "T", "onclick=\"putChar('```  ```', 4)\" id='btnTypewriting'"],
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
            ], [
                ["set repository", 'Set repo', 'onClick="getRepos()" id="btnSetRepo"'],
                ["set branch", 'Set branch', 'onClick="getBranches()" id="btnSetBranch"'],
                ["commit", 'Commit', 'onClick="commitDialog()" id="btnCommit"'],
                ["push", 'Push', 'onClick="push()" id="btnPush"'],
                ["merge", 'Merge', 'onClick="mergeDialog()" id="btnMerge"'],
                ["fetch", 'Fetch', 'onClick="fetchDialog()" id="btnFetch"']
            ], [
                ["create new file", 'New file', 'onClick="newFileDialog()" id="btnNewFile"'],
                ["create new file", 'New dir', 'onClick="newDirDialog()" id="btnNewDir"'],
                ["save", 'Save', 'onClick="save()" id="btnSave"'],
                ["save", 'Delete', 'onClick="deleteDialog()" id="btnDelete"']
            ]
        ]
        return templates.index(data, logUrl, time.time(), Css().css())


class Markdown:
    """
    Convert markdown text to html text.
    """
        
    def POST(self):
        data = web.input()
        toc = TocRenderer()
        toc.options = {'escape' : True, 'hard_wrap' : True, 'use_xhtml' : True}
        md = mistune.Markdown(renderer=toc)
        toc.reset_toc() 
        dd = md.parse(data['data'])
        rv = toc.render_toc(level=4)
        re_itm = re.search(r'<li>', rv)
        if not(re.search(r'<li>', rv)):
            rv = re.sub(r'<\/li>', '',  rv)
        try:
            rr = minidom.parseString(rv)
        except ExpatError as exc:
            rv = re.sub(r'<\/ul>\n<\/li>', '',  rv)
            rv = re.sub(r'<ul>', '</li>',  rv)
        data = '<?xml version="1.0" encoding="utf-8" ?>\n<reply>\n<preview>\n<div id="documentView" class="markdown-body">\n' + dd + '\n</div>\n</preview>\n<toc>\n' + rv + '\n</toc>\n<comments>\n</comments>\n<annotations>\n</annotations>\n</reply>'
        return data

    def code(self, value, separator):
        value = re.sub(r"[^\w\s]", '', value)
        value = re.sub(r"\s+", '-', value)
        return 'header' + separator + value


class Logout:
    """
    Using for logout users.
    """

    def POST(self):
        session.repository = None
        session.token = None
        session.userName = None
        session.openFile = None
        session.branch = None

class Css:
    def GET(self, file):
        web.header('Content-Type', 'text/css')
        if session.get('userName') is not None:
            if session.get('repository') is not None:
                path = 'repositories/{0}/{1}/css/{2}'.format(session.userName, session.repository, file)
                if os.path.exists(path):
                    return open(path, "r").read()
                
        return open('repositories/support_files/style.css', "r").read()
   
    def css(self):
        if session.get('userName') is not None:
            if session.get('repository') is not None:
                path = 'repositories/{0}/{1}/css'.format(session.userName, session.repository)
                if os.path.exists(path):
                    files = [f for f in os.listdir(path) if f.lower().endswith(('.css'))]
                    for f in files:
                        if(f == "default.css"):
                            return files
                    files.append("default.css")
                    return files
                else :
                    print("path dont exist {0}".format(path))
        print "files failed"
        return []
                
class Get_css:
    """
    Return css from repository or default.
    """

    def POST(self):
        if session.get('token') is not None:
            if session.get('repository') is not None:
                path = 'repositories/{0}/{1}/css/style.css'.format(session.userName, session.repository)
                if os.path.exists(path):
                    return open(path, "r").read()

        return open('repositories/support_files/style.css', "r").read()


# repository -----------------------------------------------------------------------------------------------------------


class Set_repo_name:
    """
    Set name of user or team which have repositories.
    """

    def POST(self):
        data = web.input()
        if data.get('userName') is None:
            return session.get('token') is not None
        else:
            session['userName'] = data.get('userName')
            session.repository = None
            session.branch = None
        return 'ok'


class List_repos:
    """
    If post is empty return list of users repositories else set repository to value if post.
    """

    def POST(self):
        if session.get('token') is not None:
            data = web.input().get('name')
            if data is not None:
                session.repository = data
                Create_repo(session.userName)
                session.branch = Branches().currentName()
            else:
                response = get(  # github have limit to 60 requests
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
                            repo += '<button class="btnRepositories" onClick="setRepo(\'{0}\')">{0}</button>'.format(
                                one['name'])

                    if repo is not '':
                        return '<div>' + repo + '</div>'
                    else:
                        return 'can\'t display repositories.'

        return 'can\'t display repositories.'


class Create_branch:
    def GET(self):
        dd = Branches().getAll()
        html = "<div><form id=\"createBranchForm\" action=\"#\">"
        html += "<input type=\"text\" name=\"newBranch\" id=\"newBranchTextField\" />"
        html += "</form></div><br/>"
        html += "<div><button class=\"btnBranches\" onClick=\"createNewBranch()\" >create branch</button></div><hr />"
        
        for d in dd:
            if(d['selected']):
                html += "<div class=\"lblBranches selectedBranch\" >{0}</div>".format(d['name'])
            else :
                 html += "<div class=\"lblBranches\" >{0}</div>".format(d['name'])
        return html
    def POST(self):
        data = web.input();
        result = subprocess.check_output(
                "cd repositories/{0}/{1} && git branch --no-track {2} || exit 0 ".format(
                    session.userName, session.repository, data['branch']
                ), shell=True, stderr=subprocess.STDOUT)
        print(" result = {0}".format(result))
        if(re.search(r'fatal:', result)):
            print("error occurted")
            raise web.BadRequest(result)
        else :
            result = subprocess.check_output(
                    "cd repositories/{0}/{1} && git checkout {2}  || exit 0 ".format(
                        session.userName, session.repository, data['branch']
                    ), shell=True, stderr=subprocess.STDOUT)
                    
        session.branch = data['branch']
        return "branch = {0}<br/>{1}".format(data['branch'], result)
        
class List_branches:
    def GET(self):
        data = web.input()
        dd = Branches().getAll()
        html = "<div><button class=\"btnBranches\" onClick=\"createBranch()\" >new branch</button></div><hr />"
        
        for d in dd:
            if(d['selected']):
                html += "<div><button class=\"btnBranches\" onClick=\"setBranch(\'{0}\')\" disabled>{0}</button></div>".format(d['name'])
            else :
                html += "<div><button class=\"btnBranches\" onClick=\"setBranch(\'{0}\')\">{0}</button></div>".format(d['name'])
        return html
        
    def POST(self):
        data = web.input();
        result = subprocess.check_output(
                "cd repositories/{0}/{1} && git checkout {2}  || exit 0 ".format(
                    session.userName, session.repository, data['name']
                ), shell=True, stderr=subprocess.STDOUT)
        session.branch = data['name']
        return result
 
class Branches:

    def getAll(self):
        dd = []
        result = subprocess.check_output(
                "cd repositories/{0}/{1} && git branch --list  || exit 0 ".format(
                    session.userName, session.repository
                ), shell=True, stderr=subprocess.STDOUT)
        branches = re.split(r'[\r\n]+', result)
        for line in branches:
            columns = re.split(r"[\s]+", line)
            i = 0
            hash = {}
            if(len(columns) > 1):
                for col in columns:
                    if i == 0 :
                        if len(col) > 0 :
                            hash['selected'] = True
                        else :
                            hash['selected'] = False
                    if i == 1 :
                        hash['name'] = col
                    i += 1
                    
                dd.append(hash)
        return dd
        
    def current(self):
        branches = self.getAll()
        for branch in branches:
            if(branch['selected'] == True):
                return branch;
        return None
    
    def currentName(self):
        branch = self.current()
        if branch is not None:
            return branch['name']
        return None
        
class List_repo_tree:
    """
    Return html list which contains file tree of open repository
    """

    def POST(self):
        if session.get('token') is not None and session.get('repository') is not None:
            return self.getDirTree('')

    def getDirTree(self, path):
        list = '<ul>'

        long_path = 'repositories/{0}/{1}/{2}'.format(session.userName, session.repository, path)
        for file in os.listdir(long_path):
            if file != '.git':
                if len(path) == 0:
                    new_path = file
                else:
                    new_path = path + '/' + file

                if os.path.isdir(os.path.join(long_path, file)):
                    list += '<li>' + file + self.getDirTree(new_path) + '</li>'
                else:
                    list += '<li onClick="getFile(\'/{0}\');">{1}</li>'.format(new_path, file)
        return list + '</ul>'

class Delete:
    def GET(self):
        data = web.input()
        path = "/"
        if(data.get("path") is not None):
            path = data.get("path")
        to_prnt = ''
        parent  = '/'
        long_path = 'repositories/{0}/{1}/{2}'.format(session.userName, session.repository, path)
        if(data.get('path') is not None and len(data.get('path').encode(encoding='UTF-8')) > 1):
            arr = re.split(r'\/', data.get('path').encode(encoding='UTF-8'))
            cnt = len(arr)
            idx = 2
            pth = "/"
            for a in arr:
                if(idx < cnt and len(a) > 0):
                    pth += a + "/"
                idx += 1
            to_prnt += '<a href="#" onClick="change_delete_dir(\'{0}\', \'{1}\');">'.format(pth, web.http.urlencode({'path' : pth , 'time' : time.time() }))
            to_prnt += '..</a></br>'
            parent = pth
        can_delete = True
        has_files = False
        
        if(os.path.exists(long_path) == False):
            long_path = 'repositories/{0}/{1}/{2}'.format(session.userName, session.repository, parent)
            path = parent
            
        result = "current dir : <br/>";
        result += path + "<br/> avialable subdirs : <br/>"
        result += to_prnt
        
        for file in os.listdir(long_path):
            if file != '.git' and file != '.gitignore':
                can_delete = False
                if len(path) == 0:
                    new_path = file
                
                else:
                    new_path = path + file+'/'
                if os.path.isdir(os.path.join(long_path, file)):
                    result += '<a href="#" onClick="change_delete_dir(\'{0}\', \'{1}\');">'.format(new_path, web.http.urlencode({'path' : new_path , 'time' : time.time() }))
                    result += file + '</a></br>'
                else:
                    has_files = True
        result += "<HR/>files : <br/>";           
        if has_files:
            for file in os.listdir(long_path):
                if file != '.git' and file != '.gitignore':
                    if len(path) == 0:
                        new_path = file
                    else:
                        new_path = path + file

                    if not (os.path.isdir(os.path.join(long_path, file))):
                        result += '<a href="#" onClick="delete_file(\'{0}\', \'{1}\', \'{2}\', \'{3}\');">'.format(file, path, web.http.urlencode({'path' : path , 'time' : time.time(), 'file': file }), new_path)
                        result += file + '</a></br>'
        if can_delete:
            result+= '<button onClick="delete_dir(\'{0}\', \'{1}\');">delete current dir</button>'.format(path, web.http.urlencode({'path' : path , 'time' : time.time()}))
        return result;
        
        
        
    def POST(self):
        data = web.input();
        print(" data = {0} full_path = {1}".format(data, data.get('full_path')))
        if(data.get("full_path") is not None):
            if(data.get("type") == "file"):
                long_path = 'repositories/{0}/{1}/{2}'.format(session.userName, session.repository, data.get('full_path') )
                print "long_path = {0}".format(long_path)
                os.remove(long_path)
            else:
                long_path = 'repositories/{0}/{1}{2}'.format(session.userName, session.repository, data.get('full_path') )
                print "long_path = {0}".format(long_path)
                os.rmdir(long_path)
        return "ok"
class Get_file:
    """
    Return text in file. File name is in post as fileName
    """

    def POST(self):
        if session.get('token') is not None:
            data = web.input()
            text = ""
            if data.get('fileName'):
                if data['fileName'].find('..') is -1:
                    file = open(
                        "repositories/{0}/{1}{2}".format(session.get('userName'), session.repository,
                                                          data['fileName'].encode(encoding='UTF-8')), "r")
                    text = file.read()
                    session.openFile = data['fileName']
            return text


class Create_file:
    """
    Create new empty file
    """

    def POST(self):
        if session.get('token') is not None:
            data = web.input()
            print("name = {0} path = {1}".format(data.get('file'), data.get('dir')))
            path = "{0}{1}".format( data.get("dir"), data.get('file'))
            long_path = "repositories/{0}/{1}{2}{3}".format(session.get('userName'), session.repository, data.get("dir"), data.get('file'))
            print("path = {0}".format(path))
            print("long_path = {0}".format(long_path))
            path = re.sub(r'^\/', '', path);
            print("path = {0}".format(path))
            try:
                open(long_path, "a").close()
            except:
                raise web.Unauthorized()
            result = subprocess.check_output(
                "cd repositories/{0}/{1} && git add {2} || exit 0".format(
                    session.userName, session.repository, path), shell=True, stderr=subprocess.STDOUT)
            print result
            session.openFile = path
            return ''

class Save_file:
    def POST(self):
        data = web.input().get('data').encode(encoding="UTF-8")
        long_path = "repositories/{0}/{1}{2}".format(session.get('userName'), session.repository, session.get('openFile').encode(encoding='UTF-8'))
        if session.get('token') is not None and session.get('openFile') is not None:
            # save edited file
            if os.path.exists("repositories/{0}".format(session.get('userName'))):
                out = open(
                    "repositories/{0}/{1}{2}".format(session.get('userName'), session.repository,
                                                      session.get('openFile').encode(encoding='UTF-8')), "w")
                out.write(web.input().get('data').encode(encoding="UTF-8"))
                out.close()
                return " saved "

                
class Create_dir:
    def GET(self):
        data = web.input()
        path = "/"
        if(data.get('path') is not None) :
            path = data.get('path')
        result = "current dir : <br/>";
        result += path + "<br/> avialable subdirs : <br/>"
        long_path = 'repositories/{0}/{1}/{2}'.format(session.userName, session.repository, path)
        if(data.get('path') is not None and len(data.get('path').encode(encoding='UTF-8')) > 1):
            arr = re.split(r'\/', data.get('path').encode(encoding='UTF-8'))
            cnt = len(arr)
            idx = 2
            pth = "/"
            for a in arr:
                if(idx < cnt and len(a) > 0):
                    pth += a + "/"
                idx += 1
            result += '<a href="#" onClick="change_target_dir(\'{0}\', \'{1}\');">'.format(pth, web.http.urlencode({'path' : pth , 'time' : time.time() }))
            result += '..</a></br>'
        for file in os.listdir(long_path):
            if file != '.git':
                if len(path) == 0:
                    new_path = file
                else:
                    new_path = path + file+'/'

                if os.path.isdir(os.path.join(long_path, file)):
                    result += '<a href="#" onClick="change_target_dir(\'{0}\', \'{1}\');">'.format(new_path, web.http.urlencode({'path' : new_path , 'time' : time.time() }))
                    result += file + '</a></br>'
        return result
        
    def POST(self): 
        data = web.input()
        print("name = {0} path = {1}".format(data.get('dir'), data.get('path')))
        long_path = "repositories/{0}/{1}/{2}{3}".format(session.get('userName'), session.repository, data.get('path').encode(encoding='UTF-8'), data.get('dir').encode(encoding='UTF-8'))
        
        print("long path = {0}".format(long_path))
        os.makedirs(long_path);
        
class Commit_file:
    """
    Commit actual file and return result
    """

    def POST(self):
        if session.get('token') is not None and session.get('openFile') is not None:
            # save edited file
            if os.path.exists("repositories/{0}".format(session.get('userName'))):
                out = open(
                    "repositories/{0}/{1}{2}".format(session.get('userName'), session.repository,
                                                      session.get('openFile').encode(encoding='UTF-8')), "w")
                out.write(web.input().get('data').encode(encoding="UTF-8"))
                out.close()
                return " "

            # pull
            result = subprocess.check_output(
                "cd repositories/{1}/{2} && git pull https://{0}@github.com/{1}/{2}.git || exit 0".format(
                    session.get('token'),
                    session.userName, session.repository), shell=True, stderr=subprocess.STDOUT)

            # commit
            print "cd repositories/{1}/{2} && git add {2} && git commit -m \"rewrite {1}\" || exit 0 ".format(
                    session.get('token'), session.openFile.encode(encoding='UTF-8').replace(' ', '// '),
                    session.repository
                )
            result += subprocess.check_output(
                "cd repositories/{1}/{2} && git add \"{1}\" && git commit -m \"rewrite {1}\" || exit 0 ".format(
                    session.get('token'), session.openFile.encode(encoding='UTF-8'),
                    session.repository
                ), shell=True, stderr=subprocess.STDOUT)

            # push
            result += subprocess.check_output(
                "cd repositories/{1}/{2} && git push https://{0}@github.com/{1}/{2}.git || exit 0 ".format(
                    session.get('token'),
                    session.userName, session.repository
                ), shell=True, stderr=subprocess.STDOUT)
            return result.replace(session.token, '***')

class Push:
    def POST(self):
        return self.PUSH()
        
    def PUSH(self):
        if session.get('token') is not None:
            result = subprocess.check_output(
                "cd repositories/{0}/{1} && git remote set-url origin https://{2}:x-oauth-basic@github.com/{0}/{1}.git || exit 0".format(
                    session.get('userName'), session.repository, session.token), shell=True, stderr=subprocess.STDOUT)
                    
            result += subprocess.check_output(
                "cd repositories/{0}/{1} && git push https://{2}:x-oauth-basic@github.com/{0}/{1}.git {3}|| exit 0".format(
                    session.get('userName'), session.repository, session.token, session.branch), shell=True, stderr=subprocess.STDOUT)
                
            #print("result = {0}".format(result))
        return "Push finished"
 
class Fetch:
    def GET(self):
        data = web.input()
        branches = GitHub().branches()
        res = '<div>Select branch for fetch</div><form id="fetch_form"><select name="branch">'
        for index, item in enumerate(branches):
            res += '<option value="{0}" >{0}</option>'.format(item.get('name'))
        res += "</select></form>"
        return res
    def POST(self):
        data = web.input()
        result = subprocess.check_output(
                "cd repositories/{0}/{1} && git fetch  https://{2}:x-oauth-basic@github.com/{0}/{1}.git {3} || exit 0".format(
                    session.get('userName'), session.repository, session.token, data.get('branch')), shell=True, stderr=subprocess.STDOUT)
        print(" result = {0}".format(result))
        return result
class Merge:
    """
    Pull last version from git server.
    """
   
    def POST(self):
        if session.get('token') is not None and session.get('repository') is not None:
            data = web.input()
            title = data.get('title') if 'title' in data else 'Pull title'
            body = data.get('body') if 'body' in data else 'Pull comment'
            head = "{0}:{1}".format(session.userName, session.branch)
            base ='master'
            res = GitHub().pull(title, body, head, base)
            number = None
            sha = None
            print(" res = ".format(res))
            if 'number' in res and 'head' in res and 'sha' in res.get('head'):
                number = res.get('number')
                sha = res.get('head').get('sha')
            else:
                raise web.HTTPError('500 Internal Server Error', {}, "Error in pull request : {0}".format(res))
            
            res = GitHub().merge(title, number, sha)
            if('sha' in res):
                return res.get('message')
            else:
                return web.HTTPError('500 Internal Server Error', {}, "Error in merge request : {0}".format(res))
class Pull:          
    def pull(self):
        if session.get('token') is not None:
            result = subprocess.check_output(
                "cd repositories/{0}/{2} && git pull https://{0}@github.com/{1}/{2}.git || exit 0".format(
                    session.get('token'),
                    session.userName, session.repository), shell=True, stderr=subprocess.STDOUT)
            session.openFile = None
            return result

class Reset_repo:
    """
    Reset repository to last success commit
    """

    def POST(self):
        if session.get('token') is not None:
            result = subprocess.check_output(
                "cd repositories/{0}/{1} && git fetch --all && git clean -f && git reset --hard @{{upstream}} || exit 0".format(
                    session.get('userName'), session.repository), shell=True, stderr=subprocess.STDOUT)

            return result.replace(session.token, '***')


class Create_repo:
    """
    Clone repository
    """

    def __init__(self, userName):
        if not os.path.exists('repositories/{0}'.format(userName)):
            os.makedirs('repositories/{0}'.format(userName))
        if not os.path.exists('repositories/{0}/{1}'.format(userName, session.repository)):
            # clone repository
            os.system("cd repositories/{1} && git clone https://{0}@github.com/{1}/{2}.git".format(
                session.get('userName'), userName, session.repository
            ))
            os.system(
                'cd repositories/{0}/{1} && git config user.name "mark2down" && git config user.email "mark2down@email.email" && git config push.default simple'.format(
                    session.get('userName'), session.get('repository')))
            # copy css
            if not os.path.exists('repositories/{0}/{1}/.css'.format(userName, session.repository)):
                os.makedirs('repositories/{0}/{1}/.css'.format(userName, session.repository))
                copy('repositories/support_files/style.css',
                     'repositories/{0}/{1}/.css'.format(userName, session.repository))

        else:
            Pull().pull()

class Title:
    def GET(self):
        if(session.get('repository') is not None):
            return "<strong>{0}</strong> (<i>{1}</i>)".format(session.repository, session.branch)
        else:
            return ""
        
class Commit:
    def GET(self):
        result = ''
        res = subprocess.check_output(
                "cd repositories/{0}/{1} && git diff --name-only || exit 0".format(
                    session.get('userName'), session.repository), shell=True, stderr=subprocess.STDOUT)
        arr = res.splitlines()
        result+= '<form id="commit_form" >'
        result += '<input type="text" name="title" id="commit_form_title" /><br/>'
        for a in arr:
            result += '<div class="only_one_line"><input style="width:auto;" type="checkbox" name="file" value="{0}" checked />{0}</div>'.format(a)
        result += '</form>'
        return result
    def POST(self):
        files = web.input(file=[]).get('file')
        title = web.input().get('title')
        sfiles = ""
        for file in files:
            sfiles += " {0}".format(file)
        print "sfiles = {0}".format(sfiles)
        
        res = subprocess.check_output(
                "cd repositories/{0}/{1} && git remote set-url origin https://{2}:x-oauth-basic@github.com/{0}/{1}.git || exit 0".format(
                    session.get('userName'), session.repository, session.token, sfiles), shell=True, stderr=subprocess.STDOUT)
        res += subprocess.check_output(
                "cd repositories/{0}/{1} && git add --force -- {2} || exit 0".format(
                    session.get('userName'), session.repository, sfiles), shell=True, stderr=subprocess.STDOUT)
        res += subprocess.check_output(
                "cd repositories/{0}/{1} && git commit -m {2} || exit 0".format(
                    session.get('userName'), session.repository, title), shell=True, stderr=subprocess.STDOUT)
                    
        print("res = {0}".format(res))
 
class GitHub:
    """
    GitHub very very simple GitHub API wrapper
    """
    def authorize(self, name, pswd):
        headers = {'content-type': 'application/json'}
        stranka = requests.get('https://api.github.com/authorizations', auth=(name, pswd), headers=headers)
        json_o = json.loads(stranka.text)
        for index, item in enumerate(json_o):
            if('note' in item and item['note'] == AUTHORIZATION_NOTE ):
                res = requests.delete('https://api.github.com/authorizations/{0}'.format(item['id']), auth=(name, pswd), headers=headers)
                
        data = {'scopes': scopes , 'note': AUTHORIZATION_NOTE}
        stranka = requests.post('https://api.github.com/authorizations', data=json.dumps(data), auth=(name, pswd), headers=headers)
        json_o = stranka.json()
        if('token' in json_o):
            session.token = json_o.get('token')
            session.userName = name
            session.repository = None
            session.branch = None
            return json_o.get('token')
        else:
            return None
    
    def pull(self, title, body, head, base):
        if(session.token is not None):
            headers = {'content-type': 'application/json', 'Authorization': 'token {0}'.format(session.token)}
            data = {'base': base, 'title': title, 'body': body, 'head': head}
            res = requests.post('https://api.github.com/repos/{0}/{1}/pulls'.format(session.userName, session.repository), headers=headers, data=json.dumps(data))
            print("res= {0}".format(res.text))
            return res.json()
        else:
            return None
            
    def merge(self, title, number, sha):
        if(session.token is not None):
            headers = {'content-type': 'application/json', 'Authorization': 'token {0}'.format(session.token)}
            data = json.dumps({'sha' : sha, 'commit_title': title, 'commit_message': 'none', 'merge_method': 'merge'})
            print('url = https://api.github.com/repos/{0}/{1}/pulls/{2}/merge'.format(session.userName, session.repository, number))
            print "data = {0}".format(data)
            res = requests.put('https://api.github.com/repos/{0}/{1}/pulls/{2}/merge'.format(session.userName, session.repository, number), headers=headers, data=data)
            print("res = {0}".format(res.text))
            return res.json()
        else:
            return None
            
    def branches(self):
        if(session.token is not None and session.repository is not None):
            headers = {'content-type': 'application/json', 'Authorization': 'token {0}'.format(session.token)}
            url = 'https://api.github.com/repos/{0}/{1}/branches'.format(session.userName, session.repository)
            print "url = {0}".format(url)
            res = requests.get(url, headers=headers)
            return res.json()
        else :
            return None
            
class Modified:
    def GET(self):
        headers = {'content-type': 'application/json'}
        stranka = requests.get('https://api.github.com/authorizations', auth=('mikafilip', '8aut00ga'), headers=headers)
        #stranka.raise_for_status()
        json_o = json.loads(stranka.text)
        for index, item in enumerate(json_o):
            print(" [{0}] = {1}".format(index, item))
            
            if(item['note'] == AUTHORIZATION_NOTE ):
                print "\nfinded at {0}\n".format(index)
                res = requests.delete('https://api.github.com/authorizations/{0}'.format(item['id']), auth=('mikafilip', '8aut00ga'), headers=headers)
                print " \n {0} \n".format(res)
        data = {'scopes': scopes , 'note': AUTHORIZATION_NOTE}
        stranka = requests.post('https://api.github.com/authorizations', data=json.dumps(data), auth=('mikafilip', '8aut00ga'), headers=headers)
        return stranka.json()
    def GETe(self):
        headers = {'Authorization': 'token deca4a320125d6759c29ee88485eb6c4dc8aeb47'}
        
        stranka = requests.get('https://api.github.com/user', headers=headers)
        stranka.raise_for_status()
        #https://deca4a320125d6759c29ee88485eb6c4dc8aeb47:x-oauth-basic@github.com 384fc5713743af26a3daa52160562f063bb7a17636500d4cec60f2b66d07b272
        return stranka.text
        
class Status:
    """
    return status about login, user name, repository
    """

    def POST(self):
        login = session.get('token') is not None
        user = session.get('userName') is not None
        repo = session.get('repository') is not None
        branch = session.get("branch") is not None
        return "{0} {1} {2} {3}".format(login, user, repo, branch)


# ----------------------------------------------------------------------------------------------------------------------

if __name__ == "__main__":
    app.run()