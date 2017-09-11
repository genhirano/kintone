

interface IFieldProp {
    type: string;
    code: string;
    label: string;
    noLabel: boolean;
}

interface IDropdownOption {
    label: string;
    index: string;
}

interface IFieldPop_DropDown extends IFieldProp {
    required: boolean;
    options: IDropdownOption[];
    defaultValue: string;
}

interface IFieldPop_Date extends IFieldProp {
    defaultNowValue : boolean;
    defaultValue: string;
    required: boolean;
    unique: boolean;
}


interface IFields {
    revision: string;
    properties: IFieldProp[];
}


interface IChanges {
    field: IChanges_Field; //変更されたフィールドのオブジェクト
    row: any;   //変更されたテーブル行のオブジェクト
}

interface IChanges_Field{
  type: string;
  value:string;
}


interface IRecord {
    getId(fieldName: string): number;
    get(): any;
    getFieldElement(fieldCode: string): any;
    set(recordJson: string): void;
    getHeaderMenuSpaceElement(): any;
    getSpaceElement(id: string): any;
    getRelatedRecordsTargetAppId(fieldCode: string): string;
}

interface IEvent {
    appId: number; // 数値	アプリID
    record: IRecord; //	オブジェクト	レコードオブジェクト
    recordId: number; //	数値	レコードID
}

interface IKintoneAppRecord {
    setGroupFieldOpen(id: string, isOpen: boolean): void;
    getHeaderMenuSpaceElement():any;
    getSpaceElement(id : String) : any;
    getId() : string;
}

interface IEvents {
    on(eventStr: string, hndler: (e: IRecordEvent) => void): void;
    on(eventStr: string[], hndler: (e: IRecordEvent) => void): void;
}


interface IRecordEvent {
    appId: number;//	数値	アプリID
    record: any;//	オブジェクト	イベント発生時点のユーザー入力のデータを保持したレコードオブジェクト
}

interface IChangeableRecordEvent extends IRecordEvent {
    changes: IChanges;//	オブジェクト	変更されたオブジェクト
}


interface IRestAPI_GetFieldsResponse{
  properties : any;
  revision : number;
}



interface IApp {
    record: IKintoneAppRecord;
    getId(): number;
    getHeaderSpaceElement(): any;
}


interface IKintoneMobile{
  app : IMobileApp;
}

interface IMobileApp{
  getHeaderSpaceElement(): any;
}

interface IKintone {
    events: IEvents;
    app: IApp;
    mobile: IKintoneMobile;
    api: any; //関数もあり、フィールドもあるためどうしたらよいか、、
}

//kintoneオブジェクトのアンビエント
declare var kintone : IKintone;
