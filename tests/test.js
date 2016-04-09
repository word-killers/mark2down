var HTML;

QUnit.begin(function( details ) {
    for( var n in __html__){
        HTML = __html__[n];
        break;
    }
});

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
/*
function hidingComponentsTest(windowWidth, previewVisible, panelVisible) {
    QUnit.test("hiding components; width: " + windowWidth, function (assert) {
        document.body.innerHTML = HTML;
        var body = $('body');
        var width = body.outerWidth();
        body.outerWidth(windowWidth);
        $(window).resize();

        var previewResult = $('#preview').is(':visible');
        var panelResult = $('#left_panel').is(':visible');

        var previewText = previewResult ? 'visible' : 'hide';
        var panelText = panelResult ? 'visible' : 'hide';

        assert.equal(previewResult, previewVisible, "preview is " + previewText);
        assert.equal(panelResult, panelVisible, "panel is " + panelText);

        body.outerWidth(width);
    });
}
*/
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


function onChangeTest(){
    QUnit.test('on change test', function (assert) {
        document.body.innerHTML = HTML;
        var editor = document.getElementById('editor');
        editor.value = 'test';
        onChange();

        var done = assert.async();
        setTimeout(function () {

            var result = document.getElementById('preview').innerHTML;
            assert.equal(result, '<p>test</p>');
            done();
        }, 2000);
    })
}

function hideShowComponentTest(idComponent){
    QUnit.test('show or hide component', function (assert) {
        document.body.innerHTML = HTML;
        hideShowComponent(idComponent);

        var components = document.getElementsByClassName('panel-content');
        var bool = false;
        for(var i = 0; i<components.length; i++){
            if(components[i].id == idComponent){
                bool = true;
            }else{
                bool = false;
            }
            assert.equal($('#'+components[i].id).is(':visible'), bool, 'component '+ components[i].id + ' is visible: '+ bool);
        }
    });
}

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

/*
sendMarkdownTest('', '');
sendMarkdownTest('test', '<p>test</p>');

onChangeTest();

hidingComponentsTest(2000, true, true);
hidingComponentsTest(1101, true, true);
hidingComponentsTest(1099, false, true);
hidingComponentsTest(700, false, true);
hidingComponentsTest(699, false, false);
hidingComponentsTest(0, false, false);

*/
putCharTest('existingValue', 'test', 'existingtestValue', 8, 2, 10);
putCharTest('', '', '', 0, 0, 0);
putCharTest('', '', '', 1, 10, 0);
putCharTest('', 'test', 'test', 0, 1, 1);
putCharTest('', 'test', 'test', 3, 1, 1);
putCharTest('existingValue', '', 'existingValue', 13, 0, 13);
putCharTest('existingValue', 'test', 'existingValuetest', 13, 10, 17);
putCharTest('existingValue', 'test', 'testexistingValue', -100, 10, 10);

hideShowComponentTest('toc');
hideShowComponentTest('comments');
hideShowComponentTest('repository');
