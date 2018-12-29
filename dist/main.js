var store = Redux.createStore(counter);
var storageData = [];
var targetLength = 0;
var $preStatus = $('#prerunStatus');
var $result = $('#result');
function createInterface_Import(initial) {
    store.dispatch({
        type: 'IMPORT',
        data: initial
    });
    $('#divInitialize').hide();
    $('#divWriting').css('display', 'flex');
    updateRightColumn();
    targetLength = initial.length - 1;
}
function createInterface_Init(length) {
    store.dispatch({
        type: 'SET_LENGTH',
        length: length
    });
    $('#divInitialize').hide();
    $('#divWriting').css('display', 'flex');
    updateRightColumn();
    targetLength = length;
}
function updateRightColumn() {
    var currentStore = store.getState();
    var cF = currentStore.edited[0];
    var cT = currentStore.edited[1];
    $result.html('<ul>' +
        currentStore.data.map(function (a, b) {
            if (b == 0)
                return;
            if (b >= cF && b <= cT)
                return "<li style=\"background-color: yellow\">" + b + ": " + a + "</li>";
            else
                return "<li>" + b + ": " + a + "</li>";
        }).join('')
        + '</ul>');
    if (currentStore.revisionid === 0) {
        $('#undoBtn').prop('disabled', true);
    }
    else {
        $('#undoBtn').prop('disabled', false);
    }
}
function createCsv() {
    var currentStore = store.getState();
    var blob = new Blob(currentStore.data, { type: 'text/comma-separated-values', endings: 'transparent' });
    return URL.createObjectURL(blob);
}
function refreshStorageData() {
    if (!window.localStorage.getItem('count__')) {
        window.localStorage.setItem('count__', JSON.stringify([]));
        storageData = [];
    }
    else {
        storageData = JSON.parse(window.localStorage.getItem('count__'));
    }
}
function refreshLS() {
    refreshStorageData();
    $('#loadMenu').children().each(function (index, elem) {
        if (typeof storageData[index] == typeof [] && storageData[index].length > 0) {
            $(this).text("Save #" + (index + 1) + " (length: " + (storageData[index].length - 1) + ")")
                .click(function () { return createInterface_Import(storageData[index]); })
                .css('color', 'black');
        }
        else {
            $(this).text("Save #" + (index + 1) + " (empty)")
                .css('color', 'grey');
        }
    });
    $('#saveMenu').children().each(function (index, elem) {
        if (typeof storageData[index] == typeof [] && storageData[index].length > 0) {
            $(this).text("Save #" + (index + 1) + " (length: " + (storageData[index].length - 1) + ")");
        }
        else {
            $(this).text("Save #" + (index + 1) + " (empty)");
        }
        $(this).off('click')
            .click(function () {
            storageData[index] = store.getState().data;
            window.localStorage.setItem('count__', JSON.stringify(storageData));
            refreshLS();
        });
    });
}
// ----------------------------------------------------
$('#prerunStartBtn').click(function () {
    var iVal = Number($('#preInputLength').val());
    var iText = $('#preInputText').val();
    var iArray = [];
    if (iVal) {
        if (iVal > 70) {
            $(this)
                .removeClass('btn-primary')
                .addClass('btn-warning')
                .text('Are you sure? Click again to confirm')
                .click(function () { return createInterface_Init(iVal); });
            return;
        }
        createInterface_Init(iVal);
        return;
    }
    try {
        iArray = JSON.parse(iText);
    }
    catch (err) {
        $preStatus.text('Failed to extract data from JSON.');
        $('#prerunStartBtn').removeClass('btn-primary').addClass('btn-warning');
        setTimeout(function () {
            $('#prerunStartBtn').removeClass('btn-warning').addClass('btn-primary');
        }, 500);
        return;
    }
    createInterface_Import(iArray);
});
$('#dlBtn').click(function () {
    var url;
    try {
        url = createCsv;
    }
    catch (err) {
        console.log(err);
        $('#dlBtn').removeClass('btn-secondary').addClass('btn-warning');
        setTimeout(function () {
            $('#dlBtn').removeClass('btn-warning').addClass('btn-secondary');
        }, 500);
        return;
    }
    $('#csvBlobA').attr('href', url);
    $('#csvBlobBtn').show();
});
$('#addBtn').click(function () {
    var flag = true;
    var cmd = ($('#numTxt').val());
    for (var _i = 0, _a = cmd.split(','); _i < _a.length; _i++) {
        var i = _a[_i];
        if (i.match(/^[0-9]+-[0-9]+$/)) {
            var match = i.match(/^([0-9]+)-([0-9]+)$/);
            var from = Number(match[1]);
            var to = Number(match[2]);
            if (from > targetLength && to > targetLength) {
                flag = false;
                continue;
            }
            ;
            from = Math.min(from, targetLength);
            to = Math.min(to, targetLength);
            if (from > to) {
                var r = from;
                from = to;
                to = r;
            }
            store.dispatch({
                type: 'UPDATE',
                from: Number(from),
                to: Number(to)
            });
        }
        if (i.match(/^-[0-9]+$/)) {
            var match = i.match(/^-([0-9]+)$/);
            var target = Number(match[1]);
            if (target > targetLength) {
                flag = false;
                continue;
            }
            ;
            store.dispatch({
                type: 'DOWNDATE',
                target: target
            });
        }
        if (i.match(/^[0-9]+$/)) {
            var match = i.match(/^([0-9]+)$/);
            var target = Number(match[1]);
            if (target > targetLength) {
                flag = false;
                continue;
            }
            ;
            store.dispatch({
                type: 'UPDATE',
                from: target,
                to: target
            });
        }
    }
    updateRightColumn();
    $('#numTxt').val('')
        .prop('placeholder', flag === true ? 'Just continue.' : 'We failed to process some of your input. They are ignored and you can continue.');
});
$('#undoBtn').click(function () {
    store.dispatch({
        type: 'UNDO'
    });
    updateRightColumn();
    $('#numTxt').prop('placeholder', 'Undoed!');
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        $('#addBtn').click();
    }
});
$('#btnExportJSON').click(function () {
    var currentStore = store.getState();
    $('#txModelText').text(JSON.stringify(currentStore.data));
});
if (window.localStorage) {
    refreshLS();
}
else {
    $('.nav-item.dropdown').hide();
}
