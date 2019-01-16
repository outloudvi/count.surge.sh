import * as $ from "jquery";
import * as Reducer from './reducer';
import { createStore } from 'redux';

console.log("TypeScript working well w/ Webpack");
const GLOBAL_DEBUG = true;

//----------------------------------------------------

var store = createStore(Reducer.counter)
var storageData = [];
var targetLength = 0;

var $preStatus = $('#prerunStatus');
var $result = $('#result');

if (GLOBAL_DEBUG) {
  store.subscribe(() => console.log(store.getState().data))
}

function createInterface_Import(initial: number[]) {
  store.dispatch({
    type: 'IMPORT',
    data: initial
  });
  $('#divInitialize').hide();
  $('#divWriting').css('display', 'flex');
  updateRightColumn();
  targetLength = initial.length - 1;
}

function createInterface_Init(length: number): void {
  store.dispatch({
    type: 'SET_LENGTH',
    length: length
  });
  $('#divInitialize').hide();
  $('#divWriting').css('display', 'flex');
  updateRightColumn();
  targetLength = length;
}

function updateRightColumn(): void {
  let currentStore = store.getState();
  let cF = currentStore.edited[0];
  let cT = currentStore.edited[1];
  $result.html('<ul>' +
    currentStore.data.map((a, b) => {
      if (b == 0) return;
      if (b >= cF && b <= cT) return `<li style="background-color: yellow">${b}: ${a}</li>`;
      else return `<li>${b}: ${a}</li>`;
    }).join('')
    + '</ul>');
  if (currentStore.revisionid === 0){
    $('#undoBtn').prop('disabled',true);
  } else {
    $('#undoBtn').prop('disabled',false);
  }
}

function createCsv(): string {
  let currentStore = store.getState();
  let blob = new Blob(<BlobPart[]><unknown>currentStore.data, { type: 'text/comma-separated-values', endings: 'transparent' });
  return URL.createObjectURL(blob);
}

function refreshStorageData(): void {
  if (!window.localStorage.getItem('count__')) {
    window.localStorage.setItem('count__', JSON.stringify([]));
    storageData = [];
  } else {
    storageData = JSON.parse(window.localStorage.getItem('count__'));
  }
}

function refreshLS(): void {
  refreshStorageData();

  $('#loadMenu').children().each(function (index: number, elem: HTMLElement) {
    if (typeof storageData[index] == typeof [] && storageData[index].length > 0) {
      $(this).text(`Save #${index + 1} (length: ${storageData[index].length - 1})`)
        .click(() => createInterface_Import(storageData[index]))
        .css('color','black');
    } else {
      $(this).text(`Save #${index + 1} (empty)`)
        .css('color', 'grey');
    }
  });

  $('#saveMenu').children().each(function (index: number, elem: HTMLElement) {
    if (typeof storageData[index] == typeof [] && storageData[index].length > 0) {
      $(this).text(`Save #${index + 1} (length: ${storageData[index].length - 1})`)
    } else {
      $(this).text(`Save #${index + 1} (empty)`)
    }
    $(this).off('click')
           .click(() => {
      storageData[index] = store.getState().data;
      window.localStorage.setItem('count__', JSON.stringify(storageData));
      refreshLS();
    });
  });
}

// ----------------------------------------------------

$('#prerunStartBtn').click( function () {
  let iVal = Number($('#preInputLength').val());
  let iText = $('#preInputText').val();
  let iArray = [];
  if (iVal) {
    if (iVal > 70) {
      $(this)
        .removeClass('btn-primary')
        .addClass('btn-warning')
        .text('Are you sure? Click again to confirm')
        .click( () => createInterface_Init(iVal) );
      return;
    }
    createInterface_Init(iVal);
    return;
  }
  try {
    iArray = JSON.parse(<string>iText);
  } catch (err) {
    $preStatus.text('Failed to extract data from JSON.');
    $('#prerunStartBtn').removeClass('btn-primary').addClass('btn-warning');
    setTimeout(() => {
      $('#prerunStartBtn').removeClass('btn-warning').addClass('btn-primary');
    }, 500);
    return;
  }
  createInterface_Import(iArray);
});

$('#dlBtn').click(() => {
  let url;
  try {
    url = createCsv;
  } catch (err) {
    console.log(err);
    $('#dlBtn').removeClass('btn-secondary').addClass('btn-warning');
    setTimeout(() => {
      $('#dlBtn').removeClass('btn-warning').addClass('btn-secondary');
    }, 500);
    return;
  }
  $('#csvBlobA').attr('href', url);
  $('#csvBlobBtn').show();
});

$('#addBtn').click(() => {
  let flag = true;
  let cmd = <string>($('#numTxt').val());
  for (let i of cmd.split(',')) {
    if (i.match(/^[0-9]+-[0-9]+$/)) {
      let match = i.match(/^([0-9]+)-([0-9]+)$/);
      let from = Number(match[1]);
      let to = Number(match[2]);
      if (from > targetLength && to > targetLength ) {
        flag = false;
        continue;
      };
      from = Math.min(from,targetLength);
      to = Math.min(to,targetLength);
      if (from > to) {
        let r = from;
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
      let match = i.match(/^-([0-9]+)$/);
      let target = Number(match[1]);
      if (target > targetLength) {
        flag = false;
        continue;
      };
      store.dispatch({
        type: 'DOWNDATE',
        target: target
      });
    }
    if (i.match(/^[0-9]+$/)) {
      let match = i.match(/^([0-9]+)$/);
      let target = Number(match[1]);
      if (target > targetLength) {
        flag = false;
        continue;
      };
      store.dispatch({
        type: 'UPDATE',
        from: target,
        to: target
      })
    }
  }
  updateRightColumn();
  $('#numTxt').val('')
    .prop('placeholder', flag === true ? 'Just continue.' : 'We failed to process some of your input. They are ignored and you can continue.')
});

$('#undoBtn').click( () => {
  store.dispatch({
    type: 'UNDO'
  });
  updateRightColumn();
  $('#numTxt').prop('placeholder','Undoed!')
})

document.addEventListener('keydown', (e) => {
  if (targetLength === 0) {
    if (e.key === 'Enter') {
      $('#prerunStartBtn').click();
    } else {
      console.log('not right it')
      return;
    }
  }

  if (e.key === 'Enter') {
    $('#addBtn').click();
    return;
  }
  let $numTxt = $('#numTxt');
  if ($('#numTxt').is(':focus')) {
    if ((e.keyCode >= 48 && e.keyCode <= 57) || e.key === '-' || e.key === ',') {
    $numTxt.val($numTxt.val() + e.key);
    return;
  }
  }
  if (e.key === 'Backspace') {
    let text = <string>$numTxt.val();
    $numTxt.val(text.slice(0,text.length-1));
    return;
  }
  if (e.key === 'U' || e.key === 'u') {
    $('#undoBtn').click();
    return;
  }
});

$('#btnExportJSON').click(() => {
  let currentStore = store.getState();
  $('#txModelText').text(
    JSON.stringify(currentStore.data)
  )
});

if (window.localStorage) {
  refreshLS();
} else {
  $('.nav-item.dropdown').hide();
}