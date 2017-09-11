///<reference path="../kintone.d.ts" />
(function () {
    "use strict";
    //イベントフック
    kintone.events.on([
        'app.record.create.change.生年月日',
        'app.record.edit.change.生年月日',
        'mobile.app.record.create.change.生年月日',
        'mobile.app.record.edit.change.生年月日'
    ], calcAge);
    // 年齢計算
    function calcAge(event) {
        //計算元（生年月日）のチェックと、計算結果（年齢）の初期化
        if (undefined == event.record['生年月日']['value']) {
            event.record['年齢']['value'] = '生年月日未入力';
            return (event);
        }
        else {
            event.record['年齢']['value'] = '';
        }
        //生年月日を年・月・日に分解
        var splitedBirthDay = event.record['生年月日']['value'].split('-');
        var _birth = parseInt("" + splitedBirthDay[0] + splitedBirthDay[1] + splitedBirthDay[2]);
        //システム日付を年・月・日に分解
        var today1 = new Date();
        var _today = parseInt("" + today1.getFullYear() + affixZero(today1.getMonth() + 1) + affixZero(today1.getDate())); // 文字列型に明示変換後にparseInt
        //システム日付と生年月日の差で年齢を算出
        var age = Math.floor((_today - _birth) / 10000);
        event.record['年齢']['value'] = (0 <= age) ? age : "年齢計算不可";
        return (event);
    }
    //二桁の左ゼロパディング（簡易）
    function affixZero(int) {
        if (int < 10)
            int = "0" + int;
        return "" + int;
    }
    ;
})();
