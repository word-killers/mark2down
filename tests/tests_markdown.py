import unittest
import markdown
import alignment_extension
import graph_com_ann_extension
import highlight_extension
from markdown.extensions.toc import TocExtension
import re


class TestMarkdown(unittest.TestCase):
    md = None

    def setUp(self):
        graph_com_ann_ext = graph_com_ann_extension.Extensions(False, [])
        highlight_ext = highlight_extension.HighlightExtension()
        alignment_ext = alignment_extension.Extensions()

        self.md = markdown.Markdown(safe_mode='escape', extensions=[
            'markdown_include.include',  # option to include other files
            graph_com_ann_ext,  # graph, comment, annotation
            highlight_ext,  # strong, italic, underline, cross
            alignment_ext,  # alignment
            'markdown.extensions.tables',  # tables
            'markdown.extensions.sane_lists',  # using lists like in normal mardkown
            TocExtension(slugify=self.code, separator='-')  # table of contents
        ])

    def code(self, value, separator):
        value = re.sub(r"[^\w\s]", '', value)
        value = re.sub(r"\s+", '-', value)
        return 'header' + separator + value

    def test_strong(self):
        text = '++text++'
        self.assertEqual(self.md.convert(text), '<div><p><strong>text</strong></p>\n</div>')

    def test_italic(self):
        text = '~~text~~'
        self.assertEqual(self.md.convert(text), '<div><p><em>text</em></p>\n</div>')

    def test_underline(self):
        text = '__text__'
        self.assertEqual(self.md.convert(text), '<div><p><ins>text</ins></p>\n</div>')

    def test_strikeThrough(self):
        text = '--text--'
        self.assertEqual(self.md.convert(text), '<div><p><del>text</del></p>\n</div>')

    def test_typeWriting(self):
        text = '```text```'
        self.assertEqual(self.md.convert(text), '<div><p><code>text</code></p>\n</div>')

    def test_alignLeft(self):
        text = '{{\n\ntext'
        self.assertEqual(self.md.convert(text), '<div></div><div style="text-align: left"><p>text</p>\n</div>')

    def test_alignCenter(self):
        text = '}{\n\ntext'
        self.assertEqual(self.md.convert(text), '<div></div><div style="text-align: center"><p>text</p>\n</div>')

    def test_alignBlock(self):
        text = '{}\n\ntext'
        self.assertEqual(self.md.convert(text), '<div></div><div style="text-align: justify"><p>text</p>\n</div>')

    def test_alignRight(self):
        text = '}}\n\ntext'
        self.assertEqual(self.md.convert(text), '<div></div><div style="text-align: right"><p>text</p>\n</div>')

    def test_cislovanySeznam(self):
        text = '1. text'
        self.assertEqual(self.md.convert(text), '<div><ol>\n<li>text</li>\n</ol>\n</div>')

    def test_odrazkovySeznam(self):
        text = '- text'
        self.assertEqual(self.md.convert(text), '<div><ul>\n<li>text</li>\n</ul>\n</div>')

    def test_comment(self):
        text = '//text'
        self.assertEqual(self.md.convert(text), '<div><hr />\n<p><strong>Comment:</strong> text</p>\n<hr />\n</div>')

    def test_graph(self):
        text = '```graph\n\n```'
        self.assertEqual(self.md.convert(text), '<div><div class="mermaid">\n</div>\n</div>')

    def test_completedGraph(self):
        text = '```graph\ngraph TD;\n A-->B;\nA-->C;\nB-->D;\nC-->D;\n```'
        self.assertEqual(self.md.convert(text), '<div><div class="mermaid">graph TD;\n A--&gt;B;\nA--&gt;C;\nB--&gt;D;\nC--&gt;D;\n</div>\n</div>')

    def test_annotation(self):
        text = '@[text]'
        self.assertEqual(self.md.convert(text), '<div><hr />\n<p><strong>Annotation:</strong> text</p>\n<hr />\n</div>')

    def test_include(self):
        text = '{!text!}'
        self.assertEqual(self.md.convert(text), '<div><hr />\n<p><strong>Include:</strong> text</p>\n<hr />\n</div>')

    def test_header_id(self):
        text = '#header1'
        self.assertEqual(self.md.convert(text), '<div><h1 id="header-header1">header1</h1>\n</div>')

    def test_graph_with_no_end(self):
        text = '```graph\ntext text text'
        self.assertEqual(self.md.convert(text), '<div><p>```graph</p>\n<p>text text text</p>\n</div>')





# dulezita je jenom funkce test_strong ostatnich si vsimat nemusis
# syntaxe:
# funkce zaci def test_nejaky_nazev(self): test tam byt musi
# v pythonu nejsou zavorky oddelju se to odsazenim
# na konci neni strednik
# self.assertEqual porovnava dve hodnoty.
# self.md.convert(...) prevede text do markdown

# spusteni testu bud nahranim do masteru se testy spusti automaticky a vysledek uvidis na https://travis-ci.org/word-killers/mark2down
# ale lepsi je si to napred spustit u sebe takze do cmd napises
# pip install nose
# presunes se do adresare kde je tenhle soubor a pak test spustis prikazem:
# nosetests

# dale podle tlacitek v aplikaci:
# kurziva, podtrzene, preskrtnute, strojopis
# zarovnani: text bude napriklad '}}' a ve vysledek musi byt:
# '<div style="text-align: right"></div>'
#
#  komentare: vstup '//text'
# grafy vstup '```graph\n\n```' vystup '<div class="mermaid"></div>'
# pak tam muzes zkusit vlozit graf a mel by vyjit v tom samem divu a vnitrek by mel byt nezmenen
#
# u vsech prikladu co jsem uvadel nemusi sedet entry \n to poznas kdyz to spustis. Uvidis tam ocekavanou hodnotu a vyslednou
# vsechny vyslednky jsou obalene '<div>......\n</div>'


