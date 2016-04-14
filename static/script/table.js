/**
 * Function initialize dialog for creating tables and set event to #tableButton.
 */
function initTableDialog() {
    $("#dialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        height: 600,
        width: 700,
        buttons: {
            "OK": function () {
                generateTable();
            },
            "Add Row": function () {
                addRow();
            },
            "Add Col": function () {
                addCol();
            },
            "Del Row": function () {
                delRow();
            },
            "Del Col": function () {
                delCol();
            }
        }
    });

    $("#tableButton").click(function () { // event to open this dialog.
        $("#dialog").dialog("open");
    });
}

/**
 * Found html table with id #table, convert it to Markdown table and put it in #editor.
 */
function generateTable() {
    var $text = '';
    var $header = '| ';
    var $separator = '|';
    $("#table").find('tr').each(function () {

        $(this).find('td').each(function () {
            $text += '| ' + $(this).find('textarea').val() + ' ';
        });

        if ($(this).find('td').length != 0) {
            $text += '|\n'; //add pipe to end of line
        }

        $(this).find('th').each(function () { // header of table
            var $cell = $(this).find('textarea').val();
            $header += $cell + ' | ';
            for (var i = 0; i < $cell.length + 2; i++) {
                $separator += '-';
            }
            $separator += '|';
        });
    });
    putChar($header + '\n' + $separator + '\n' + $text, false); //put table in #editor
    $('#dialog').dialog('close');
}

/**
 * Create html table of given size and place it in #table. Each cell contains one text area.
 * @param rows number of rows
 * @param cols number of columns
 */
function createTable(rows, cols) {
    var table = document.getElementById("table");
    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
    var td;
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < cols; j++) {
            if (i == 0) { // first row contains header of table
                td = document.createElement('th');
            } else {
                td = document.createElement('td');
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

/**
 * Delete last row from table which have id #table. Minimal number of rows in table are 1.
 */
function delRow() {
    var table = document.getElementById('table');
    if (table.childElementCount > 1) {
        table.removeChild(table.lastElementChild);
    }
}

/**
 * Delete last column from table #table. Delete last cell from every row. Minimal number of columns are 1.
 */
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

/**
 * Add one column on end of table #table.
 */
function addCol() {
    var table = document.getElementById('table');
    var length = table.childElementCount;
    var trs = table.childNodes;
    var td;
    for (var i = 0; i < length; i++) {
        if (i == 0) { // first row contain header of table.
            td = document.createElement('th');
        } else {
            td = document.createElement('td');
        }
        td.setAttribute('class', 'column');
        var textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'table_text_area');
        td.appendChild(textarea);
        trs.item(i).appendChild(td);
    }
}

/**
 * Add one row on end of table #table.
 */
function addRow() {
    var table = document.getElementById('table');
    var length = table.lastElementChild != null ? table.lastElementChild.childElementCount : 0;
    var tr = document.createElement('tr');

    for (var j = 0; j < length; j++) { // add cells in new row
        var td = document.createElement('td');
        td.setAttribute('class', 'column');
        var textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'table_text_area');
        td.appendChild(textarea);
        tr.appendChild(td);
    }
    table.appendChild(tr);
}