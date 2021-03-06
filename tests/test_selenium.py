import unittest

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class PythonOrgSearch(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.PhantomJS()  # executable_path='node_modules/phantomjs/lib/phantom/bin/phantomjs')
        # self.driver = webdriver.Firefox()
        self.driver.set_window_size(1024, 768)
        # self.driver.get("http://localhost:8080")
        self.driver.get('https://mark2down.herokuapp.com/')

    """ don't work with phantomJS
    def test_mermaid_render_1(self):
        driver = self.driver
        driver.find_element_by_id("editor").clear()
        driver.find_element_by_id("editor").send_keys("```graph\ngraph LR\n    A --- B\n```")

        wait = WebDriverWait(driver, 20)
        wait.until(lambda driver: driver.find_element_by_id('documentView'))

        preview = driver.find_element_by_id('documentView')
        self.assertEqual("<div><div class=\"mermaid\">graph LR\n    A --- B\n</div>\n</div>", preview.get_attribute("innerHTML"))

    def test_mermaid_render_2(self):
        driver = self.driver
        driver.find_element_by_id("editor").clear()
        driver.find_element_by_id("editor").send_keys("```graph\ngraph LR\n    A --- B\n```")

        driver.find_element_by_id('mermaidBtn').click()

        wait = WebDriverWait(driver, 20)
        wait.until(lambda driver: driver.find_element_by_id('documentView'))

        preview = driver.find_element_by_id('documentView')
        self.assertTrue(preview.find_element_by_tag_name('svg') is not None)
        """

    def test_graph_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnGraph')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("```graph\n\n```", driver.find_element_by_id("editor").get_attribute('value'))

    def test_table_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('tableButton')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertTrue(driver.find_element_by_id('dialog').is_displayed())

    def test_H1_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnH1')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("# ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_H2_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnH2')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("## ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_H3_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnH3')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("### ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_H4_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnH4')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("#### ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_H5_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnH5')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("##### ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_H6_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnH6')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("###### ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_bold_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnBold')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("++  ++", driver.find_element_by_id("editor").get_attribute('value'))

    def test_italic_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnItalic')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("~~  ~~", driver.find_element_by_id("editor").get_attribute('value'))

    def test_underline_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnUnderline')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("__  __", driver.find_element_by_id("editor").get_attribute('value'))

    def test_strikeThrough_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnStrikeThrough')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("--  --", driver.find_element_by_id("editor").get_attribute('value'))

    def test_typeWriting_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnTypewriting')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("```  ```", driver.find_element_by_id("editor").get_attribute('value'))

    def test_alignLeft_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnAlignLeft')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("{{\n", driver.find_element_by_id("editor").get_attribute('value'))

    def test_alignCenter_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnAlignCenter')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("}{\n", driver.find_element_by_id("editor").get_attribute('value'))

    def test_alignBlock_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnAlignBlock')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("{}\n", driver.find_element_by_id("editor").get_attribute('value'))

    def test_alignRight_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnAlignRight')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("}}\n", driver.find_element_by_id("editor").get_attribute('value'))

    def test_cislovanySeznam_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnNumerate')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("1. ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_odrazkovySeznam_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnList')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("- ", driver.find_element_by_id("editor").get_attribute('value'))

    def test_include_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnInclude')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("{!  !}", driver.find_element_by_id("editor").get_attribute('value'))

    def test_image_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnImage')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("![alt text](image path \"Tooltip text\")",
                         driver.find_element_by_id("editor").get_attribute('value'))

    def test_code_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('btnCode')
        self.assertTrue(btn.is_displayed())
        btn.click()
        self.assertEqual("```\n\t\n```", driver.find_element_by_id("editor").get_attribute('value'))

    def test_preview_btn(self):
        driver = self.driver
        btn = driver.find_element_by_id('previewOpen')
        self.assertTrue(btn.is_displayed())
        btn.click()
        wait = WebDriverWait(driver, 5)
        wait.until(EC.visibility_of(driver.find_element_by_id('previewDialog')))
        self.assertTrue(driver.find_element_by_id('previewDialog').is_displayed())

    def test_toc(self):
        driver = self.driver
        driver.find_element_by_id('contentBtn').click()
        self.assertTrue('block' in driver.find_element_by_id('toc').get_attribute("style"))
        self.assertFalse('block' in driver.find_element_by_id('comments').get_attribute("style"))
        self.assertFalse('block' in driver.find_element_by_id('repository').get_attribute("style"))

    def test_comments(self):
        driver = self.driver
        driver.find_element_by_id('commentsBtn').click()
        self.assertTrue('block' in driver.find_element_by_id('comments').get_attribute("style"))
        self.assertFalse('block' in driver.find_element_by_id('toc').get_attribute("style"))
        self.assertFalse('block' in driver.find_element_by_id('repository').get_attribute("style"))

    def test_repository(self):
        driver = self.driver
        driver.find_element_by_id('fileBtn').click()
        self.assertTrue('block' in driver.find_element_by_id('repository').get_attribute("style"))
        self.assertFalse('block' in driver.find_element_by_id('toc').get_attribute("style"))
        self.assertFalse('block' in driver.find_element_by_id('comments').get_attribute("style"))
    
    def test_table_del_row(self):
        driver = self.driver
        driver.find_element_by_id('tableButton').click()
        self.assertTrue(driver.find_element_by_id('dialog').is_displayed())
        table = driver.find_element_by_id('table')
        self.assertTrue(table.is_displayed())
        rows = len(table.find_elements_by_tag_name('tr'))
        driver.find_element_by_id('dialog').parent.find_element_by_xpath("//*[contains(text(), 'Del Row')]").click()
        self.assertEqual(rows-1, len(table.find_elements_by_tag_name('tr')))

    def test_table_add_row(self):
        driver = self.driver
        driver.find_element_by_id('tableButton').click()
        self.assertTrue(driver.find_element_by_id('dialog').is_displayed())
        table = driver.find_element_by_id('table')
        self.assertTrue(table.is_displayed())
        rows = len(table.find_elements_by_tag_name('tr'))
        driver.find_element_by_id('dialog').parent.find_element_by_xpath("//*[contains(text(), 'Add Row')]").click()
        self.assertEqual(rows + 1, len(table.find_elements_by_tag_name('tr')))

    def test_table_del_col(self):
        driver = self.driver
        driver.find_element_by_id('tableButton').click()
        self.assertTrue(driver.find_element_by_id('dialog').is_displayed())
        table = driver.find_element_by_id('table')
        self.assertTrue(table.is_displayed())
        cols = len(table.find_elements_by_tag_name('td'))/len(table.find_elements_by_tag_name('tr'))
        driver.find_element_by_id('dialog').parent.find_element_by_xpath("//*[contains(text(), 'Del Col')]").click()
        new_cols = len(table.find_elements_by_tag_name('td'))/len(table.find_elements_by_tag_name('tr'))
        self.assertEqual(cols - 1, new_cols)

    def test_table_add_col(self):
        driver = self.driver
        driver.find_element_by_id('tableButton').click()
        self.assertTrue(driver.find_element_by_id('dialog').is_displayed())
        table = driver.find_element_by_id('table')
        self.assertTrue(table.is_displayed())
        cols = len(table.find_elements_by_tag_name('td')) / len(table.find_elements_by_tag_name('tr'))
        driver.find_element_by_id('dialog').parent.find_element_by_xpath("//*[contains(text(), 'Add Col')]").click()
        new_cols = len(table.find_elements_by_tag_name('td')) / len(table.find_elements_by_tag_name('tr'))
        self.assertEqual(cols + 1, new_cols)


    def tearDown(self):
        self.driver.close()
