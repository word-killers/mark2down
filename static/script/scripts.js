var timer;
var scrollTimer;
var sync;
var loadMermaid = false;

$(document).ready(function () {
    $(window).resize(function () {
        $('#content').height($(window).outerHeight() - $('#navigation').outerHeight());
        $('#panel_contents').height($('#content').height() - $('#panel_buttons').height());
        if (loadMermaid) {
            mermaid.init(undefined, '.mermaid');
        }
    });
});

// work with editor ----------------------------------------------------------------------------------------------------

function putChar(char, position) {

    var CaretPos = getCursorPosition();
    putStringToEditor(char, CaretPos);
    CaretPos += position;
    setCursorPosition(CaretPos);

    onChange();
}

function putStringToEditor(string, position) {
    var editor = document.getElementById('editor');
    editor.value = editor.value.substring(0, position) + string + editor.value.substring(position);
}

function getCursorPosition() {
    var editor = document.getElementById("editor");

    if (document.selection) {
        editor.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -editor.value.length);
        return Sel.text.length;
    }
    else if (editor.selectionStart || editor.selectionStart == '0')
        return editor.selectionStart;
}

function setCursorPosition(position) {
    var editor = document.getElementById('editor');
    if (editor.setSelectionRange) {
        editor.focus();
        editor.setSelectionRange(position, position);
    }
    else if (editor.createTextRange()) {
        var range = editor.createTextRange();
        range.collapse(true);
        range.moveEnd('character', position);
        range.moveStart('character', position);
        range.select();
    }
}

// communication with server -------------------------------------------------------------------------------------------

function sendMarkdown() {
    if (document.getElementById('editor').value.trim().length == 0) {
        document.getElementById('preview').innerHTML = "";
        document.getElementById('toc').innerHTML = "";
        document.getElementById('comments').innerHTML = "";

    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = xhttp.responseXML;
                $('#preview').off('scroll');
                document.getElementById('preview').innerHTML = response.getElementsByTagName("preview")[0].innerHTML;
                document.getElementById('toc').innerHTML = response.getElementsByTagName('toc')[0].innerHTML;
                document.getElementById('comments').innerHTML = response.getElementsByTagName('comments')[0].innerHTML;
                annotation = response.getElementsByTagName('annotations')[0].innerHTML.split(',,,');

                if (loadMermaid) {
                    mermaid.init(undefined, ".mermaid");
                }

                $('textarea#editor').scroll();
            }
        };
        sendAjax("False", xhttp, []);
    }
}

function finalPreview(elementID, checkboxes, loadGraph) {
    var editor = document.getElementById('editor').value;
    if (editor.trim().length == 0) {
        document.getElementById(elementID).innerHTML = "";
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                if (xhttp.responseXML) {
                    var response = xhttp.responseXML.getElementsByTagName('preview')[0].innerHTML;
                }else{
                    response = xhttp.responseText;
                }
                document.getElementById(elementID).innerHTML = response;


                if (loadGraph && loadMermaid) {
                    mermaid.init(undefined, ".mermaid");
                }
            }
        };
        sendAjax("True", xhttp, checkboxes);
        return xhttp;
    }
    return null;
}

function sendAjax(final, xhttp, checkedAnnotation) {
    xhttp.open('POST', '/markdown');
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var ann = '';
    if (checkedAnnotation.length > 0) {
        ann = checkedAnnotation[0];
        for (var i = 1; i < checkedAnnotation.length; i++) {
            ann += ',,,' + checkedAnnotation[i];
        }
    }
    xhttp.send(
        "data=" + encodeURIComponent(document.getElementById('editor').value) +
        "&final=" + final +
        '&annotations=' + ann
    );
}

function onChange() {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
        sendMarkdown();
    }, 1000);
}

// scroll --------------------------------------------------------------------------------------------------------------

function initScroll() {
    sync = function () {
        window.clearTimeout(scrollTimer);
        var self = this;
        scrollTimer = window.setTimeout(function () {
            scroll(self);
        }, 300);
    };

    $('textarea#editor, article#preview').scroll(sync);
}

function scroll(self) {
    var $elements = $('textarea#editor, article#preview');
    var $other = $elements.not(self).off('scroll'), other = $other.get(0);
    var percentage = self.scrollTop / (self.scrollHeight - self.offsetHeight);
    other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);
    setTimeout(function () {
        $elements.scroll(sync);
    }, 100);
}

// other function ------------------------------------------------------------------------------------------------------

function switchMermaid() {
    loadMermaid = !loadMermaid;
    if (loadMermaid) {
        mermaid.init(undefined, '.mermaid');
    }
    changeRenderMermaidColor()
}

function changeRenderMermaidColor() {
    if (loadMermaid) {
        $('#mermaidBtn').css('color', 'green');
    } else {
        $('#mermaidBtn').css('color', 'red');
    }
}

function hideShowComponent(idComponent) {
    $('.panel-content').hide();
    $('#' + idComponent).show();
}

function initPreviewDialog() {

    $("#previewDialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        height: 500,
        width: 1000
    });

    $("#previewOpen").click(function () {

        finalPreview('previewDialog', [], false);

        setTimeout(function () {
            $("#previewDialog").dialog("open");
            if (loadMermaid) {
                mermaid.init(undefined, ".mermaid");
            }
        }, 1000);
    });

}

function initTab() {
    var editor = document.getElementById("editor");

    editor.onkeydown = function (event) {

        if (event.keyCode == 9) { // tab was pressed
            putChar('\t', 1);
            editor.focus();
            return false;
        }
    }
}

function init() {
    initTab();
    sendMarkdown();
    initScroll();
    initPreviewDialog();
    initPrintDialog();
    initTableDialog();
    $('#editor').scroll();
    $(window).resize();
    changeRenderMermaidColor();
}