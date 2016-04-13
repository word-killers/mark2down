var annotation = [];

function initPrintDialog() {
    $('#printDialog').dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
    })
}

function printDocument() {
    createExportDialogCheckboxes();
    $('#printDialog').dialog({
        buttons: {
            'Print': function () {
                printPreview();
                $(this).dialog('close');
            }
        }
    });
    $('#printDialog').dialog('open');
}

function exportDocument() {
    createExportDialogCheckboxes();
    $('#printDialog').dialog({
        buttons: {
            'Export': function () {
                exportPreview();
                $(this).dialog('close');
            }
        }
    });
    $('#printDialog').dialog('open');
}

function printPreview() {
    var checkboxes = getCheckedAnnotation();
    finalPreview('help', checkboxes, false);

    setTimeout(function () {
        var win = window.open("", "print", "");
        win.document.write('<html><head><title>print</title>');
        win.document.write('<meta charset="UTF-8">');
        if (loadMermaid) {
            win.document.write('<script src="/static/mermaid/mermaid.min.js"></script>');
            win.document.write('<link rel="stylesheet" href="/static/mermaid/mermaid.css">');
            win.document.write('<link rel="stylesheet" href="/static/css/print.css">');
            win.document.write('<script>mermaid.init(undefined, ".mermaid");</script>');
        }
        win.document.write('</head><body>');
        win.document.write(document.getElementById('help').innerHTML);
        win.document.write('</body></html>');

        win.document.close();
        win.focus();

        document.getElementById('help').innerHTML = '';
        setTimeout(function () {
            win.print();
            win.close();
        }, 100);
    }, 1000);
}

function exportPreview() {
    var checkboxes = getCheckedAnnotation();
    finalPreview('help', checkboxes, false);

    setTimeout(function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.download = "export.html";
        $('#help').css('display', 'block');
        if (loadMermaid) {
            mermaid.init(undefined, ".mermaid");
        }
        a.href = "data:text/html," + '<html><head><title>export</title><meta charset="UTF-8"></head><body>' + encodeURIComponent(document.getElementById("help").innerHTML) + '</body></html>';
        a.click();
        $('#help').css('display', 'none');
        document.body.removeChild(a);
        document.getElementById('help').innerHTML = '';
    }, 1000);
}

function getCheckedAnnotation() {
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

    return checkboxes;
}

function createExportDialogCheckboxes() {
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
}