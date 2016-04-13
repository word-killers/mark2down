var timer;
var scrollTimer;
var sync;
var annotation = [];

$(document).ready(function () {
    $(window).resize(function () {
        $('#content').height($(window).outerHeight() - $('#navigation').outerHeight());
        $('#panel_contents').height($('#content').height() - $('#panel_buttons').height());
    });
});

function initPreviewDialog() {

    $("#previewDialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        height: 500,
        width: 1000
    });

    $("#previewOpen").click(function () {

        finalPreview('previewDialog', [], true);
        mermaid.init(undefined, ".mermaid");

        $("#previewDialog").dialog("open");
    });

}

function initPrintDialog() {
    $('#printDialog').dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        buttons: {
            'Print': function () {
                printPreview();
            }
        }

    })
}

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

function finalPreview(elementID, checkboxes, loadGraph) {
    var editor = document.getElementById('editor').value;
    if (editor.trim().length == 0) {
        document.getElementById(elementID).innerHTML = "";
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                document.getElementById(elementID).innerHTML = xhttp.responseXML.getElementsByTagName('preview')[0].innerHTML;
                if (loadGraph) {
                    mermaid.init(undefined, ".mermaid");
                }
            }
        };
        sendAjax("True", xhttp, checkboxes)
    }
}

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

                mermaid.init(undefined, ".mermaid");

                $('textarea#editor').scroll();
            }
        };
        sendAjax("False", xhttp, []);
    }
}

function print() {
    var f = document.createElement('form');
    for (var index = 0; index < annotation.length; index++) {
        var l = document.createElement('label');
        var i = document.createElement('input');
        i.setAttribute('type', "checkbox");
        i.setAttribute('id', 'checkbox' + index);
        l.appendChild(i);
        l.innerHTML += annotation[index];
        f.appendChild(l);
        f.appendChild(document.createElement('br'))
    }
    document.getElementById('printDialog').innerHTML = '';
    document.getElementById('printDialog').appendChild(f);
    $('#printDialog').dialog('open');
}

function printPreview() {
    var index = 0;
    var checkboxes = [];
    do {
        var checkbox = document.getElementById('checkbox' + index);
        if (checkbox != null) {
            if (checkbox.checked) {
                checkboxes.push(annotation[index]);
            }
            index++;
        }
    } while (checkbox != null);


    finalPreview('help', checkboxes, false);
    setTimeout(function () {
        var win = window.open("", "print", "");
        win.document.write('<html><head><title>print</title>');
        win.document.write('<meta charset="UTF-8">');
        win.document.write('<script src="/static/mermaid/mermaid.min.js"></script>');
        win.document.write('<link rel="stylesheet" href="/static/mermaid/mermaid.css">');
        win.document.write('<link rel="stylesheet" href="/static/css/print.css">');
        win.document.write('<script>mermaid.init(undefined, ".mermaid");</script>');
        win.document.write('</head><body>');
        win.document.write(document.getElementById('help').innerHTML);
        win.document.write('</body></html>');

        win.document.close();
        win.focus();

        setTimeout(function () {
            win.print();
            win.close();
        }, 100);
    }, 1000);
}


function downloadHTML() {
    finalPreview('help', [], false);

    setTimeout(function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.download = "export.html";
        $('#help').css('display','block');
        mermaid.init(undefined, '.mermaid');
        a.href = "data:text/html," + '<html><head><title>export</title><meta charset="UTF-8"></head><body>' + encodeURIComponent(document.getElementById("help").innerHTML) + '</body></html>';
        a.click();
        $('#help').css('display','none');
        document.body.removeChild(a);
    }, 1000);
}

function sendAjax(final, xhttp, checkboxes) {
    xhttp.open('POST', '/markdown');
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var ann = '';
    if (checkboxes.length > 0) {
        ann = checkboxes[0];
        for (var i = 1; i < checkboxes.length; i++) {
            ann += ',,,' + checkboxes[i];
        }
    }
    xhttp.send("data=" + encodeURIComponent(document.getElementById('editor').value) + "&final=" + final + '&annotations=' + ann);
}

function onChange() {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
        sendMarkdown();
    }, 1000);
}

function hideShowComponent(idComponent) {
    $('.panel-content').hide();
    $('#' + idComponent).show();
}

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
    $('#editor').scroll();
    $(window).resize();
}