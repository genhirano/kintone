/// <reference path="./kintone.d.ts" />

"use strict";

//イベントフックキー文字列
var RE_CREATE_CHANGE = 'app.record.create.change.'; //この後にフィールドコードを付ける
var RE_EDIT_CHANGE = 'app.record.edit.change.';     //この後にフィールドコードを付ける
var RE_DETAIL_SHOW = 'app.record.detail.show';
var RE_CREATE_SHOW = 'app.record.create.show';
var RE_EDIT_SHOW = 'app.record.edit.show';


//valueに値が代入されているか(Undefinedでないか)チェックする
function isDefined(value): boolean {
    return value != undefined && value != null;
}


class GroupAutoOpenClose {

    public execute(e : IRecordEvent) {
        //制御用ドロップダウンとして再世する命名規約（正規表現）
        const dropDownLabelReg = new RegExp("\≪.+?\≫");

        //制御用ドロップダウン保持
        var switchDropDownProp: IFieldPop_DropDown;

        //開閉対象グループ保持
        var targetGroupProp: Array<IFieldProp> = [];

        //フィールド情報をJSONで一括取得
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', { "app": kintone.app.getId() }, function(resp) {

            //フィールド情報JSONをパース
            var fields: IFields = JSON.parse(JSON.stringify(resp, null, "    "));

            //全フィールドループ（種別でふるい分け）
            for (var field in fields.properties) {
                switch (fields.properties[field].type) {
                    case "DROP_DOWN":
                        //制御ドロップダウンフィールド取得
                        if (dropDownLabelReg.test(fields.properties[field].label)) {
                            //ドロップダウンフィールドの重複チェック
                            if (isDefined(switchDropDownProp)) {
                                var errMessage: string = "[エラー] フィールド自動開閉コントロール用のドロップダウンオブジェクトが複数存在しています。" + dropDownLabelReg.source;
                                alert(errMessage);
                                console.error(errMessage);
                            }
                            switchDropDownProp = <IFieldPop_DropDown>fields.properties[field];
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
                var errMessage: string = "[エラー] フィールド自動開閉コントロール用のドロップダウンオブジェクトが見つかりません。" + dropDownLabelReg.source;
                alert(errMessage);
                console.error(errMessage);
            }

            //イベントフック
            const eventStrArr = [
                RE_CREATE_CHANGE + switchDropDownProp.code,
                RE_EDIT_CHANGE + switchDropDownProp.code,
                RE_EDIT_SHOW,
                RE_DETAIL_SHOW,
            ];
            kintone.events.on(eventStrArr, function(e: IChangeableRecordEvent) {

                //制御対象のグループはいったん全部閉じる
                const reg = new RegExp("\_.+?\_");
                targetGroupProp.forEach((n: IFieldProp) => {
                    if (reg.test(n.label)) {
                        kintone.app.record.setGroupFieldOpen(n.code, false);
                    }
                });

                //ヒットしたグループを開ける
                targetGroupProp.forEach((n: IFieldProp) => {
                    if (0 <= n.label.indexOf("_" + e.record[switchDropDownProp.code].value + "_")) {
                        kintone.app.record.setGroupFieldOpen(n.code, true);
                    }
                });

            });

        }, function(error) {
            var errMessage: string = "[エラー]" + error;
            alert(errMessage);
            console.error(errMessage);
        });
    }

}

const eventStrArr = [RE_DETAIL_SHOW,RE_EDIT_SHOW, RE_CREATE_SHOW];
kintone.events.on(eventStrArr, function(e: IRecordEvent) {
    var aedr: GroupAutoOpenClose = new GroupAutoOpenClose();
    aedr.execute(e);
});
