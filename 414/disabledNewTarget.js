(function () {
  "use strict";
  kintone.events.on(['app.record.detail.show'
                   , 'mobile.app.record.detail.show']
                   , disabledNewTarget);

  function disabledNewTarget(event) {
    console.log("あああ");
    
    var openNew=document.evaluate('//a[@target="_blank"]',document,null,7,null);
    for(var i=0; i<openNew.snapshotLength; i++){
      openNew.snapshotItem(i).removeAttribute('target');
    }
  }
})();

