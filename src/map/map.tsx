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
    this.renamePolygon = this.renamePolygon.bind(this);//переименование полигона
    this.savePolygon = this.savePolygon.bind(this);//сохранить в файл
    this.openPolygon = this.openPolygon.bind(this);//открыть из файла
    this.selectType = this.selectType.bind(this);//выбор типа отрисовки
    this.mapDivRef = React.createRef<HTMLDivElement>();
    //this.fileInput = React.createRef();
    //this.popup = React.createRef<HTMLDivElement>();
    //this.overlay = React.createRef<HTMLDivElement>();
  }

  selectType(e: React.ChangeEvent<HTMLSelectElement>)//обрабатываем выбранный тип
  {
      SelecElm.type=e.target.value;//передаем на другой уровень
  }
  //новое имя файла
  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    document.getElementById("input_name")?.setAttribute('value',e.target.value.toString())
    //console.log("handleChange");
    //console.log(e.target.value.toString());
  }
  //переименование файла
  renamePolygon(e: React.FormEvent<HTMLFormElement>) {
      alert('Отправленное имя: ' + document.getElementById("input_name")?.getAttribute('value')?.toString() );//уведомление о переименовании
      e.preventDefault();//отменяем перезагрузку страницы по умолчанию
      SelecElm.elem.setProperties({'name':document.getElementById("input_name")?.getAttribute('value')?.toString()});//задаем новое имя
      //console.log(SelecElm.elem.getProperties().name);
  }

  savePolygon(e: React.FormEvent<HTMLFormElement>)
  {
    alert('Сохранить полигон: ' + SelecElm.elem.getProperties().name );
    e.preventDefault();
    //создаем новый геоджейсон объект с информацией о выделенном полигоне
    const json = new GeoJSON().writeFeatureObject(SelecElm.elem, { 

      dataProjection: 'EPSG:4326', featureProjection: 'EPSG:4326'

    });

    //console.log(SelecElm.elem);
    const contentType='application/json';
    //создаем элемент ссылки для сохранения файла
    var a = document.createElement("a");
    //новый файл с содержимым из геоджейсон
    var file = new Blob([JSON.stringify(json)], {type: contentType});
    //добавляем файл
    a.href = URL.createObjectURL(file);

    a.download = SelecElm.elem.getProperties().name + '.json';
    //скачиваем имитируя нажатие на ссылку
    a.click();
  }
  //загрузка полигона из геоджейсон файла
  openPolygon(e: React.ChangeEvent<HTMLInputElement>)
  {
    //const json = new GeoJSON().readFeature(e.target.value.toString())
    //console.log(json)
    e.preventDefault();
    const files = e.target.files;//информация о выбранном файле
    if(files?.length)//файл выбран
    {
      var reader = new FileReader();//создаем ридер для чтения содержимого файла
      reader.onload = function(e) {//файл загружен
        var content = reader.result;//содержимое файла
        //JSON.parse(content)
        if(content)//файл не пустой
        {
          //var pars = JSON.parse(content.toString());
          const json = new GeoJSON().readFeature(JSON.parse(content.toString()));//преобразуем содержимое обратно в объект слоя
          //console.log(json);
          SelecElm.elem = json; //загруженный файл для отрисовки на слое
          SelecElm.flag = true; //флаг загрузки файла
        }
      }

      reader.readAsText(files[0]);  //вычитываем файл
    }
  }

  componentDidMount() {
    if (!this.mapDivRef.current) {
      return;
    }
    //создаем карту
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

  }

  //отрисовка страницы с содержимым
  render() {
    return (
      <div style={{ display:'flex'}}>
        <div data-options="region:'north'" ref={this.sourceDivRef} style={{color:"white",background:'#2D3E50',float:'right', width:210}} >
        <form>
          <label>Тип фигуры : </label>
            <select id="type" onChange={this.selectType}>
              <option value="None">Manual</option>
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
