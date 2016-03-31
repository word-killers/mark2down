var timer;

$(document).ready(function () {
    $(window).resize(function () {
        var body = $('body');
        var preview = $('#preview');
        var panel = $('#left_panel');

        if(body.outerWidth()<1100){
            preview.hide();
        }else{
            preview.show();
        }

        if(body.outerWidth()<700){
            panel.hide();
        }else{
            panel.show();
        }
    });
});

function putChar(char, center) {
    var editor = document.getElementById("editor");
    var CaretPos = 0;
    if (document.selection) {
        editor.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -editor.value.length);
        CaretPos = Sel.text.length;
    }
    else if (editor.selectionStart || editor.selectionStart == '0')
        CaretPos = editor.selectionStart;

    editor.value = editor.value.substring(0, CaretPos) + char + editor.value.substring(CaretPos);

    CaretPos += center ? char.length / 2 : char.length;

    if (editor.setSelectionRange) {
        editor.focus();
        editor.setSelectionRange(CaretPos, CaretPos);
    }
    else if (editor.createTextRange()) {
        var range = editor.createTextRange();
        range.collapse(true);
        range.moveEnd('character', CaretPos);
        range.moveStart('character', CaretPos);
        range.select();
    }

    onChange();
}

function sendMarkdown() {
    var editor = document.getElementById('editor').value;
    if (editor.trim().length == 0) {
        document.getElementById('preview').innerHTML = "";
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                document.getElementById('preview').innerHTML = xhttp.responseText;
                mermaid.init(undefined, ".mermaid");
            }
        };

        xhttp.open('POST', '/markdown');
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("data=" + editor);
    }
}

function onChange() {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
        sendMarkdown();
    }, 1000);
}

function initScroll() {
    var $elements = $('textarea#editor, article#preview');
    var sync = function () {
        var $other = $elements.not(this).off('scroll'), other = $other.get(0);
        var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
        other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);
        setTimeout(function () {
            $other.on('scroll', sync);
        }, 1000);
    };

    $elements.on('scroll', sync);
}

function initTab() {
    var editor = document.getElementById("editor");

    editor.onkeydown = function (event) {

        if (event.keyCode == 9) { // tab was pressed
            putChar('\t');
            editor.focus();
            return false;
        }
    }
}

function init() {
    initTab();
    sendMarkdown();
    initScroll();
}