import * as ImageEditor from 'tui-image-editor';
import { SkynetClient } from "skynet-js";
import { Buttons, Popover } from 'bootstrap';
import { popper } from '@popperjs/core';
import '../scss/index.scss';

const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
  usageStatistics: false,
  loadImage: {
    path: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    name: 'Blank'
  },
  includeUI: {
    initMenu: 'filter',
    menuBarPosition: 'bottom',
  },
  cssMaxWidth: 700,
  cssMaxHeight: 500,
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70,
  },
});

function exportToSkynet() {
  console.log("Saving to skynet!");
  $('#exportToSkynet').popover({
    content: '<div id="loadingIndicator" class="spinner-grow" role="status"><span class="sr-only">Uploading...</span></div>',
    placement: 'auto',
    html: true,
    trigger: 'focus'
  });
  $('#exportToSkynet').popover('show')
  var client = new SkynetClient();
  var img = instance.toDataURL('image/png');
  var blobBin = atob(img.split(',')[1]);
  var array = [];
  for(var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
  }
  var blob=new Blob([new Uint8Array(array)], {type: 'image/png'});
  var file = new File([blob], "myImage", { type: 'image/png'});
  client.uploadFile(file).then((skylink) => {
    console.log("Skylink: " + skylink);
    client.portalUrl().then((portalUrl) => {
      var link = portalUrl + "/" + skylink.skylink.substring(6);
      $('#exportToSkynet').popover('dispose');
      $('#exportToSkynet').popover({
        content: `<a href='${link}' target="_blank">${link}</a>`,
        placement: 'auto',
        html: true,
        trigger: 'focus'
      });
      $('#exportToSkynet').popover('show');
    });
  });
}

function loadFromSkynet(skylink) {
  console.log("Loading: " + skylink);
  var client = new SkynetClient();
  client.getFullDomainUrl(skylink).then((url) => {
    console.log("Url: " + url);
    fetch(url).then((response) => {
      response.blob().then((data) => {
        let metadata = {
          type: 'image/jpeg',
        };
        let file = new File([data], "test.jpg", metadata);
        instance.loadImageFromFile(file).then((result) => {
          console.log("Resize editor");
          instance.ui.resizeEditor({
            imageSize: {oldWidth: result.oldWidth, oldHeight: result.oldHeight, newWidth: result.newWidth, newHeight: result.newHeight},
          });
          console.log("Done resize editor");
          instance.ui.activeMenuEvent();
          console.log("Done activating menu");
        });
      })
    });
  
  });
}

function showLoadFromSkynet() {
  console.log("Loading from skynet");
  $('#loadFromSkynet').popover({
    content: `<div class="input-group">
                <input id="skylinkInput" type="text" class="form-control" placeholder="skylink" aria-label="skylink" minlength="1">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button" id="loadBtn" disabled>Load</button>
                </div>
              </div>`,
    placement: 'auto',
    html: true,
    sanitize: false,
    customClass: "loadPopover"
  });
  $('#loadFromSkynet').popover('show');
  $('#skylinkInput').on('input', function( e ) {
    let $this = $( this );
    $('#loadBtn').attr( 'disabled', !$this[0].validity.valid );
  });
  $('#loadBtn').click(function(event) {
    var value = $('#skylinkInput').val();
    console.log($('#skylinkInput'));
    loadFromSkynet(value);
    $('#loadFromSkynet').popover('dispose');
  });
}

function replaceDownloadButtonWithExportToSkynet() {
  let downloadButtonSelector = '.tui-image-editor-header-buttons > button.tui-image-editor-download-btn';
  $(downloadButtonSelector).replaceWith(
         `<button class='tui-image-editor-load-skynet-image-btn' id="loadFromSkynet" style="color: #222;">
              Load Skylink
          </button>
          <button class='tui-image-editor-download-image-btn' id="exportToSkynet" style="color: #222;">
              Save to Skynet
          </button>
          <button id="skynetDocs" style="">
            <a href="https://siasky.net/docs" target="_blank"><img src="BuiltWithSkynet.png" style="height: 32px; margin-top: -3px; margin-left: -4px;"></a>
          </button>
          <button id="github" style="width: 40px; vertical-align: middle;">
            <a href="https://github.com/mjmay08/skynet-image-editor" target="_blank"><i class="fa fa-github fa-2x"></i></a>
          </button>
          `
  );
}

function replaceLogo() {
  let logoSelector = '.tui-image-editor-header-logo';
  $(logoSelector).replaceWith("");
}

function addSkynetUploadListener() {
  $('#exportToSkynet').click(exportToSkynet);
}
function addSkynetDownloadListener() {
  $('#loadFromSkynet').click(showLoadFromSkynet);
}

replaceDownloadButtonWithExportToSkynet();
replaceLogo();
addSkynetUploadListener();
addSkynetDownloadListener();