from markdown.treeprocessors import Treeprocessor
from markdown.preprocessors import Preprocessor
from markdown.extensions import Extension
import re

"""
Extension for Python Markdown. Add comments, annotations and possibility to write graphs bz Mermaid. Is there option to
make final HTML or not. Final means that comments will be hidden, text with prohibited annotations will be hidden too.
Included files will be put in document.
"""


class Treeprocessors(Treeprocessor):
    """
    Lines which contains graph and was deleted from document. Are now add back to document and surround with div.
    """

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
        """
        Goes through the document and reformat it.
        :param lines: every line of document.
        :return: new reformatted lines.
        """
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
        """
        Initialize each needed variable on default values..
        """
        Extensions.remember_lines = []
        Extensions.comment_list = '<ul>\n'
        Extensions.annotation_strings = ''
        self.annotation_list = set()
        self.addLines = True
        self.graph = ""
        self.is_graph = False
        self.new_lines = []

    def on_end(self):
        """
        Function start after all document is reformat.
        """
        if len(self.graph) > 0:  # if is in document graph with no end
            self.new_lines.append(self.graph)
        Extensions.comment_list += '</ul>'
        for item in self.annotation_list:
            Extensions.annotation_strings += item + ',,,'
        Extensions.annotation_strings = Extensions.annotation_strings[:-3]

    def include(self, line, pattern):
        """
        Looking for included documents. If document si not final, only show information that there will be include.
        :param line: one line of formatted document
        :param pattern: compiled regular expression for Include syntax
        :return: True if is Include document on line
        """
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
        """
        Looking for comments in document. If document is final, delete comments from document.
        Add comment to list of comments.
        :param line: one line of formatted document
        :return: True if is comment in input line.
        """
        if line.strip(' \n\r\t\f').startswith('//'):
            form_line = line.strip(' \n\r\t\f/')
            Extensions.comment_list += '<li>' + form_line + '</li>\n'
            if not self.final:
                self.new_lines.append('\n---\n++Comment:++ ' + form_line + '\n\n---')
            return True
        return False

    def annotation(self, line, pattern):
        """
        Looking for annotations in document. If document is final only show annotation in document. If is not final
        and if it is prohibited annotation every next line to next annotation will be deleted.
        :param line: one line of formatted document
        :param pattern: compiled regular expression for annotations.
        :return: True if is annotation in input line.
        """
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
        """
        Search input annotation in prohibited annotations. If found it set variable addLines to False. And every next
        line to next Annotation will be deleted from document.
        :param annotation: Name of annotation
        """
        for one in self.prohibitedAnnotation:
            if one == annotation:
                self.addLines = False
                return
        self.addLines = True

    def graph_parser(self, line):
        """
        Looking for graphs in document, load it in variable graph and delete it from document. If graph is completed or
        if is end of document, graph is assigned to array which contains every graph in document.
        """
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
    """Strings which contains each graph in document."""
    remember_lines = []
    """Contains one string of all annotations divide by ,,,"""
    annotation_strings = ""
    """Contains list of comments formatted in HTML."""
    comment_list = ""

    def __init__(self, final, annotations):
        self.config = {
            'final': [False, 'Say if  is final printable version'],
            'annotations': [[], 'Names of prohibited annotations']
        }
        self.setConfig('final', final)
        self.setConfig('annotations', annotations)

    def extendMarkdown(self, md, md_globals):
        """
        Add new extensions to Python Markdown.
        """
        md.preprocessors.add("GraphCommentAnnotation", Preprocessors(md, self.getConfigs()), '_begin')
        md.treeprocessors.add("Graph", Treeprocessors(md), '_end')
