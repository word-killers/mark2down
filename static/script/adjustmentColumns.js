var showButtonsPercentWidth = 2;

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

function setEditorHundredPerc() {
    $('#editor').width(100 - 2*showButtonsPercentWidth + '%');
}

function hideLeftPanel() {
    $('#left_panel').hide();
    $('#showLeftPanel').show();

    if ($('#preview').css('display') == 'none') {
        setEditorHundredPerc();
    } else {
        setEditorPreviewHalf('',showButtonsPercentWidth, true);
    }
}

function showLeftPanel() {
    var panelNewWidthPercent = 20;
    var panel = $('#left_panel');
    var pageWidth = $('#content').innerWidth();

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

function showPreview() {
    $('#showPreview').hide();
    $('#preview').show();

    if ($('#left_panel').css('display') == 'none') {
        setEditorPreviewHalf('',showButtonsPercentWidth, true);
    } else {
        setEditorPreviewHalf('left_panel',$('#left_panel').width(), false);
    }
}