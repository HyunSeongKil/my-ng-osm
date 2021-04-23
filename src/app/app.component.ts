import { Component } from '@angular/core';

declare var ol: any;

interface MyLayer {
  index: number;
  name: string;
  type: string;
  layer: any;
}

/**
 * @see ol heatmap https://lts0606.tistory.com/204
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'my-ng-osm';

  //맵
  map: any;

  //대한민국 전도
  KOREA_LON = 128.02025;
  KOREA_LAT = 38.03375;
  KOREA_ZOOM_LEVEL = 6.5;

  //클릭된 좌표
  clickedLon: any;
  clickedLat: any;
  

  //레이어 목록
  myLayers: MyLayer[] = [];

  /**
   *
   */
  ngOnInit() {
    this.initMyLayers();

    this.initMap();    
    
    this.gotoHome();

    this.setEventHandler();
    
  }


  /**
   * 맵 초기화
   */
  initMap(){
    var mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(4),
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;',
    });

    let self = this;

    this.map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults({
          attributionOptions: {
            collapsible: false,
          },
        }).extend([mousePositionControl]),
      layers: self.getLayers(),
    });


  }

  /**
   * mylayers에서 layer 목록만 추출
   * @returns
   */
  getLayers() {
    let arr = [];

    this.myLayers.forEach((x) => {
      arr.push(x.layer);
    });

    return arr;
  }

  /**
   * 이벤트 등록
   */
  setEventHandler() {
    //맵 클릭
    this.map.on('click', (args) => {
      let lonLat = ol.proj.transform(args.coordinate, 'EPSG:3857', 'EPSG:4326');

      this.clickedLon = lonLat[0];
      this.clickedLat = lonLat[1];
    });
  }

  /**
   * 집으로
   */
  gotoHome() {
    this.flyTo(this.KOREA_LON, this.KOREA_LAT, this.KOREA_ZOOM_LEVEL);
  }

  /**
   * 좌표 이동
   * @param lon
   * @param lat
   * @param zoom
   */
  flyTo(lon: number, lat: number, zoom: number) {
    let location = ol.proj.fromLonLat([lon, lat]);
    this.map.getView().setCenter(location);
    this.map.getView().setZoom(zoom);
  }


  /**
   * mylayers 초기화(레이어 목록 생성)
   */
  initMyLayers() {
    this.myLayers.push({
      index: 0,
      name: '기본지도',
      type: 'tile',
      layer: new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: false,
      }),
    });
  

    this.myLayers.push({
      index: 1,
      name: '지진',
      type: 'image',
      layer: new ol.layer.Image({
        //extent: [122.39054481751533, 32.28941544200261, 131.478217687952, 41.59959174796662],
        source: new ol.source.ImageWMS({
          url: 'http://localhost:28080/geoserver/wms',
          params: { LAYERS: 'sdt:Earth_Quake_1978-2019' },
          serverType: 'geoserver',
        }),
        visible: false,
      }),
    });
  

    this.myLayers.push({
      index: 2,
      name: '열지도',
      type: 'vector',
      layer: new ol.layer.Heatmap({
        source: new ol.source.Vector({
          url: 'assets/earth_quake.kml',
          format: new ol.format.KML({
            extractStyles: false,
          }),
        }),
        visible: false,
        blur: 15,
        radius: 20,
      }),
    });
  }


  /**
   * on/off layer
   * @param event 
   * @param myLayer 
   */
  onOffLayer(event: Event, myLayer:MyLayer){
    let el = (event.target||event.currentTarget) as HTMLInputElement;
    
    let b = el.checked;

    this.map
      .getLayers()
      .getArray()[myLayer.index]
      .setVisible(b);

  }
  
}
