/** Timer for Content change */
var timer;
/** Timer for scrolling. */
var scrollTimer;
/** function for scrolling */
var sync;
/** If is true, graphs are parse. */
var loadMermaid = false;

/**
 * Call after page loads. Set height of html components when window is resize.
 */
$(document).ready(function () {
    $(window).resize(function () {
        var content = $('#content');
        content.height($(window).outerHeight() - $('#navigation').outerHeight());
        $('#panel_contents').height(content.height() - $('#panel_buttons').height());
        if (loadMermaid) {
            mermaid.init(undefined, '.mermaid');
        }
    });
});


// work with editor ----------------------------------------------------------------------------------------------------

/**
 * Put input string to #editor, set cursor position and call onChange().
 * oldPosition + position = newPosition.
 *
 * @param char string which will be put in #editor
 * @param position position of cursor on end of function relative to start of input string
 */
function putChar(char, position) {

    var CaretPos = getCursorPosition();
    putStringToEditor(char, CaretPos);
    CaretPos += position;
    setCursorPosition(CaretPos);

    onChange();
}

/**
 * Put string to #editor on given position.
 *
 * @param string input string
 * @param position position in #editor.
 */
function putStringToEditor(string, position) {
    var editor = document.getElementById('editor');
    editor.value = editor.value.substring(0, position) + string + editor.value.substring(position);
}

/**
 * Return current cursor position in #editor.
 * @returns {Number} position in #editor
 */
function getCursorPosition() {
    var editor = document.getElementById("editor");

    if (document.selection) { // for IE
        editor.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -editor.value.length);
        return Sel.text.length;
    }// for other browsers
    else if (editor.selectionStart || editor.selectionStart == '0')
        return editor.selectionStart;
}

/**
 * Set cursors position in #editor.
 * @param position new cursor position
 */
function setCursorPosition(position) {
    var editor = document.getElementById('editor');
    if (editor.setSelectionRange) { // for other browsers
        editor.focus();
        editor.setSelectionRange(position, position);
    }
    else if (editor.createTextRange()) { // for IE
        var range = editor.createTextRange();
        range.collapse(true);
        range.moveEnd('character', position);
        range.moveStart('character', position);
        range.select();
    }
}

// communication with server -------------------------------------------------------------------------------------------

/**
 * Using ajax to communicate with server. Send on server content of #editor and from response get preview, table of
 * content, table of comments and list of annotations. This values are set to page elements.
 */
function sendMarkdown() {
    if (document.getElementById('editor').value.trim().length == 0) { // if #editor is empty
        document.getElementById('previewValue').innerHTML = "";
        document.getElementById('toc').innerHTML = "";
        document.getElementById('comments').innerHTML = "";
        annotation = [];

    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = xhttp.responseXML;
                $('#preview').off('scroll');
                document.getElementById('previewValue').innerHTML = response.getElementsByTagName("preview")[0].innerHTML;
                document.getElementById('toc').innerHTML = response.getElementsByTagName('toc')[0].innerHTML;
                document.getElementById('comments').innerHTML = response.getElementsByTagName('comments')[0].innerHTML;
                var respAnnotation = response.getElementsByTagName('annotations')[0].innerHTML;
                if (respAnnotation == '') {
                    annotation = [];
                } else {
                    annotation = respAnnotation.split(',,,');
                }

                if (loadMermaid) {
                    mermaid.init(undefined, ".mermaid");
                }

                $('textarea#editor').scroll(); // after set all data sync scroll position
            }
        };
        sendAjax("False", xhttp, []);
    }
}

/**
 * Using ajax to communicate with server and get final preview of document. Preview is set to {elementID}.
 * @param elementID element where will be final preview.
 * @param checkboxes list of annotation which will be deleted from final preview.
 * @param loadGraph if is true graf will be parsed.
 * @returns {*} XML http request
 */
