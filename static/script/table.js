$(function () {
    $("#dialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        width: 'auto'
    });

    $("#tableButton").click(function () {
        $("#dialog").dialog("open");
    });
});

$(function () {
    $('#butonik').click(function () {
        var $text = '';
        var $header = '| ';
        var $separator = '|';
        $("#table").find('tr').each(function () {

            $(this).find('td').each(function () {
                $text += '| ' + $(this).find('textarea').val() + ' ';
            });

            if ($(this).find('td').length != 0) {
                $text += '|\n';
            }

            $(this).find('th').each(function () {
                var $cell = $(this).find('textarea').val();
                $header += $cell + ' | ';
                for (var i = 0; i < $cell.length + 2; i++) {
                    $separator += '-';
                }
                $separator += '|';
            });
        });
        putChar($header + '\n' + $separator + '\n' + $text);
        $('#dialog').dialog('close');
    })
});

function createTable(rows, cols) {
    var table = document.getElementById("table");
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < cols; j++) {
            if (i == 0) {
                var td = document.createElement('th');
            } else {
                var td = document.createElement('td');
            }
            td.setAttribute('class', 'column');
            var textarea = document.createElement('textarea');
            textarea.setAttribute('class', 'table_text_area');
            td.appendChild(textarea);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function delRow() {
    var table = document.getElementById('table');
    if (table.childElementCount > 1) {
        table.removeChild(table.lastElementChild);
    }
}
function delCol() {
    var table = document.getElementById('table');
    var length = table.childElementCount;
    var trs = table.childNodes;

    if (table.firstElementChild.childElementCount > 1) {
        for (var i = 0; i < length; i++) {
            trs.item(i).removeChild(trs.item(i).lastElementChild);
        }
    }
}

function addCol() {
    var table = document.getElementById('table');
    var length = table.childElementCount;
    var trs = table.childNodes;
    for (var i = 0; i < length; i++) {
        if (i == 0) {
            var td = document.createElement('th');
        } else {
            var td = document.createElement('td');
        }
        td.setAttribute('class', 'column');
        var textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'table_text_area');
        td.appendChild(textarea);
        trs.item(i).appendChild(td);
    }
}

function addRow() {
    var table = document.getElementById('table');
    var length = table.lastElementChild.childElementCount;
    var tr = document.createElement('tr');
    for (var j = 0; j < length; j++) {

        var td = document.createElement('td');
        td.setAttribute('class', 'column');
        var textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'table_text_area');
        td.appendChild(textarea);
        tr.appendChild(td);
    }
    table.appendChild(tr);
}