(function () {
    "use strict";
    // イベントフック
    kintone.events.on([
        'app.record.create.change.チェックボックス文字列',
        'app.record.edit.change.チェックボックス文字列',
        'mobile.app.record.create.change.チェックボックス文字列',
        'mobile.app.record.edit.change.チェックボックス文字列'
    ], toCheckbox);
    // チェックボックスの選択を、カンマ区切りで結合してセット
    function toCheckbox(event) {
        var splitStr = event.record['チェックボックス文字列']['value'].split(",");
        event.record["チェックボックス"]["value"] = splitStr;
        return (event);
    }
})();
