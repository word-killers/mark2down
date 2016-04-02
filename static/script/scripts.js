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

function putChar(char, position) {

    var CaretPos = getCursorPosition();
    putStringToEditor(char, CaretPos);
    CaretPos += position;
    setCursorPosition(CaretPos);
    
    onChange();
}

function putStringToEditor(string, position){
    document.getElementById('editor').value = editor.value.substring(0, position) + string + editor.value.substring(position);
}

function getCursorPosition(){
    var editor = document.getElementById("editor");

    if (document.selection) {
        editor.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -editor.value.length);
        return Sel.text.length;
    }
    else if (editor.selectionStart || editor.selectionStart == '0')
        return  editor.selectionStart;
}

function setCursorPosition(position){
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

function sendMarkdown() {
    var editor = document.getElementById('editor').value;
    if (editor.trim().length == 0) {
        document.getElementById('preview').innerHTML = "";
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = xhttp.responseXML;
                document.getElementById('preview').innerHTML = response.getElementsByTagName("preview")[0].innerHTML;
                document.getElementById('toc').innerHTML = response.getElementsByTagName('toc')[0].innerHTML;

                mermaid.init(undefined, ".mermaid");
            }
        };

        xhttp.open('POST', '/markdown');
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("data=" + encodeURIComponent(editor));
    }
}

function onChange() {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
        sendMarkdown();
    }, 1000);
}

function hideShowComponent(idComponent){
    $('.panel-content').hide();
    $('#'+idComponent).show();
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
    $(window).resize();
}