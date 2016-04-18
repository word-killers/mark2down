from markdown.treeprocessors import Treeprocessor
from markdown.preprocessors import Preprocessor
from markdown.extensions import Extension
import re


class Treeprocessors(Treeprocessor):
    def run(self, root):
        if len(Extensions.remember_lines) > 0:
            i = 0
            for child in root:
                if child.text == '```graph':
                    child.text = Extensions.remember_lines[i]
                    child.tag = 'div'
                    child.set('class', 'mermaid')
                    i += 1


class Preprocessors(Preprocessor):
    is_graph = False
    graph = ""
    new_lines = []
    addLines = True
    prohibitedAnnotation = []
    annotation_list = set()

    def __init__(self, md, config):
        super(Preprocessor, self).__init__(md)
        self.final = config['final']
        self.prohibitedAnnotation = config['annotations']

    def run(self, lines):
        self.init()
        pattern = re.compile('@\[([a-zA-Z0-9-_ ]+)\]')
        include_pattern = re.compile('(.*)(\{!(.+)!\})(.*)')

        for index in range(len(lines)):
            if not self.comment(lines[index]):
                if not self.annotation(lines[index], pattern):
                    if not self.include(lines[index], include_pattern):
                        if self.addLines:
                            self.new_lines.append(self.graph_parser(lines[index]))

        self.on_end()
        return self.new_lines

    def init(self):
        Extensions.remember_lines = []
        Extensions.comment_list = '<ul>\n'
        Extensions.annotation_strings = ''
        self.annotation_list = set()
        self.addLines = True
        self.graph = ""
        self.is_graph = False
        self.new_lines = []

    def on_end(self):
        if len(self.graph) > 0:
            self.new_lines.append(self.graph)
        Extensions.comment_list += '</ul>'
        for item in self.annotation_list:
            Extensions.annotation_strings += item + ',,,'
        Extensions.annotation_strings = Extensions.annotation_strings[:-3]

    def include(self, line, pattern):
        m = pattern.match(line)
        if m:
            if not self.final:
                self.new_lines.append(m.group(1))
                self.new_lines.append('\n---\n++Include:++ ' + m.group(3) + '\n\n---')
                self.new_lines.append(m.group(4))
            else:
                return False
            return True
        return False

    def comment(self, line):
        if line.strip(' \n\r\t\f').startswith('//'):
            form_line = line.strip(' \n\r\t\f/')
            Extensions.comment_list += '<li>' + form_line + '</li>\n'
            if not self.final:
                self.new_lines.append('\n---\n++Comment:++ ' + form_line + '\n\n---')
            return True
        return False

    def annotation(self, line, pattern):
        m = pattern.match(line)
        if m:
            self.annotation_list.add(m.group(1))
            if not self.final:
                self.new_lines.append('\n---\n++Annotation:++ ' + m.group(1) + '\n\n---')
            else:
                self.print_annotation(m.group(1))
            return True
        return False

    def print_annotation(self, annotation):
        for one in self.prohibitedAnnotation:
            if one == annotation:
                self.addLines = False
                return
        self.addLines = True

    def graph_parser(self, line):
        form_line = line.lower().strip(' \n\r\t\f')

        if self.is_graph:
            if form_line != '```':
                self.graph += line + '\n'
            else:
                self.is_graph = False
                Extensions.remember_lines.append(self.graph)
                self.graph = ""
        else:
            if form_line == '```graph' or form_line == '``` graph':
                self.is_graph = True
                return '\n```graph\n'
            else:
                return line

        return ""


class Extensions(Extension):
    remember_lines = []
    annotation_strings = ""
    comment_list = ""

    def __init__(self, final, annotations):
        self.config = {
            'final': [False, 'Say if  is final printable version'],
            'annotations': [[], 'Names of prohibited annotations']
        }
        self.setConfig('final', final)
        self.setConfig('annotations', annotations)

    def extendMarkdown(self, md, md_globals):
        md.preprocessors.add("GraphCommentAnnotation", Preprocessors(md, self.getConfigs()), '_begin')
        md.treeprocessors.add("Graph", Treeprocessors(md), '_end')
