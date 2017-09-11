var RE_CREATE_CHANGE = 'app.record.create.change.';
var RE_EIDT_CHANGE = 'app.record.edit.change.';
var RE_DETAIL_SHOW = 'app.record.detail.show';
var RE_CREATE_SHOW = 'app.record.create.show';
var RE_EIDT_SHOW = 'app.record.edit.show';
"use strict";
kintone.events.on(RE_CREATE_CHANGE + 'ラジオボタン', function (e) {
    var record = e.record;
    record.getFieldElement("aaa");
    record["フィールド名"]["value"] = "";
});
