from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor


class Treeprocessors(Treeprocessor):
    def run(self, root):
        last_child = None

        for child in root.getchildren():
            if child.text == '}}':
                align = 'text-align: right'
            elif child.text == '{{':
                align = 'text-align: left'
            elif child.text == '{}':
                align = 'text-align: justify'
            elif child.text == '}{':
                align = 'text-align: center'
            else:
                align = ''

            if align:
                child.text = ''
                child.tag = 'div'
                child.set('style', align)
                last_child = child

            if last_child:
                last_child.append(child)


class Extensions(Extension):
    def extendMarkdown(self, md, md_globals):
        md.treeprocessors.add("Alignment", Treeprocessors(md), '_end')
