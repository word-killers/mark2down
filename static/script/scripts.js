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
    
    $("#selectCss").on('change', function(){
        $('#mark_down_style').prop("href", this.value);
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
        resizeStop: function () {
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
    var editor = $('#editor');
    loadCss();
    initTab();
    editor.val('');
    sendMarkdown();
    initScroll();
    initPreviewDialog();
    initPrintDialog();
    initTableDialog();
    editor.scroll();
    changeRenderMermaidColor();
    setTimeout(function () {
        initAdjustmentColumns();
    }, 1000);
    hideButtons();
    setFileTree();
    setTitle();
    $(window).resize();
}

/**
 * Load css from server for preview
 */
function loadCss() {
    $.post('/get-css', function (data) {
        var style = document.createElement('style');
        style.innerHTML = data;
        document.head.appendChild(style);
    });
}

/**
 * Hide buttons for version control which are not allowed to use.
 */
function hideButtons() {
    $.post("/status", function (data) {
        var status = data.split(' ');
        if (status[0] == 'True') {
            $('#btnLogout').show();
            $('#btnSetUser').show();
            $('#btnLogin').hide();
        } else {
            $('#btnLogout').hide();
            $('#btnSetUser').hide();
            $('#btnLogin').show();
        }

        if (status[1] == 'True' && status[2] == 'True') {
            $('#btnSetRepo').show();
            $('#btnSetBranch').show();
            $('#btnCommit').show();
            $('#btnNewFile').show();
            $('#btnPull').show();
            $('#btnReset').show();
        } else {
            if (status[1] == 'True') {
                $('#btnSetRepo').show();
                $('#btnSetBranch').show();
                $('#btnCommit').hide();
                $('#btnNewFile').hide();
                $('#btnPull').hide();
                $('#btnReset').hide();
            } else {
                $('#btnSetRepo').hide();
                $('#btnSetBranch').hide();
                $('#btnCommit').hide();
                $('#btnNewFile').hide();
                $('#btnPull').hide();
                $('#btnReset').hide();
            }
        }

        $(window).resize();
    })
}

/**
 * Open dialog for set user or team name.
 */
function setUser() {
    $.post('/set-repo-name', function (data) {
        if (data == 'True') {
            var dialog = $("#help_dialog") ;
            dialog.dialog({
                autoOpen: false,
                resizable: true,
                modal: true,
                height: 300,
                width: 300,
                title: 'Repository',
                buttons: [
                    {
                        text: 'OK',
                        click: function () {
                            var textFiled = $('#gitName');
                            if (textFiled.val() != '') {
                                $.post('/set-repo-name', {userName: textFiled.val()}, function () {
                                    getRepos();
                                    hideButtons();
                                });
                                dialog.dialog('close');
                            }
                        }
                    }
                ]
            });

            var html = '<label>Write your user name or team name.</label></label><input id="gitName" type="text" name="repository">';
            dialog.html(html);

            dialog.dialog('open');
        }
    });
}

/**
 * Set tree of files in repository
 */
function setFileTree() {
    $.post("/list-repo-tree", function (data) {
        $('#repository').html(data);
        $('#editor').val('');
        sendMarkdown();
        hideButtons();
    });
}


/**
 * Show dialog which contains users repositories.
 */
function getRepos() {
    var dialog = $("#help_dialog");
    dialog.dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        height: 300,
        width: 300,
        title: 'Repositories',
        buttons: []
    });
    dialog.html("");

    $.post("/list-repos", function (data) {
        dialog.html(data);
    });

    dialog.dialog("open");
}


/**
 * Set name of using repository.
 * @param repoName name of using repository.
 */
function setRepo(repoName) {
    $.ajax({
        url: "/list-repos", 
        data: {name: repoName},
        method: 'POST'
    }).done( function(data){
        setFileTree();
        setTitle();
    });
    $('#help_dialog').dialog("close");
}

