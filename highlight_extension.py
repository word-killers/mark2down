from markdown.extensions import Extension
from markdown.inlinepatterns import SimpleTagPattern


class HighlightExtension(Extension):
    STRONG_RE = r'(\+\+)(.*?)\+\+'
    DEL_RE = r'(--)(.*?)--'
    INS_RE = r'(__)(.*?)__'
    EM_RE = r'(~~)(.*?)~~'

    def extendMarkdown(self, md, md_globals):
        del_tag = SimpleTagPattern(self.DEL_RE, 'del')
        md.inlinePatterns.add('del', del_tag, '_end')

        ins_tag = SimpleTagPattern(self.INS_RE, 'ins')
        md.inlinePatterns.add('ins', ins_tag, '_end')

        em_tag = SimpleTagPattern(self.EM_RE, 'em')
        md.inlinePatterns['emphasis'] = em_tag

        strong_tag = SimpleTagPattern(self.STRONG_RE, 'strong')
        md.inlinePatterns['strong'] = strong_tag
