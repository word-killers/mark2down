/**
 * Percentage size of buttons which can show #previw or #leftPanel
 * @type {number}
 */
var showButtonsPercentWidth = 2;

/**
 * Initialize width resizing of #leftPanel, #previw and #editor.
 */
function initAdjustmentColumns() {

    $('#showLeftPanel').width(showButtonsPercentWidth +'%');
    $('#showPreview').width(showButtonsPercentWidth +'%');

    $('#left_panel').resizable({
        stop: function (event, ui) {
            if (ui.size.width < 300) {
                hideLeftPanel();
            } else {
                if ($('#preview').css('display') == 'none') {
                    adjustmentColumnSize('left_panel', 'editor', 'showPreview');
                } else {
                    adjustmentColumnSize('left_panel', 'editor', 'preview');
                }
            }
        },
        helper: 'ui-resizable-helper-right',
        handles: 'e'
    });

    $('#preview').resizable({
        helper: 'ui-resizable-helper-left',
        handles: 'w',
        stop: function (event, ui) {
            if (ui.size.width < 300) {
                hidePreview();
            } else {
                if ($('#left_panel').css('display') == 'none') {
                    adjustmentColumnSize('preview', 'editor', 'showLeftPanel');
                } else {
                    adjustmentColumnSize('preview', 'editor', 'left_panel');
                }
                document.getElementById('preview').style.left = 0;
            }
        }
    });
}

/**
 * Resize elementA to size of page width minus elemntU width and elementB width.
 * @param uiElementID element which was resize
 * @param elementAID element which will be resize
 * @param elementBID third element which is on the page and will not be resize
 */
function adjustmentColumnSize(uiElementID, elementAID, elementBID) {
    var pageWidth = $('#content').innerWidth();
    var elementUWidth = $('#' + uiElementID).width();
    var elementBWidth = $('#' + elementBID).width();

    elementUWidth = (100 * elementUWidth) / pageWidth;
    if(elementBID == 'showLeftPanel' || elementBID == 'showPreview'){
        elementBWidth = showButtonsPercentWidth;
    }else {
        elementBWidth = (100 * elementBWidth) / pageWidth;
    }
    var elementAWidth = 100 - elementBWidth - elementUWidth;

    $('#' + elementBID).width(elementBWidth + '%');
    $('#' + elementAID).width(elementAWidth + '%');
    $('#' + uiElementID).width(elementUWidth + '%');
}

/**
 * Set 50 percent of remaining width to #preview and #editor. Remaining width mean width of page minus width of third
 * component.
 * @param thirdComponentID Id of third component
 * @param thirdComponentWidth width of third component
 * @param percent true - thirdComponentWidth is in percentage, false - thirdComponentWidth is in pixels
 */
function setEditorPreviewHalf(thirdComponentID, thirdComponentWidth, percent) {
    var pageWidth = $('#content').innerWidth();
    if(!percent) {
        thirdComponentWidth = (100 * thirdComponentWidth) / pageWidth;
        $('#'+thirdComponentID).width(thirdComponentWidth + '%');
    }
    var columnWidth = (100 - thirdComponentWidth) / 2;
    $('#editor').width(columnWidth + '%');
    $('#preview').width(columnWidth + '%');

}

/**
 * Set textArea#Editor width to 100 percent minus width of buttons which can show preview and left panel.
 */
function setEditorHundredPerc() {
    $('#editor').width(100 - 2*showButtonsPercentWidth + '%');
}

/**
 * Hide left control panel and show button which can show left panel.
 */
function hideLeftPanel() {
    $('#left_panel').hide();
    $('#showLeftPanel').show();

    if ($('#preview').css('display') == 'none') {
        setEditorHundredPerc();
    } else {
        setEditorPreviewHalf('',showButtonsPercentWidth, true);
    }
}

/**
 * Display left control panel and set width of panel to 20 percent.
 */
function showLeftPanel() {
    var panelNewWidthPercent = 20;
    var panel = $('#left_panel');

    $('#showLeftPanel').hide();

    if ($('#preview').css('display') == 'none') {
        $('#editor').width(100 - panelNewWidthPercent - showButtonsPercentWidth + '%');
        panel.show();
        panel.width(panelNewWidthPercent + '%');
    } else {
        panel.show();
        panel.width(panelNewWidthPercent + '%');
        setEditorPreviewHalf('',panelNewWidthPercent, true);
    }
}

/**
 * Hide preview and show button which can display preview.
 */
function hidePreview() {
    var pageWidth = $('#content').innerWidth();
    var left_panel = $('#left_panel');
    var showPreview = $('#showPreview');

    $('#preview').hide();
    showPreview.show();

    if (left_panel.css('display') == 'none') {
        setEditorHundredPerc();
    } else {
        var leftPanelWidth = (100*left_panel.width())/pageWidth;
        $('#editor').width(100 - leftPanelWidth - showButtonsPercentWidth + '%');
        left_panel.width(leftPanelWidth+'%')
    }

    document.getElementById('preview').style.left = 0;
}

/**
 * Display preview of document and hide button which display preview.
 */
function showPreview() {
    $('#showPreview').hide();
    $('#preview').show();

    if ($('#left_panel').css('display') == 'none') {
        setEditorPreviewHalf('',showButtonsPercentWidth, true);
    } else {
        setEditorPreviewHalf('left_panel',$('#left_panel').width(), false);
    }
}