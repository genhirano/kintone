//イベントフックキー文字列
var RE_CREATE_CHANGE = 'app.record.create.change.'; //この後にフィールドコードを付ける
var RE_EDIT_CHANGE = 'app.record.edit.change.'; //この後にフィールドコードを付ける
var RE_DETAIL_SHOW = 'app.record.detail.show';
var RE_CREATE_SHOW = 'app.record.create.show';
var RE_EDIT_SHOW = 'app.record.edit.show';
//valueに値が代入されているか(Undefinedでないか)チェックする
function isDefined(value) {
    return value != undefined && value != null;
}
