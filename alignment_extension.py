from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor
from markdown.util import etree


class Treeprocessors(Treeprocessor):
    def run(self, root):
        element = etree.Element('div')

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

            if align != '':
                root.append(element)
                element = etree.Element('div')
                element.set('style', align)
            else:
                element.append(child)
            root.remove(child)
        root.append(element)


class Extensions(Extension):
    def extendMarkdown(self, md, md_globals):
        md.treeprocessors.add("Alignment", Treeprocessors(md), '_end')
