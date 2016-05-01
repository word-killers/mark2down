import unittest
import markdown
import alignment_extension
import graph_com_ann_extension
import highlight_extension
from markdown.extensions.toc import TocExtension
import re


class TestMarkdown(unittest.TestCase):
    md = None

    def call_before(self, annotations):
        graph_com_ann_ext = graph_com_ann_extension.Extensions(True, annotations)
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

    def test_comment(self):
        self.call_before([])
        text = '//text'
        self.assertEqual(self.md.convert(text), '<div></div>')

    def test_annotation(self):
        self.call_before([])
        text = '@[text]\n text text text'
        self.assertEqual(self.md.convert(text), '<div><p>text text text</p>\n</div>')

    def test_include(self):
        self.call_before([])
        text = '{! text !}'
        self.assertEqual(self.md.convert(text), '<div></div>')

    def test_exclude_annotation_1(self):
        self.call_before(['Annotation1'])
        text = '@[Annotation1]\n text text'
        self.assertEqual(self.md.convert(text), '<div></div>')

    def test_exclude_annotation_2(self):
        self.call_before(['Annotation1'])
        text = 'text text\n@[Annotation1]'
        self.assertEqual(self.md.convert(text), '<div><p>text text</p>\n</div>')

    def test_exclude_annotation_3(self):
        self.call_before(['Annotation1'])
        text = 'text1 text1\n@[Annotation1]\n text2 text2'
        self.assertEqual(self.md.convert(text), '<div><p>text1 text1</p>\n</div>')

    def test_exclude_annotation_4(self):
        self.call_before(['Annotation1'])
        text = 'text1 text1\n@[Annotation1]\ntext2 text2\n@[Annotation2]\ntext3 text3'
        self.assertEqual(self.md.convert(text), '<div><p>text1 text1\ntext3 text3</p>\n</div>')

    def test_exclude_annotation_5(self):
        self.call_before(['Annotation2'])
        text = 'text1 text1\n@[Annotation1]\ntext2 text2\n@[Annotation2]\ntext3 text3'
        self.assertEqual(self.md.convert(text), '<div><p>text1 text1\ntext2 text2</p>\n</div>')

    def test_exclude_annotation_6(self):
        self.call_before(['Annotation1', 'Annotation2'])
        text = 'text1 text1\n@[Annotation1]\ntext2 text2\n@[Annotation2]\ntext3 text3'
        self.assertEqual(self.md.convert(text), '<div><p>text1 text1</p>\n</div>')
