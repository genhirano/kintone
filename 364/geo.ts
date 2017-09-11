
///<reference path="../google.maps.d.ts" />


namespace google.maps.Marker {
  export var tracePoints: Array<google.maps.LatLng>;
}

(function() {

  "use strict";

  var map: google.maps.Map;
  var infowindow: google.maps.InfoWindow;

  //全てのマーカーをリストする。
  var markerList = new Object();
  var traceLineList = new Object();



  // 各種イベントハンドル
  kintone.events.on(['app.record.detail.show', 'mobile.app.record.detail.show'], detailShow);
  kintone.events.on(['app.record.edit.show', 'mobile.app.record.edit.show'], detailShow);

  //ヘッダに要素を追加
  function load(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;



    //PC用の場合（詳細画面）
    if (kintone.app.record.getHeaderMenuSpaceElement()) {
      try {
        var head = kintone.app.record.getHeaderMenuSpaceElement();
        head.appendChild(script);
      } catch (e) {
        return;
      }
    }
    //モバイル用の場合
    if (kintone.mobile.app.getHeaderSpaceElement()) {
      try {
        var head = kintone.mobile.app.getHeaderSpaceElement();
        head.appendChild(script);
      } catch (e) {
        return;
      }
    }
  }

  // 詳細画面を開いた時に実行します
  function detailShow(event) {
    if (map == undefined) {
      loadGMap();
    }
    waitLoaded(event, 'detail', 10000, 100);
  }

  // Google Maps APIをロード
  function loadGMap() {
    // document.write を定義
    var nativeWrite = document.write;
    document.write = function(html) {
      var m = html.match(/script.+src="([^"]+)"/);
      if (m) {
        load(m[1]);
      } else {
        nativeWrite(html);
      }
    };

    // Google Map の API ライブラリをロード
    load('https://maps-api-ssl.google.com/maps/api/js?key=AIzaSyAMAI4o7qXi5Mxqrtevt-694LBovVtPghE&v=3');
    // AIzaSyAMAI4o7qXi5Mxqrtevt-694LBovVtPghE

  }

  // Google Maps AIPIがロードされるまで待機
  function waitLoaded(event, mode, timeout, interval) {
    setTimeout(function() {
      timeout -= interval;
      if ((typeof google !== 'undefined') && (typeof google.maps !== 'undefined') && (typeof google.maps.version !== 'undefined')) {
        setLocationDetail(event);
      } else if (timeout > 0) { // ロードされるまで繰り返す
        waitLoaded(event, mode, timeout, interval);
      }
    }, interval);
  }


  function setLocationDetail(event) {
    var rec = event.record;

    console.log(event.type);
    // 地図を配置するための要素を取得する
    if ((event.type == "app.record.detail.show") || (event.type == "app.record.edit.show")) {
      //PC
      var elMapContainer = kintone.app.record.getSpaceElement('Map');
      if (elMapContainer == undefined) { // 「Map」のスペース要素が無い場合は終了
        return;
      }
      // 親要素のサイズを強制変更
      var elMapContainerParent = elMapContainer.parentNode;
      elMapContainerParent.setAttribute('style', 'width:100%; height:80%; overflow:auto;');
    } else if ((event.type == "mobile.app.record.detail.show") || ("mobile.app.record.edit.show")) {
      //スマホ
      var elMapContainer = kintone.mobile.app.getHeaderSpaceElement();
    }

    // イベントの多重化による要素生成に対応
    var check = document.getElementsByName('map');
    if (check.length !== 0) {
      elMapContainer.removeChild(check[0]);
    }

    // 地図用の要素を作成
    var elMap = document.createElement('div');
    elMap.setAttribute('id', 'map');
    elMap.setAttribute('name', 'map');

    // コンテナ要素に地図要素を追加
    elMapContainer.insertBefore(elMap, elMapContainer.firstChild);
    elMap.setAttribute('style', 'width:80%; height:800px; overflow:auto; resize=both;');

    //初期地図位置設定（データがなければここを表示）
    var initLat: any;
    var initLng: any;
    if (0 >= event.record['table'].value.length) {
      initLat = "35.812408";
      initLng = "140.51699199999996";
    } else {
      initLat = event.record['table'].value[0].value['table_lat'].value;
      initLng = event.record['table'].value[0].value['table_lng'].value;
    }

    // Google Mapの設定
    var point = new google.maps.LatLng(initLat, initLng);

    // 地図の表示の設定(中心の位置、ズームサイズ等)を設定
    var opts = {
      zoom: 15,
      center: point,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scaleControl: true,
      //scrollwheel: false
    };


    // 地図を表示
    map = new google.maps.Map(document.getElementById('map'), opts);

    //マーカー、マーカーリストの作成
    createMarker(event);
    infowindow = new google.maps.InfoWindow({
      content: "初期値",
    });


    //全てのマーカーがうまいこと画面に表示されるように、拡大率と中心位置を調整
    if (0 <= event.record['table'].value.length) {
      var isFirst: boolean = true;
      for (var key in markerList) {
        if (isFirst) {
          var minX = markerList[key].getPosition().lng();
          var minY = markerList[key].getPosition().lat();
          var maxX = markerList[key].getPosition().lng();
          var maxY = markerList[key].getPosition().lat();
          isFirst = false;
        }
        var lt = markerList[key].getPosition().lat();
        var lg = markerList[key].getPosition().lng();
        if (lg <= minX) { minX = lg; }
        if (lg > maxX) { maxX = lg; }
        if (lt <= minY) { minY = lt; }
        if (lt > maxY) { maxY = lt; }
      }
      var sw = new google.maps.LatLng(maxY, minX);
      var ne = new google.maps.LatLng(minY, maxX);
      var bounds = new google.maps.LatLngBounds(sw, ne);
      map.fitBounds(bounds);
    }
    return event;
  }

  function createMarker(event) {

    var tableRecords = event.record['table'].value;













    for (var i = 0; i < tableRecords.length; i++) {

      //マーカー座標
      var pos : google.maps.LatLng = new google.maps.LatLng(tableRecords[i].value['table_lat']['value'], tableRecords[i].value['table_lng']['value']);


      var lineStr:string[] = tableRecords[i].value['table_tracePoint']['value'].split("|").filter(a=>a!="");
      var a:google.maps.LatLng[] = [];
      for(var ss in lineStr){
        var ttt:string[] = lineStr[ss].split(",");
        a.push(new google.maps.LatLng(Number(ttt[0]), Number(ttt[1])));
      }
      if(0 == a.length){
        a.push(new google.maps.LatLng(pos.lat()-0.0001, pos.lng()-0.0001));
      }

console.log(a);
//マーカーの編集は編集モードの時のみ
var isEditMode: boolean = false;
if ((event.type == "app.record.edit.show") || (event.type == "mobile.app.record.edit.show")) {
  isEditMode = true;
}


      var points : google.maps.LatLng[] = [pos].concat(a);
      var plOpts = {
        map: map,
        clickable: isEditMode,
        editable: isEditMode,
        path: points,
        visible: true
      };
      var traceLine : google.maps.Polyline = new google.maps.Polyline(plOpts);


      //マーカーオブジェクトの作成
      var addedMarker: google.maps.Marker = new google.maps.Marker({
        position: pos,
        draggable: isEditMode,
        map: map,
        title: tableRecords[i].value['placename'].value,
      });

      //マーカークリックイベント
      addedMarker.addListener('click', function() {
        if (infowindow != undefined) {
          infowindow.close;
        }
        infowindow.setContent(this.getTitle());
        infowindow.open(map, this);
      });

      //作ったマーカーをMarkerリストに登録
      markerList[addedMarker.getTitle()] = addedMarker;
      traceLineList[addedMarker.getTitle()] = traceLine;

    }
  }

  //レコードeditsubmitイベントのフック（PC/スマホ共通）
  kintone.events.on(['app.record.edit.submit', 'mobile.app.record.edit.submit'], function(event) {
    var tableRecords = event.record['table'].value;
    for (var key in markerList) {
      for (var i = 0; i < tableRecords.length; i++) {
        if (tableRecords[i].value['placename'].value === markerList[key].getTitle()) {
          tableRecords[i].value['table_lat'].value = markerList[key].getPosition().lat();
          tableRecords[i].value['table_lng'].value = markerList[key].getPosition().lng();

          var tmp : string = "";
          for(var j = 0; j < traceLineList[key].getPath().getLength(); j++ ){
            tmp = tmp
            + "|"
            + traceLineList[key].getPath().getAt(j).lat().toString()
            + ","
            + traceLineList[key].getPath().getAt(j).lng().toString()
            ;
          }
          //とりいそぎ、保存はできないようにしておく
          if ("del" !== tableRecords[i].value['table_tracePoint'].value){
            tableRecords[i].value['table_tracePoint'].value = tmp;
          }else{
            tableRecords[i].value['table_tracePoint'].value = "";
          }

          break;
        }
      }
    }
    return event;
  });



})();
