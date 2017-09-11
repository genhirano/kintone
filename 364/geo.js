var google;
(function (google) {
    var maps;
    (function (maps) {
        var Marker;
        (function (Marker) {
        })(Marker = maps.Marker || (maps.Marker = {}));
    })(maps = google.maps || (google.maps = {}));
})(google || (google = {}));
(function () {
    "use strict";
    var map;
    var infowindow;
    var markerList = new Object();
    var traceLineList = new Object();
    kintone.events.on(['app.record.detail.show', 'mobile.app.record.detail.show'], detailShow);
    kintone.events.on(['app.record.edit.show', 'mobile.app.record.edit.show'], detailShow);
    function load(src) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        if (kintone.app.record.getHeaderMenuSpaceElement()) {
            try {
                var head = kintone.app.record.getHeaderMenuSpaceElement();
                head.appendChild(script);
            }
            catch (e) {
                return;
            }
        }
        if (kintone.mobile.app.getHeaderSpaceElement()) {
            try {
                var head = kintone.mobile.app.getHeaderSpaceElement();
                head.appendChild(script);
            }
            catch (e) {
                return;
            }
        }
    }
    function detailShow(event) {
        if (map == undefined) {
            loadGMap();
        }
        waitLoaded(event, 'detail', 10000, 100);
    }
    function loadGMap() {
        var nativeWrite = document.write;
        document.write = function (html) {
            var m = html.match(/script.+src="([^"]+)"/);
            if (m) {
                load(m[1]);
            }
            else {
                nativeWrite(html);
            }
        };
        load('https://maps-api-ssl.google.com/maps/api/js?key=AIzaSyAMAI4o7qXi5Mxqrtevt-694LBovVtPghE&v=3');
    }
    function waitLoaded(event, mode, timeout, interval) {
        setTimeout(function () {
            timeout -= interval;
            if ((typeof google !== 'undefined') && (typeof google.maps !== 'undefined') && (typeof google.maps.version !== 'undefined')) {
                setLocationDetail(event);
            }
            else if (timeout > 0) {
                waitLoaded(event, mode, timeout, interval);
            }
        }, interval);
    }
    function setLocationDetail(event) {
        var rec = event.record;
        console.log(event.type);
        if ((event.type == "app.record.detail.show") || (event.type == "app.record.edit.show")) {
            var elMapContainer = kintone.app.record.getSpaceElement('Map');
            if (elMapContainer == undefined) {
                return;
            }
            var elMapContainerParent = elMapContainer.parentNode;
            elMapContainerParent.setAttribute('style', 'width:100%; height:80%; overflow:auto;');
        }
        else if ((event.type == "mobile.app.record.detail.show") || ("mobile.app.record.edit.show")) {
            var elMapContainer = kintone.mobile.app.getHeaderSpaceElement();
        }
        var check = document.getElementsByName('map');
        if (check.length !== 0) {
            elMapContainer.removeChild(check[0]);
        }
        var elMap = document.createElement('div');
        elMap.setAttribute('id', 'map');
        elMap.setAttribute('name', 'map');
        elMapContainer.insertBefore(elMap, elMapContainer.firstChild);
        elMap.setAttribute('style', 'width:80%; height:800px; overflow:auto; resize=both;');
        var initLat;
        var initLng;
        if (0 >= event.record['table'].value.length) {
            initLat = "35.812408";
            initLng = "140.51699199999996";
        }
        else {
            initLat = event.record['table'].value[0].value['table_lat'].value;
            initLng = event.record['table'].value[0].value['table_lng'].value;
        }
        var point = new google.maps.LatLng(initLat, initLng);
        var opts = {
            zoom: 15,
            center: point,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: true,
        };
        map = new google.maps.Map(document.getElementById('map'), opts);
        createMarker(event);
        infowindow = new google.maps.InfoWindow({
            content: "初期値",
        });
        if (0 <= event.record['table'].value.length) {
            var isFirst = true;
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
                if (lg <= minX) {
                    minX = lg;
                }
                if (lg > maxX) {
                    maxX = lg;
                }
                if (lt <= minY) {
                    minY = lt;
                }
                if (lt > maxY) {
                    maxY = lt;
                }
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
            var pos = new google.maps.LatLng(tableRecords[i].value['table_lat']['value'], tableRecords[i].value['table_lng']['value']);
            var lineStr = tableRecords[i].value['table_tracePoint']['value'].split("|").filter(function (a) { return a != ""; });
            var a = [];
            for (var ss in lineStr) {
                var ttt = lineStr[ss].split(",");
                a.push(new google.maps.LatLng(Number(ttt[0]), Number(ttt[1])));
            }
            if (0 == a.length) {
                a.push(new google.maps.LatLng(pos.lat() - 0.0001, pos.lng() - 0.0001));
            }
            console.log(a);
            var isEditMode = false;
            if ((event.type == "app.record.edit.show") || (event.type == "mobile.app.record.edit.show")) {
                isEditMode = true;
            }
            var points = [pos].concat(a);
            var plOpts = {
                map: map,
                clickable: isEditMode,
                editable: isEditMode,
                path: points,
                visible: true
            };
            var traceLine = new google.maps.Polyline(plOpts);
            var addedMarker = new google.maps.Marker({
                position: pos,
                draggable: isEditMode,
                map: map,
                title: tableRecords[i].value['placename'].value,
            });
            addedMarker.addListener('click', function () {
                if (infowindow != undefined) {
                    infowindow.close;
                }
                infowindow.setContent(this.getTitle());
                infowindow.open(map, this);
            });
            markerList[addedMarker.getTitle()] = addedMarker;
            traceLineList[addedMarker.getTitle()] = traceLine;
        }
    }
    kintone.events.on(['app.record.edit.submit', 'mobile.app.record.edit.submit'], function (event) {
        var tableRecords = event.record['table'].value;
        for (var key in markerList) {
            for (var i = 0; i < tableRecords.length; i++) {
                if (tableRecords[i].value['placename'].value === markerList[key].getTitle()) {
                    tableRecords[i].value['table_lat'].value = markerList[key].getPosition().lat();
                    tableRecords[i].value['table_lng'].value = markerList[key].getPosition().lng();
                    var tmp = "";
                    for (var j = 0; j < traceLineList[key].getPath().getLength(); j++) {
                        tmp = tmp
                            + "|"
                            + traceLineList[key].getPath().getAt(j).lat().toString()
                            + ","
                            + traceLineList[key].getPath().getAt(j).lng().toString();
                    }
                    if ("del" !== tableRecords[i].value['table_tracePoint'].value) {
                        tableRecords[i].value['table_tracePoint'].value = tmp;
                    }
                    else {
                        tableRecords[i].value['table_tracePoint'].value = "";
                    }
                    break;
                }
            }
        }
        return event;
    });
})();
