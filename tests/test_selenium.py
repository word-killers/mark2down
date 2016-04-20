import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class PythonOrgSearch(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.get("localhost:8080")

    def test_graph_btn(self):
        driver = self.driver
        driver.find_element_by_id('btnGraph').click()
        self.assertEqual("```graph\n\n```", driver.find_element_by_id("editor").get_attribute('value'))

    def test_table_btn(self):
        driver = self.driver
        driver.find_element_by_id('tableButton').click()
        self.assertTrue(driver.find_element_by_id('dialog').is_displayed())

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()
