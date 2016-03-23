
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