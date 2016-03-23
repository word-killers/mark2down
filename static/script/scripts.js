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
}

function sendMarkdown(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            document.getElementById('preview').innerHTML = xhttp.responseText;
        }
    };

    xhttp.open('POST', '/markdown');
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("data="+document.getElementById('editor').value);
}