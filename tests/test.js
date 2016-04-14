var HTML;

QUnit.begin(function (details) {
    for (var n in __html__) {
        HTML = __html__[n];
        break;
    }
});

// script.js ===========================================================================================================

function resizeTest(width) {
    //todo
}

// work with editor ----------------------------------------------------------------------------------------------------

function putCharTest(editorValue, inputValue, expectedValue, oldPosition, newPosition, expectedPosition) { //todo
    QUnit.test(" put char test", function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = editorValue;
        setCursorPosition(oldPosition);

        putChar(inputValue, newPosition);

        var resultPosition = getCursorPosition();
        var positionText = "expected position: " + expectedPosition + "; result: " + resultPosition;
        var valueText = "expected value: " + expectedValue + "; result: " + editor.value;
        assert.equal(resultPosition, expectedPosition, positionText);
        assert.equal(editor.value, expectedValue, valueText)
    });
}

function putStringToEditorTest(input, position, expectedValue, existingValue) {
    QUnit.test("put string to editor", function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = existingValue;

        putStringToEditor(input, position);

        assert.equal(editor.value, expectedValue, "expected: '" + expectedValue + "'; result: '" + editor.value + "'");
    });
}

function cursorPositionTest(setPosition, expectPosition, existionValue) {
    QUnit.test("cursor position", function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = existionValue;

        setCursorPosition(setPosition);
        var result = getCursorPosition();
        assert.equal(result, expectPosition, "expected position is: '" + expectPosition + "'; result position is: '" + result + "'");
    });
}

// communication with server -------------------------------------------------------------------------------------------

function sendMarkdownTest(editorValue, expectedValue) {
    QUnit.test("Sever response and preview set", function (assert) {
        document.body.innerHTML = HTML;
        document.getElementById('editor').value = editorValue;
        var done = assert.async();
        sendMarkdown();
        setTimeout(function () {
            var result = document.getElementById('preview').innerHTML;
            assert.equal(result, expectedValue, "expected: '" + expectedValue + "'; result: '" + result + "'");
            done();
        }, 1000);
    });
}

function finalPreviewTest(editorText, expectedValue, annotations, parseMermaid) {
    QUnit.test("Sever response and preview set", function (assert) {
        document.body.innerHTML = HTML;
        document.getElementById('editor').value = editorText;

        var preview = document.getElementById('help');
        loadMermaid = parseMermaid;

        if (editorText == '') {
            finalPreview('help', annotations, parseMermaid);
            assert.equal(preview.innerHTML, expectedValue);
        } else {
            var fakeXHTTP = Dexter.fakeXHR(),
                xhr = finalPreview('help', annotations, parseMermaid);

            assert.equal(fakeXHTTP.requests[0], xhr, 'fakeXHR.requests[0] == xhr');

            fakeXHTTP.respond({
                body: expectedValue,
                status: 200
            });
            var done = assert.async();
            setTimeout(function () {
                assert.equal(preview.innerHTML, expectedValue);
                done();
            }, 100);
            assert.expect(2);
        }
    });
}

function sendAjaxTest() {
    //todo
}

function onChangeTest() {
    QUnit.test('on change test', function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = '';
        onChange();

        var done = assert.async();
        setTimeout(function () {

            var result = document.getElementById('preview').innerHTML;
            assert.equal(result, '');
            done();
        }, 2000);
    })
}

// scroll --------------------------------------------------------------------------------------------------------------

function initScrollTest() {
    //todo
}

function scrollTest() {
    //todo
}

// other function ------------------------------------------------------------------------------------------------------

function switchMermaidTest(oldValue) {
    QUnit.test('function of tab', function (assert) {
        document.body.innerHTML = HTML;
        loadMermaid = oldValue;
        switchMermaid();
        assert.equal(loadMermaid, !oldValue, 'Bad value');
        if (!oldValue) {
            assert.equal($('#mermaidBtn').css('color'), 'rgb(0, 128, 0)');
        } else {
            assert.equal($('#mermaidBtn').css('color'), 'rgb(255, 0, 0)');
        }
    });
}

