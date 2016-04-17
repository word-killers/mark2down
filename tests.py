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
            graph_com_ann_ext,  # graph, comment, annotation
            highlight_ext,  # strong, italic, underline, cross
            alignment_ext,  # alignment
            'markdown.extensions.tables',  # tables
            'markdown.extensions.sane_lists',  # using lists like in normal mardkown
            TocExtension(slugify=self.code, separator='-'),  # table of contents
            'markdown_include.include'  # option to include other files
        ])

    def code(self, value, separator):
        value = re.sub(r"[^\w\s]", '', value)
        value = re.sub(r"\s+", '-', value)
        return 'header' + separator + value

    def test_strong(self):
        text = '++text++'
        self.assertEqual(self.md.convert(text), '<p><strong>text</strong><p>')



# dale podle tlacitek v aplikaci:
# kurziva, podtrzene, preskrtnute, strojopis
# zarovnani: text bude napriklad '}}' a ve vysledek musi byt:
# '<div style="text-align: right"></div>'
# komentare: vstup '//text'
# grafy vstup '```graph\n\n```' vystup '<div class="mermaid"></div>'
# pak tam muzes zkusit vlozit graf a mel by vyjit v tom samem divu a vnitrek by mel byt nezmenen

# u vsech prikladu co jsem uvadel nemusi sedet entry \n to poznas kdyz to spustis. Uvidis tam ocekavanou hodnotu a vyslednou