function setTitle(){
    $.ajax({
       method:"GET",
       url: "/title"
    }).done(function(data){
        $("#projectTitle").html(data);
    });
}
/**
 * Show dialog which contains local branches.
 */
function getBranches() {
    var dialog = $("#help_dialog");
    dialog.dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        height: 300,
        width: 300,
        title: 'Branches',
        buttons: []
    });
    dialog.html("");

    $.get("/list-branches", function (data) {
        dialog.html(data);
    });

    dialog.dialog("open");
}


/**
 * Set name of using repository.
 * @param repoName name of using repository.
 */
function setBranch(branchName) {
    $.post("/list-branches", {name: branchName}, function () {
        setFileTree();
        setTitle();
    });
    $('#help_dialog').dialog("close");
}

/**
 * Show dialog which contains local branches.
 */
function createBranch() {
    var dialog = $("#help_dialog");
    dialog.dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        height: 300,
        width: 300,
        title: 'new branch',
        buttons: []
    });
    dialog.html("");

    $.get("/create-branch", function (data) {
        dialog.html(data);
        setTitle();
    });

    dialog.dialog("open");
}

function createNewBranch() {
    var branchName;
    branchName = $('#newBranchTextField').val();
    $.post("/create-branch", {branch: branchName}, function () {
    }).done(function (data){
        $('#help_dialog').dialog("close");
    }). fail(function (data){
        $('#help_dialog').html(data.responseText);
    });
}

function openLoginDialog() {
    var dialog = $("#help_dialog");
    dialog.dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        height: 300,
        width: 300,
        title: 'Branches',
        buttons: []
    });
    var send_form = $('#loginFormId').clone();
    send_form.prop('id', "sendLoginFormId");
    dialog.html(send_form.prop('outerHTML'));
    dialog.dialog("open");
}

function loginToGitHub() {
    var fd = new FormData($('#sendLoginFormId')[0]);
    $.ajax({
       type: 'POST',
       cache: false,
       data: fd,
       processData: false,
       contentType: false,
       url: $('#sendLoginFormId').prop('action')
    }).done(function (data){
        window.location.reload();
    }). fail(function (data){
        $('#help_dialog').html(data.responseText);
    });
    
}

/**
 * Set text from input file to editor.
 * @param fileName name of reading file
 */
function getFile(fileName) {
    $.post("/get-file", {fileName: fileName}, function (data) {

        $('#editor').val(data);
        sendMarkdown();
    })
}

/**
 * Commit actual file and show information about result.
 */
function commit() {
    $.post("/commit-file", {data: $('#editor').val()}, function (data) {
        alert(data);
    })
}

/**
 * Show dialog for creating new file
 */
function newFileDialog() {
    var dialog = $("#help_dialog"); 
    dialog.dialog({
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
                    var textArea = $('#fileName'); 
                    if (textArea.val() != '') {
                        newFile(textArea.val());
                    }
                }
            }
        ]
    });

    var html = '<label>Write name of new file.</label></label><input id="fileName" type="text" name="repository">';
    dialog.html(html);

    dialog.dialog('open');
}

/**
 * Create new file and reload componenst on page.
 * @param fileName name of new file.
 */
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

/**
 * Open page for user login.
 * @param link url address
 */
function login(link) {
    window.location.href = link;
}

/**
 * Logout user from application and reload page.
 */
function logout() {
    $.post('/logout', function () {
        $('#editor').val('');
        sendMarkdown();
        window.location.reload()
    });
}

/**
 * Call pull request to server.
 */
function pull() {
    $.post('/pull', function (data) {
        $('#editor').val('');
        sendMarkdown();
        alert(data);
    })
}

/**
 * Call request on reset repository on server.
 */
function reset() {
    $.post('/reset-repo', function (data) {
        setFileTree();
        $('#editor').val('');
        sendMarkdown();
        alert(data);
    });
}