from markdown.treeprocessors import Treeprocessor
from markdown.preprocessors import Preprocessor
# from markdown.postprocessors import Postprocessor
from markdown.extensions import Extension


# class MyPostprocessor(Postprocessor):
#    def run(self, text):
#        for graph in MyExtension.remember_lines:
#            text = text.replace('<p>```graph</p>', '<div class="mermaid">'+graph+'</div>', 1)
#
#        return text

class Treeprocessors(Treeprocessor):
    def run(self, root):
        if len(Extensions.remember_lines) > 0:
            i = 0

            for child in root:
                if child.text == '```graph':
                    child.text = Extensions.remember_lines[i]
                    child.tag = 'div'
                    child.set('class', 'mermaid')
                    child.set('style', 'text-align: center')
                    i += 1


class Preprocessors(Preprocessor):
    is_graph = False
    graph = ""

    def run(self, lines):
        new_lines = []
        Extensions.remember_lines = []
        self.graph = ""
        self.is_graph = False
        for index in range(len(lines)):
            if not self.is_comment(lines[index]):
                new_lines.append(self.graph_parser(lines[index]))

        if len(self.graph) > 0:
            new_lines.append(self.graph)

        return new_lines

    def is_comment(self, line):
        return line.strip(' \n\r\t\f').startswith('//')

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

    def extendMarkdown(self, md, md_globals):
        md.preprocessors.add("GraphComment", Preprocessors(md), '_end')
        md.treeprocessors.add("Graph", Treeprocessors(md), '_end')
        # md.postprocessors.add("MyPostprocessor", MyPostprocessor(md), '_end')