function finalPreview(elementID, checkboxes, loadGraph) {
    var editor = document.getElementById('editor').value;
    if (editor.trim().length == 0) { // if editor is empty
        document.getElementById(elementID).innerHTML = "";
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                if (xhttp.responseXML) {
                    var response = xhttp.responseXML.getElementsByTagName('preview')[0].innerHTML;
                } else {
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

/**
 * Send ajax request to server.
 * @param final if i want final preview or not.
 * @param xhttp XML http request
 * @param checkedAnnotation list of annotation which will be deleted from final preview
 */
function sendAjax(final, xhttp, checkedAnnotation) {
    xhttp.open('POST', '/markdown');
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var ann = '';
    if (checkedAnnotation.length > 0) { // convert list of annotations to string
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

/**
 * On call wait one sec. After that call sendMarkdown(). If is call repeatedly, timer is set tu one sec again.
 */
function onChange() {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
        sendMarkdown();
    }, 1000);
}

// scroll --------------------------------------------------------------------------------------------------------------

/**
 * Initialize sync scrolling #editor and #preview. After scroll wait 300 milisec and sync.
 */
function initScroll() {
    sync = function () {
        window.clearTimeout(scrollTimer);
        var self = this;
        scrollTimer = window.setTimeout(function () {
            scroll(self);
        }, 300);
    };

    $('textarea#editor, article#previewValue').scroll(sync);
}

/**
 * Set other panel scroll to same value.
 * @param self which panel was scroll
 */
function scroll(self) {
    var $elements = $('textarea#editor, article#previewValue');
    var $other = $elements.not(self).off('scroll'), other = $other.get(0);
    var percentage = self.scrollTop / (self.scrollHeight - self.offsetHeight);
    other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);
    setTimeout(function () {
        $elements.scroll(sync);
    }, 100);
}

// other function ------------------------------------------------------------------------------------------------------

/**
 * Switch off or on of graph parser and recolor control button.
 */
function switchMermaid() {
    loadMermaid = !loadMermaid;
    if (loadMermaid) {
        mermaid.init(undefined, '.mermaid');
    }
    changeRenderMermaidColor()
}

/**
 * Set color of #mermaitBtn by loadMermaid value.
 */
function changeRenderMermaidColor() {
    if (loadMermaid) {
        $('#mermaidBtn').css('color', 'green');
    } else {
        $('#mermaidBtn').css('color', 'red');
    }
}

/**
 * Hide all components if #leftPanel and show only given component.
 * @param idComponent Id of component which would be visible.
 */
function hideShowComponent(idComponent) {
    $('.panel-content').hide();
    $('#' + idComponent).show();
}

/**
 * Initialize #previewDialog and set #previewButton to open final preview.
 */
function initPreviewDialog() {

    $("#previewDialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        height: 500,
        width: 1000,
        resizeStop: function (event, ui) {
            $('#previewDialog').css('width', '100%');
        }
    });

    $("#previewOpen").click(function () {

        finalPreview('previewDialogIn', [], false);

        setTimeout(function () {
            $("#previewDialog").dialog("open");
            if (loadMermaid) {
                mermaid.init(undefined, ".mermaid");
            }
        }, 1000);
    });

}

/**
 * Initialize using of tab in #editor.
 */
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

/**
 * Only call initialize methods.
 */
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
    setTimeout(function () {
        initAdjustmentColumns();
    }, 1000);

    $.post('/set-repo-name', function (data) {
        if (data == 'False') {
            $("#help_dialog").dialog({
                autoOpen: false,
                resizable: true,
                modal: true,
                height: 300,
                width: 200,
                title: 'Repository',
                buttons: [
                    {
                        text: 'OK',
                        click: function () {
                            if ($('#gitName').val() != '') {
                                $.post('/set-repo-name', {userName: $('#gitName').val()});
                                $('#help_dialog').dialog('close');
                                getRepos();
                            }
                        }
                    }
                ]
            });

            var html = '<label>Write your user name or team name.</label></label><input id="gitName" type="text" name="repository">';
            $("#help_dialog").html(html);

            $("#help_dialog").dialog('open');
        }
    });
}

function getRepos() {
    $("#help_dialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        height: 300,
        width: 200,
        title: 'Repositories'
    });
    $("#help_dialog").html("");

    $.post("/list-repos", function (data) {
        $("#help_dialog").html(data);
    });

    $('#help_dialog').dialog("open");
}

function setRepo(repoName) {
    $.post("/list-repos", {name: repoName}, function () {
        $.post("/list-repo-tree", function (data) {
            $('#repository').html(data);
            $('#editor').val('');
            sendMarkdown();
        });
    });
    $('#help_dialog').dialog("close");
}

function getFile(fileName) {
    $.post("/get-file", {fileName: fileName}, function (data) {

        $('#editor').val(data);
        sendMarkdown();
    })
}

function commit() {
    $.post("/commit-file", {data: $('#editor').val()}, function (data) {
        alert(data);
    })

}

function newFileDialog() {
    $("#help_dialog").dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        height: 300,
        width: 300,
        title: 'File name',
        buttons: [
            {
                text: 'OK',
                click: function () {
                    if ($('#fileName').val() != '') {
                        newFile($('#fileName').val());
                    }
                }
            }
        ]
    });

    var html = '<label>Write name of new file.</label></label><input id="fileName" type="text" name="repository">';
    $("#help_dialog").html(html);

    $("#help_dialog").dialog('open');

}

function newFile(fileName) {
    $.post("/create-file", {fileName: fileName}, function (data) {
        $.post("/list-repo-tree", function (data) {
            $('#repository').html(data)
        });
        $('#editor').val(data);
        $('#help_dialog').dialog('close');
        sendMarkdown();

    })
}

function login(link) {
    window.location.href = link;
}

function logout(){
    $.post('/logout', function () {
        $('#editor').val('');
        sendMarkdown();
        window.location.reload()
    });
}

function pull(){
    $.post('/pull', function (data) {
        $('#editor').val('');
        sendMarkdown();
        alert(data);
    })
}

function reset(){
    $.post('/reset-repo', function (data) {
        $('#editor').val('');
        sendMarkdown();
        alert(data);
    });
    
}