function changeRenderMermaidColorTest() {
    QUnit.test('function of tab', function (assert) {
        document.body.innerHTML = HTML;
        loadMermaid = true;
        changeRenderMermaidColor();
        assert.equal($('#mermaidBtn').css('color'), 'rgb(0, 128, 0)');
        loadMermaid = false;
        changeRenderMermaidColor();
        assert.equal($('#mermaidBtn').css('color'), 'rgb(255, 0, 0)');
    });
}

function hideShowComponentTest(idComponent) {
    QUnit.test('show or hide component', function (assert) {
        document.body.innerHTML = HTML;
        hideShowComponent(idComponent);

        var components = document.getElementsByClassName('panel-content');
        var bool = false;
        for (var i = 0; i < components.length; i++) {
            if (components[i].id == idComponent) {
                bool = true;
            } else {
                bool = false;
            }
            assert.equal($('#' + components[i].id).css('display') != 'none', bool, 'component ' + components[i].id + ' is visible: ' + bool);
        }
    });
}

function initPreviewDialogTest() {
    QUnit.test('initialize preview dialog', function (assert) {
        document.body.innerHTML = HTML;
        document.getElementById('editor').innerHTML = '';

        loadMermaid = true;

        initPreviewDialog();
        $('#previewOpen').click();

        var done = assert.async();
        setTimeout(function () {
            assert.equal($('#previewDialog').dialog('isOpen'), true);
            done();
        }, 2000);
    });
}

function tabTest() {
    QUnit.test('function of tab', function (assert) {
        document.body.innerHTML = HTML;

        initTab();

        var editor = document.getElementById('editor');
        keyvent.on(editor).down(9);

        assert.equal(editor.value, '\t')

    });
}

function initTest() {
    //todo
}

// other tests ---------------------------------------------------------------------------------------------------------

function heightOfComponentsTest(windowHeight) {
    QUnit.test("computing height of components", function (assert) {
        document.body.innerHTML = HTML;
        var body = $('body');
        var content = $('#content');
        var height = body.height();
        body.innerHeight(windowHeight);
        $(window).resize();

        navResult = content.outerHeight() + $('#navigation').outerHeight();
        panelResult = $("#panel_contents").height() + $('#panel_buttons').height();
        if (windowHeight < 300) {
            windowHeight = 300;
        }
        navResult -= navResult - windowHeight;

        assert.equal(navResult, windowHeight);
        assert.equal(panelResult, content.height());
        body.outerWidth(height);
    });
}

// export.js ===========================================================================================================

function initPrintDialogTest() {
    QUnit.test("computing height of components", function (assert) {
        document.body.innerHTML = HTML;
        initPrintDialog();
        $('#printDialog').dialog('open');
        assert.equal($('#printDialog').dialog('isOpen'), true);
    });
}

function printDocumetTest() {
    QUnit.test('Open print dialog', function (assert) {
        document.body.innerHTML = HTML;
        printDocument();

        assert.equal($('#printDialog').dialog('isOpen'), true);
    });
}

function exportDocumentTest() {
    QUnit.test('Open export dialog', function (assert) {
        document.body.innerHTML = HTML;
        exportDocument();

        assert.equal($('#printDialog').dialog('isOpen'), true);
    });
}

function createExportDialogCheckboxesTest(annotations) {
    QUnit.test('Export dialog', function (assert) {
        annotation = annotations;
        document.body.innerHTML = HTML;
        createExportDialogCheckboxes();
        var dialog = document.getElementById('printDialog');
        var form = dialog.getElementsByTagName('form');
        assert.equal(form.length, 1, 'Dialog must contain one form.');
        var labels = form[0].getElementsByTagName('label');
        assert.equal(labels.length, annotations.length, 'Bad number of inputs');
        for (var i = 0; i < annotations.length; i++) {
            assert.equal(labels[i].textContent || labels[i].innerText, annotations[i]);
        }
    });
}

