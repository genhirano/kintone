/// <reference path="./kintone.d.ts" />
"use strict";
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
var GroupAutoOpenClose = (function () {
    function GroupAutoOpenClose() {
    }
    GroupAutoOpenClose.prototype.execute = function (e) {
        //制御用ドロップダウンとして再世する命名規約（正規表現）
        var dropDownLabelReg = new RegExp("\≪.+?\≫");
        //制御用ドロップダウン保持
        var switchDropDownProp;
        //開閉対象グループ保持
        var targetGroupProp = [];
        //フィールド情報をJSONで一括取得
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', { "app": kintone.app.getId() }, function (resp) {
            //フィールド情報JSONをパース
            var fields = JSON.parse(JSON.stringify(resp, null, "    "));
            //全フィールドループ（種別でふるい分け）
            for (var field in fields.properties) {
                switch (fields.properties[field].type) {
                    case "DROP_DOWN":
                        //制御ドロップダウンフィールド取得
                        if (dropDownLabelReg.test(fields.properties[field].label)) {
                            //ドロップダウンフィールドの重複チェック
                            if (isDefined(switchDropDownProp)) {
                                var errMessage = "[エラー] フィールド自動開閉コントロール用のドロップダウンオブジェクトが複数存在しています。" + dropDownLabelReg.source;
                                alert(errMessage);
                                console.error(errMessage);
                            }
                            switchDropDownProp = fields.properties[field];
                        }
                        break;
                    case "GROUP":
                        //開閉対象グループフィールド取得
                        targetGroupProp.push(fields.properties[field]);
                        break;
                    default:
                        break;
                }
            }
            //ドロップダウンフィールドの存在チェック
            if (!isDefined(switchDropDownProp)) {
                var errMessage = "[エラー] フィールド自動開閉コントロール用のドロップダウンオブジェクトが見つかりません。" + dropDownLabelReg.source;
                alert(errMessage);
                console.error(errMessage);
            }
            //イベントフック
            var eventStrArr = [
                RE_CREATE_CHANGE + switchDropDownProp.code,
                RE_EDIT_CHANGE + switchDropDownProp.code,
                RE_EDIT_SHOW,
                RE_DETAIL_SHOW,
            ];
            kintone.events.on(eventStrArr, function (e) {
                //制御対象のグループはいったん全部閉じる
                var reg = new RegExp("\_.+?\_");
                targetGroupProp.forEach(function (n) {
                    if (reg.test(n.label)) {
                        kintone.app.record.setGroupFieldOpen(n.code, false);
                    }
                });
                //ヒットしたグループを開ける
                targetGroupProp.forEach(function (n) {
                    if (0 <= n.label.indexOf("_" + e.record[switchDropDownProp.code].value + "_")) {
                        kintone.app.record.setGroupFieldOpen(n.code, true);
                    }
                });
            });
        }, function (error) {
            var errMessage = "[エラー]" + error;
            alert(errMessage);
            console.error(errMessage);
        });
    };
    return GroupAutoOpenClose;
}());
var eventStrArr = [RE_DETAIL_SHOW, RE_EDIT_SHOW, RE_CREATE_SHOW];
kintone.events.on(eventStrArr, function (e) {
    var aedr = new GroupAutoOpenClose();
    aedr.execute(e);
});
