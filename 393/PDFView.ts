///<reference path="../kintone.d.ts" />

(function() {
    'use strict';

    function getFile(url) {
        var df = new $.Deferred();
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';

        xhr.onload = function(e) {
            if (this.status === 200) {
                df.resolve(this.response);
            }
        };

        xhr.send();
        return df.promise();
    }

    kintone.events.on('app.record.detail.show', function(event) {

        var userAgent = window.navigator.userAgent.toLowerCase();
        if ( (userAgent.indexOf("chrome") < 0) && (userAgent.indexOf("firefox") < 0) ) {
            alert("このブラウザはサポートしていません。chromeかfirefoxでお試しください。　サポセン平野");
        }else{

          var record = event.record;
          var space = kintone.app.record.getSpaceElement('PDF_ViewSpace');
          var fileKey = event.record['PDFファイル'].value[0].fileKey;
          var fileUrl = '/k/v1/file.json?fileKey=' + fileKey;

          var promise = getFile(fileUrl);
          promise.done(function(pdfData) {
              var url = window.URL || window.webkitURL;
              var imageUrl = url.createObjectURL(pdfData);
              var preview = '<object data="' + imageUrl + '" type="application/pdf" width="1024px" height="100%">';
              preview += '</object>';
              $(space).append(preview).css('height', '4096');
          });
        }
    });
})();