function getCheckedAnnotationTest(annotations, checked) {
    QUnit.test('check box annotation', function (assert) {
        annotation = annotations;
        document.body.innerHTML = HTML;
        createExportDialogCheckboxes();
        for (var i = 0; i < checked.length; i++) {
            document.getElementById('checkbox' + checked[i]).checked = true;
        }
        var annot = getCheckedAnnotation();

        var counter = 0;
        for (i = 0; i < annot.length; i++) {
            for (var j = 0; j < checked.length; j++) {
                if (annot[i] == annotations[checked[j]]) {
                    counter++;
                }
            }
        }
        assert.equal(counter, checked.length, 'Bad number of checked annotations');
    });

}

// table.js ============================================================================================================

function generateTableTest() {
    QUnit.test('Create table', function (assert) {
        document.body.innerHTML = HTML;
        document.getElementById('editor').value = '';
        document.getElementById('table').innerHTML = "<tr><th class=\"column\"><textarea class=\"table_text_area\">A</textarea></th><th class=\"column\"><textarea class=\"table_text_area\">B</textarea></th><th class=\"column\"><textarea class=\"table_text_area\">C</textarea></th></tr>" +
            "<tr><td class=\"column\"><textarea class=\"table_text_area\">D</textarea></td><td class=\"column\"><textarea class=\"table_text_area\">E</textarea></td><td class=\"column\"><textarea class=\"table_text_area\">F</textarea></td></tr><tr><td class=\"column\"><textarea class=\"table_text_area\">G</textarea></td><td class=\"column\"><textarea class=\"table_text_area\">H</textarea></td><td class=\"column\"><textarea class=\"table_text_area\">I</textarea></td></tr>"

        initTableDialog();
        $('#tableButton').click();
        generateTable();

        var result = '| A | B | C | \n|---|---|---|\n| D | E | F |\n| G | H | I |\n'
        assert.equal(document.getElementById('editor').value, result);
    });
}

function createTableTest(rows, cols) {
    QUnit.test('Create table', function (assert) {
        document.body.innerHTML = HTML;
        document.getElementById('table').appendChild(document.createElement('tr'));

        createTable(rows, cols);

        var resultRows = 0;
        var resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });

        assert.equal(resultRows, rows, 'bad number of rows');
        assert.equal(resultRows == 0 ? 0 : resultCols / resultRows, rows == 0 ? 0 : cols, 'bad number of cols');
    });
}

function delRowTest() {
    QUnit.test('Delete row from table', function (assert) {
        document.body.innerHTML = HTML;
        addRow();
        addCol();
        addRow();
        addCol();
        addCol();
        addRow();

        delRow();

        var resultRows = 0;
        var resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, 2, 'bad number of rows');
        assert.equal(resultCols / resultRows, 3, 'bad number of cols');

        delRow();

        resultRows = 0;
        resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, 1, 'bad number of rows');
        assert.equal(resultCols / resultRows, 3, 'bad number of cols');
    });
}

function delColTest() {
    QUnit.test('Delete coll from table', function (assert) {
        document.body.innerHTML = HTML;
        addRow();
        addCol();
        addRow();
        addCol();
        addCol();

        delCol();

        var resultRows = 0;
        var resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, 2, 'bad number of rows');
        assert.equal(resultCols / resultRows, 2, 'bad number of cols');

        delCol();

        resultRows = 0;
        resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, 2, 'bad number of rows');
        assert.equal(resultCols / resultRows, 1, 'bad number of cols');
    });
}

function addColTest(count) {
    QUnit.test('Add coll to table', function (assert) {
        document.body.innerHTML = HTML;

        for (var i = 0; i < count; i++) {
            document.getElementById('table').appendChild(document.createElement('tr'));
        }
        if (count > 0) {
            addCol();
            addCol();
        }

        var resultRows = 0;
        var resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, count, 'bad number of rows');
        assert.equal(resultRows == 0 ? 0 : resultCols / resultRows, count == 0 ? 0 : 2, 'bad number of cols');
    });
}

