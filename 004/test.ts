
interface IChanges{
  //テーブルに行を追加した場合：change.row は 追加した行オブジェクトを参照します。
  //テーブルの行を削除した場合：change.row は null になります。
  //テーブル外のフィールドを変更した場合：change.row は null になります。
  field:any; //	オブジェクト	変更されたフィールドのオブジェクト
  row:any; //	オブジェクト	変更されたテーブル行のオブジェクト
}


interface IRecord{
  getId():number;
  get():any;
  getFieldElement(fieldCode:string):any;
  set(recordJson:String):void;
  getHeaderMenuSpaceElement():any;
  getSpaceElement(id:String):any;
  getRelatedRecordsTargetAppId(fieldCode:string):string;
}

interface IEvent{
  appId:number; // 数値	アプリID
  record:IRecord; //	オブジェクト	レコードオブジェクト
  recordId:number; //	数値	レコードID
}

interface IEvents {
  on(eventStr:string, hndler:(e:IRecordEvent)=>void):void;
}

interface IKintone {
  events : IEvents;
}


//kintoneオブジェクトのアンビエント
declare var kintone: IKintone;



const RE_CREATE_CHANGE = 'app.record.create.change.';
const RE_EIDT_CHANGE   = 'app.record.edit.change.';
const RE_DETAIL_SHOW   = 'app.record.detail.show';
const RE_CREATE_SHOW   = 'app.record.create.show';
const RE_EIDT_SHOW     = 'app.record.edit.show';

interface IRecordEvent {
  appId:number;//	数値	アプリID
  record:any;//	オブジェクト	イベント発生時点のユーザー入力のデータを保持したレコードオブジェクト
}

interface IChangeableRecordEvent extends IRecordEvent{
  changes:IChanges;//	オブジェクト	変更されたオブジェクト
}




"use strict";

kintone.events.on(RE_CREATE_CHANGE + 'ラジオボタン', function(e:IChangeableRecordEvent) {
  var record = e.record;
  record.getFieldElement("aaa");
  record["フィールド名"]["value"] = "";
});
