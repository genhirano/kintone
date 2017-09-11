(function () {
    "use strict";
    // イベントフック
    kintone.events.on([
        'app.record.create.change.チェックボックス',
        'app.record.edit.change.チェックボックス',
        'mobile.app.record.create.change.チェックボックス',
        'mobile.app.record.edit.change.チェックボックス'
    ], toStr);
    // チェックボックスの選択を、カンマ区切りで結合してセット
    function toStr(event) {
        var concatStr = event.record['チェックボックス']['value'].join(",");
        event.record['チェックボックス文字']['value'] = concatStr;
        return (event);
    }
})();