function addRowTest() {
    QUnit.test('Add row to table', function (assert) {
        document.body.innerHTML = HTML;
        var resultRows = 0;
        var resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, 0, 'bad number of rows');
        assert.equal(resultCols, 0, 'bad number of cols');

        addRow();
        document.getElementById('table').firstElementChild.appendChild(document.createElement('th'));
        addRow();

        resultRows = 0;
        resultCols = 0;
        $("#table").find('tr').each(function () {
            resultRows++;
            $(this).find('td').each(function () {
                resultCols++;
            });
            $(this).find('th').each(function () {
                resultCols++;
            });
        });
        assert.equal(resultRows, 2, 'bad number of rows');
        assert.equal(resultCols, 2, 'bad number of cols');
    });
}

//======================================================================================================================
//======================================================================================================================

putCharTest('existingValue', 'test', 'existingtestValue', 8, 2, 10);
putCharTest('', '', '', 0, 0, 0);
putCharTest('', '', '', 1, 10, 0);
putCharTest('', 'test', 'test', 0, 1, 1);
putCharTest('', 'test', 'test', 3, 1, 1);
putCharTest('existingValue', '', 'existingValue', 13, 0, 13);
putCharTest('existingValue', 'test', 'existingValuetest', 13, 10, 17);
putCharTest('existingValue', 'test', 'testexistingValue', -100, 10, 10);

putStringToEditorTest('', 0, '', '');
putStringToEditorTest('', 0, 'existingValue', 'existingValue');
putStringToEditorTest('test', 0, 'test', "");
putStringToEditorTest('test', 1, 'test', "");
putStringToEditorTest('test', 0, 'testexistingValue', "existingValue");
putStringToEditorTest('test', 3, 'exiteststingValue', "existingValue");
putStringToEditorTest('test', -10, 'testexistingValue', "existingValue");
putStringToEditorTest('test', 13, 'existingValuetest', "existingValue");
putStringToEditorTest(' ', 8, 'existing Value', "existingValue");

cursorPositionTest(0, 0, "");
cursorPositionTest(10, 0, "");
cursorPositionTest(0, 0, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(10, 10, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(30, 30, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(31, 30, "abcde fg hijkl mnop qrstuvwxyz");
cursorPositionTest(-200, 0, "abcde fg hijkl mnop qrstuvwxyz");

sendMarkdownTest('', '');
sendMarkdownTest('test', '\n\n            '); //todo

finalPreviewTest('text', '<p>text</p>', [], false);
finalPreviewTest('', '', [], false);
finalPreviewTest('text', '<p>text</p>', [], true);
finalPreviewTest('text', '<p>text</p>', ['a1', 'a2'], false);

onChangeTest();

switchMermaidTest(true);
switchMermaidTest(false);

changeRenderMermaidColorTest();

hideShowComponentTest('toc');
hideShowComponentTest('comments');
hideShowComponentTest('repository');

initPreviewDialogTest();

tabTest();

heightOfComponentsTest(1000);
heightOfComponentsTest(301);
heightOfComponentsTest(300);
heightOfComponentsTest(299);
heightOfComponentsTest(1);

heightOfComponentsTest(-1);

initPrintDialogTest();
printDocumetTest();
exportDocumentTest();

createExportDialogCheckboxesTest(['annotation1', 'annotation2', 'annotation3']);
createExportDialogCheckboxesTest([]);

getCheckedAnnotationTest(['annotation1', 'annotation2', 'annotation3'], [0]);
getCheckedAnnotationTest(['annotation1', 'annotation2', 'annotation3'], [1, 2]);
getCheckedAnnotationTest(['annotation1', 'annotation2', 'annotation3'], []);
getCheckedAnnotationTest([], []);

generateTableTest();

createTableTest(0, 0);
createTableTest(0, 1);
createTableTest(1, 0);
createTableTest(6, 6);

delRowTest()
delColTest();
addColTest(0);
addColTest(1);
addColTest(6);
addRowTest();