(function() {
    'use strict';

    // kintoneに添付されたファイルをダウンロード
    function getFile(url) {
        var df = new $.Deferred();
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';

        xhr.onload = function(e) {
            if (this.status === 200) {
                df.resolve(this.response);
            }
        };

        xhr.send();
        return df.promise();
    }

    // 度分秒から百分率に変換
    function toPercentage(ref, geo) {
        if (ref === 'N' || ref === 'E') {
            return geo[0] + geo[1] / 60 + geo[2] / 3600;
        } else if (ref === 'S' || ref === 'W') {
            return -(geo[0] + geo[1] / 60 + geo[2] / 3600);
        }
    }

    // EXIFの座標情報を取得
    function getExif(imageData) {
        var df = new $.Deferred();
        loadImage.parseMetaData(imageData, function(data) {
            // EXIFデータがない場合
            if (data.exif === undefined) {
                return df.resolve();
            }

            var gpsLatitude = data.exif.get('GPSLatitude');
            var gpsLatitudeRef = data.exif.get('GPSLatitudeRef');
            var gpsLongitude = data.exif.get('GPSLongitude');
            var gpsLongitudeRef = data.exif.get('GPSLongitudeRef');

            var latitude = toPercentage(gpsLatitudeRef, gpsLatitude);
            var longitude = toPercentage(gpsLongitudeRef, gpsLongitude);

            var position = {'longitude': longitude, 'latitude': latitude};

            df.resolve(position);
        });
        return df.promise();
    }

    // 緯度経度を球面メルカトル図法に変換
    function convertCoordinate(longitude, latitude) {
        return ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
    }

    // マーカーを表示するレイヤーを作成
    function makeMarkerOverlay(coordinate) {
        var imgElement = document.createElement('img');
        var imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAEuElEQVRIS32VS0xUVxjHf+cODMNjpowBKYiOPESgaIutEUVFFDVt06RNawIbFkQTV8atJMYtKxOWJhpXmrixbrqARGtjakqJlRQfUBEBxSkKlHkwL+be03yXO4j4OMnJmTv35vf9z//7vnMUHxkprbU5N4ceHEQHg5iWhbVhA0vNzeR4veQDLqXUhxDvfZHQWltXruC+cAHX2Bi43ZBKQTwOkQiYJouBALM9Pbjb2yn5QJB34JFgUOceP45rbg48HpKWRWp+HiscxkwmsdJpPMkkBdGoLfjf7duZ7e+nct068t3ut3hvPYTHxrT3xAkoLCRhGKSHhvA8fUrWqn1rYBYIAwVgWxM2DJ6PjPBZeTnevLwV5sqPcCikvUePQiBAVNTduEGW2GkYy5asGiYQAl4C8kZsCRcUsDA6yhd+P3lOABse11obHR24Z2dZ9HjI7e/HaGiA8nJIJODJE3j2bAUv6iOOegkQB8qAifZ2Np4/T01JCS6XaznToYEB7evsZKmqCuvmTXI2b4bWVqivh1AIBgfh9m0IixnLQ4DzgDg/CnwCeCXArVu0Njayzu9XaklrnezqIn9oiEg6jXd4GJqaoK0NjhyBqSno74e+PpiZWYEngP+ABWcdUYo6rRnv6uLz7m62VVcrFdFae2pqMPLziY+Pky/qtm6F5ublVUrv3j24cwecCpEIMQcq3ov6vxxr4nV1eC9e5PDOnahXsZgu9vtJVFWhRkbIsSzIzl62pLT0jefT0+94LqoFLv4/lFoXazweYtev80NzM2r6+XNdFggQ2bSJvIkJ+4OVIc1jmstz1VhyoAKWLAj8sbObT7OyWLh6lR9bWlDPXr/Wm4uLiZSUkDMzg/tj5wEglSI2CDQz5flvpUhoTVFODonLl/npwAHURCymy30+LLebUDJJ0RqVq2NZjjqBycyUYxL4VSm8WuMOBPD19PD9wYOoGa01O3aw/v59JoH1QLbjn4ClVgUqVkiFSCJlLjpwCSJled0waLAsFg4fZtvJk3zb1oaSBnrY28uXp0/bHScAqVnx3nBsyMBF4eoAApZs/KYUc0pRaVm86u7mm0OHaNm3zxbGQDCoK2pr8YRCdtaLHPWZs0EAaafVJYAoF7Xyn/TtLy4XDaZJtK6O6lOn+Lqlhbr6+uUOnQuH9R99fTQfO8ac03Fij8dRJnCZco4IXFZJrFTIzy4XNaZJngQ7c4bv9u9nd1MTfulQgZumqUeDQR5fusSec+eQPpSWliG7kCDiuQSQNQj8qRRThkGJadoWLnZ2cqStjb179lBRUfHmbLE7LhbTD1684MG1a3x19qy95QlgUikiWqOVsu2Q8ySlFPla49OaBamyjg727t5tzy1btrx9KmbKLRqN6n+mpvh9eBhvby+Vd+/aFmQ6UeASVBIcUorJXbvIa21lV20tOxobqayspKCg4N3zPBNAdjD98iUPJid5ND6ONTBAthy5Cwu239HCQiIbN+KurqaiuJitFRXU1NRQVla2ojjDeu8dKjkIh8MEg0FezMzwan6exXgcM50m2zDw5uZS5PfbwNLSUnw+n+3x2ub+4M2d+TCVSul4PE4ikZDECwSPXCi5ubjX3Jlr4f8DloQA2Qa+XxMAAAAASUVORK5CYII=';

        imgElement.setAttribute('src', imgSrc);

        var markerOverlay = new ol.Overlay({
            element: imgElement,
            position: coordinate,
            positioning: 'center-center'
        });

        return markerOverlay;
    }

    // 地図を表示し、ピンを立てる
    function setPin(space, fileKeyList) {
        var map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                zoom: 15
            })
        });

        Promise.all(fileKeyList.map(function(fileKey) {
            var fileUrl = '/k/v1/file.json?fileKey=' + fileKey;
            return getFile(fileUrl);
        })).then(function(imageBlobList) {
            return Promise.all(imageBlobList.map(function(imageBlob) {
                return getExif(imageBlob);
            }));
        }).then(function(positionList) {
            var existPosition = false;

            var minLongitude = 180, minLatitude = 90;
            var maxLongitude = -180, maxLatitude = -90;
            for (var i = 0; i < positionList.length; i++) {
                var position = positionList[i];
                // EXIFデータがない場合
                if (position === undefined || position.longitude === undefined || position.latitude === undefined) {
                    continue;
                }
                existPosition = true;

                var longitude = position.longitude;
                var latitude = position.latitude;
                var coordinate = convertCoordinate(longitude, latitude);
                var marker = makeMarkerOverlay(coordinate);
                map.addOverlay(marker);

                if (longitude < minLongitude) {
                    minLongitude = longitude;
                }
                if (latitude < minLatitude) {
                    minLatitude = latitude;
                }
                if (longitude > maxLongitude) {
                    maxLongitude = longitude;
                }
                if (latitude > maxLatitude) {
                    maxLatitude = latitude;
                }
            }

            if (existPosition === false) {
                $(space).text('位置情報が取得できないため、地図を表示できません');
                $(space).css('text-align', 'center').css('padding', '20px');
            } else if ((minLongitude === maxLongitude) && (minLatitude === maxLatitude)) {
                map.getView().setCenter(convertCoordinate(minLongitude, minLatitude));
            } else {
                // 座標が複数の場合は、中心を計算する
                var extent = ol.proj.transformExtent([minLongitude, minLatitude, maxLongitude, maxLatitude],
                  'EPSG:4326', 'EPSG:3857');
                map.getView().fit(extent, map.getSize());
            }
        }).catch(function(error) {
            console.log('ERROR', error);
        });
    }

    kintone.events.on('app.record.detail.show', function(event) {
        var record = event.record;

        var space = kintone.app.record.getSpaceElement('map');
        $(space).append('<div id="map" style="width:100%; height:600px"></div>');

        var fileKeyList = [];
        for (var i = 0; i < record.pic.value.length; i++) {
            var fileKey = record.pic.value[i].fileKey;
            fileKeyList.push(fileKey);
        }

        setPin(space, fileKeyList);
    });

    kintone.events.on('app.record.index.show', function(event) {
        // 地図を表示済みの場合は一旦削除
        if ($('div#map').length > 0) {
            $('div#map').remove();
        }

        var space = kintone.app.getHeaderSpaceElement();
        $(space).append('<div id="map" style="width:90%; height:600px"></div>');
        $('div#map').css('margin', '5px auto');

        var fileKeyList = [];
        for (var i = 0; i < event.records.length; i++) {
            var record = event.records[i];
            for (var j = 0; j < record.pic.value.length; j++) {
                var fileKey = record.pic.value[j].fileKey;
                fileKeyList.push(fileKey);
            }
        }

        setPin(space, fileKeyList);
    });

})();
