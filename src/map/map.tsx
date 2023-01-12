import React from "react";
//import { FileWatcher } from "typescript";
import BaseEvent from "ol/events/Event";
import ReactDOM from "react-dom";
import Overlay from "ol/Overlay.js"
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON"
import ol from "ol"
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { SelecElm } from "./layers";
import { VectorLayer } from "./layers";
import { TMapProps, IMapContext, TMapState } from "./map-types";
import "ol/ol.css";
import "./map.css";
import { toStringHDMS } from "ol/coordinate";

export const MapContext = React.createContext<IMapContext | void>(undefined);

export class MapComponent extends React.PureComponent<TMapProps, TMapState> {
  private mapDivRef: React.RefObject<HTMLDivElement>;
  public sourceDivRef: React.RefObject<HTMLDivElement>;
  //private popup: React.RefObject<HTMLDivElement>;
  //private overlay: React.RefObject<HTMLDivElement>;
  state: TMapState = {};

  constructor(props: TMapProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.renamePolygon = this.renamePolygon.bind(this);
    this.savePolygon = this.savePolygon.bind(this);
    this.openPolygon = this.openPolygon.bind(this);
    this.mapDivRef = React.createRef<HTMLDivElement>();
    //this.fileInput = React.createRef();
    //this.popup = React.createRef<HTMLDivElement>();
    //this.overlay = React.createRef<HTMLDivElement>();
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    //document.getElementById("input").setAttribute('value','e.target.value.toString()')
    //e.target.setAttribute('value',e.target.value.toString());
    document.getElementById("input_name")?.setAttribute('value',e.target.value.toString())
    //e.target.value="1234567";
    console.log("handleChange");
    console.log(e.target.value.toString());
  }

  renamePolygon(e: React.FormEvent<HTMLFormElement>) {
      alert('Отправленное имя: ' + document.getElementById("input_name")?.getAttribute('value')?.toString() );
      e.preventDefault();
      //let elm : Feature;
      //elm = SelecElm.elem;
      SelecElm.elem.setProperties({'name':document.getElementById("input_name")?.getAttribute('value')?.toString()});
      console.log(SelecElm.elem.getProperties().name);
  }

  savePolygon(e: React.FormEvent<HTMLFormElement>)
  {
    alert('Сохранить полигон: ' + SelecElm.elem.getProperties().name );
    e.preventDefault();
    //const elements: Feature[] = [];
    //elements.push(SelecElm.elem);
    const json = new GeoJSON().writeFeatureObject(SelecElm.elem, { 

      dataProjection: 'EPSG:4326', featureProjection: 'EPSG:4326'

    });

    console.log(SelecElm.elem);
    const contentType='application/json';

    var a = document.createElement("a");

    var file = new Blob([JSON.stringify(json)], {type: contentType});

    a.href = URL.createObjectURL(file);

    a.download = SelecElm.elem.getProperties().name + '.json';

    a.click();
  }

  openPolygon(e: React.ChangeEvent<HTMLInputElement>)
  {
    //const json = new GeoJSON().readFeature(e.target.value.toString())
    //console.log(json)
    e.preventDefault();
    const files = e.target.files;
    if(files?.length)
    {
      var reader = new FileReader();
      reader.onload = function(e) {
        var content = reader.result;
        //JSON.parse(content)
        if(content)
        {
          //var pars = JSON.parse(content.toString());
          const json = new GeoJSON().readFeature(JSON.parse(content.toString()));
          console.log(json);
          SelecElm.elem = json;
          SelecElm.flag = true;
        }
        //Here the content has been read successfuly
      }

      reader.readAsText(files[0]);  
    }
  }

  componentDidMount() {
    if (!this.mapDivRef.current) {
      return;
    }

    const map = new Map({
      target: this.mapDivRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 3,
      }),
    });

    const mapContext: IMapContext = { map };
    this.setState({
      mapContext: mapContext,
    });
    
    map.getViewport().addEventListener('contextmenu', (e) => {
       console.log(map.getEventCoordinate(e));
     }, true)


     // Basic overlay
    // const overlay = new Overlay({
    //   //position: [0,0],
    //   element: this.overlay.current,
    //   //positioning: 'center-center',
    //   stopEvent: false
    // });
    // map.addOverlay(overlay);

    // // Popup showing the position the user clicked
    // this.popup = new Overlay({
    //   element: ReactDOM.findDOMNode(this).querySelector('#popup')
    // });

    // // Listener to add Popup overlay showing the position the user clicked
    // this.map.on('click', evt => {
    //   this.popup.setPosition(evt.coordinate);
    //   this.map.addOverlay(this.popup);
    // })
    // map.getViewport().addEventListener('click', (e) => {
    //   console.log(e);
    // }, true)

  }


  render() {
    return (
      <div style={{ display:'flex'}}>
        <div data-options="region:'north'" ref={this.sourceDivRef} style={{color:"white",background:'#2D3E50',float:'right', width:210}} >
        <form>
          <label>Geometry type</label>
            <select id="type">
              <option value="None">None</option>
              {/* <option value="Point">Point</option>
              <option value="LineString">LineString</option> */}
              <option value="Polygon">Polygon</option>
              {/* <option value="Circle">Circle</option>
              <option value="Square">Square</option> */}
              <option value="Box">Box</option>
            </select>
        </form>
        <form onSubmit={this.renamePolygon}>
        <label>
          Имя активного полигона:
          <input
            id="select_name"
            type="text"
            readOnly={true}
          />
          Новое имя:
          <input
            id="input_name"
            type="text"
            onChange={this.handleChange}
          />
        </label>
        <label>
          Площадь:
          <input
            id="input_square"
            type="number"
            readOnly={true}
          />
        </label>
        <input type="submit" id="rename_polygon" value="Переименовать" />
      </form>
      <form onSubmit={this.savePolygon}>
        <input type="submit" id="save_geojson" value="Сохранить" />
      </form>
      <form>
        {/*  */}
        <input type="file" id="file-input" multiple onChange={this.openPolygon} accept=".json"/>
        {/*<input type="submit" id="save_geojson" value="Открыть" />*/}
      </form>
        </div>
        <div className="map" id="map" ref={this.mapDivRef} style={{float:'left'}}>
        {this.state.mapContext && (
          <MapContext.Provider value={this.state.mapContext}>
            <VectorLayer />
          </MapContext.Provider>
        )}
        </div>
      </div>
    );
  }
}
