/// <reference path="./kintone.d.ts" />

//イベントフックキー文字列
const RE_CREATE_CHANGE = 'app.record.create.change.'; //この後にフィールドコードを付ける
const RE_EDIT_CHANGE = 'app.record.edit.change.';     //この後にフィールドコードを付ける
const RE_DETAIL_SHOW = 'app.record.detail.show';
const RE_CREATE_SHOW = 'app.record.create.show';
const RE_EDIT_SHOW = 'app.record.edit.show';

//記録用日付フィールドのラベルサフィックス（記録対象のラベルにこの文字をお尻につけたDATE項目が記録用日付フィールドとなる）
const SUFFIX_DATEFIELDLABEL_STR = "_日付";

"use strict";

class AutoEditDateRecord {

    //valueに値が代入されているか(Undefinedでないか)チェックする
    private isDefined(value): boolean {
        return value != undefined && value != null;
    }

    public execute(e: IRecordEvent): void {

        //フィールド情報をJSONで一括取得
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', { "app": kintone.app.getId() }, function(resp: IRestAPI_GetFieldsResponse) {

            //フィールド情報JSONをパース
            var fields: IFields = JSON.parse(JSON.stringify(resp, null, "    "));

            //全項目のFieldCodeとFieldLabelのMAP
            var allFieldCodeNameMap: { [key: string]: string; } = {};

            //記録用の日付フィールド保持用
            var dataFields: Array<IFieldPop_Date> = [];

            //日付をセットする対象のフィールドのラベル検索正規表現
            var dataFieldLabelReg = new RegExp(".*" + SUFFIX_DATEFIELDLABEL_STR);

            //全フィールドループ（種別でふるい分け）
            // see : https://cybozudev.zendesk.com/hc/ja/articles/204783170
            for (var fieldName in fields.properties) {

                //全項目の CODE : LABEL の対応をマップに保持
                allFieldCodeNameMap[fieldName] = fields.properties[fieldName].label;

                //記録用日付フィールドを取得して配列に積む
                switch (fields.properties[fieldName].type) {
                    case "DATE": //日付型フィールド
                        if (dataFieldLabelReg.test(fields.properties[fieldName].label)) {
                            dataFields.push(<IFieldPop_Date>fields.properties[fieldName]);
                        }
                        break;
                    default:
                        break;
                }
            }

            //変更日付記録フィールド名から、変更記録対象フィールドを検索してそのラベルを配列に保持
            var targetFieldLabels: Array<string> = [];
            dataFields.forEach((dateField: IFieldPop_Date) => {
                //var tmpTargetFieldLabelStr = dateField.label.replace(/_日付/g, "");
                var regExp = new RegExp(SUFFIX_DATEFIELDLABEL_STR, "g");
                var tmpTargetFieldLabelStr = dateField.label.replace(regExp, "");

                Object.keys(allFieldCodeNameMap).forEach((n) => {
                    var tmpLabel = allFieldCodeNameMap[n];
                    if ((tmpTargetFieldLabelStr === tmpLabel) && (tmpTargetFieldLabelStr !== dateField.label)) {
                        targetFieldLabels.push(n);
                    }
                });
            });

            //変更イベントのフック（変更記録対象フィールドのみ）
            targetFieldLabels.forEach((targetFieldCode => {

                //レコード作成時とレコード編集時の対象項目変更時イベントをフックする
                var eventHooks: Array<string> = [];
                eventHooks.push(RE_CREATE_CHANGE + targetFieldCode);
                eventHooks.push(RE_EDIT_CHANGE + targetFieldCode);
                kintone.events.on(eventHooks, function(e: IChangeableRecordEvent) {

                    //このフィールドの日付記録用フィールドを検索して「今日」をセット
                    Object.keys(allFieldCodeNameMap).forEach(dateFieldCode => {
                        if (allFieldCodeNameMap[targetFieldCode] + SUFFIX_DATEFIELDLABEL_STR === allFieldCodeNameMap[dateFieldCode]) {
                            //変更時の日付を取得し、それをセット用の文字列に変換
                            var dt = new Date();
                            var date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();

                            //変更日をセットする
                            e.record[dateFieldCode]['value'] = date;
                        }
                    });
                    return e;

                });

            }));

        });
    }
}

const eventStrArr = [RE_EDIT_SHOW, RE_CREATE_SHOW];
kintone.events.on(eventStrArr, function(e: IRecordEvent) {
    var aedr: AutoEditDateRecord = new AutoEditDateRecord();
    aedr.execute(e);
});
