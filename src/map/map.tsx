import React from "react";
import BaseEvent from "ol/events/Event";
import ReactDOM from "react-dom";
import Overlay from "ol/Overlay.js"
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { VectorLayer } from "./layers";
import { TMapProps, IMapContext, TMapState } from "./map-types";
import "ol/ol.css";
import "./map.css";

export const MapContext = React.createContext<IMapContext | void>(undefined);

export class MapComponent extends React.PureComponent<TMapProps, TMapState> {
  private mapDivRef: React.RefObject<HTMLDivElement>;
  //private popup: React.RefObject<HTMLDivElement>;
  //private overlay: React.RefObject<HTMLDivElement>;
  state: TMapState = {};

  constructor(props: TMapProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.mapDivRef = React.createRef<HTMLDivElement>();
    //this.popup = React.createRef<HTMLDivElement>();
    //this.overlay = React.createRef<HTMLDivElement>();
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    //document.getElementById("input").setAttribute('value','e.target.value.toString()')
    e.target.setAttribute('value',e.target.value.toString())
    //e.target.value="1234567";
    console.log(e.target.id.toString())
  }

  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    alert('Отправленное имя: ' + document.getElementById("input")?.getAttribute('value')?.toString() )
    e.preventDefault()
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
        <div data-options="region:'north'" style={{color:"white",background:'#2D3E50',float:'right', width:200}} >
        <form onSubmit={this.handleSubmit}>
        <label>
          Имя:
          <input
            id="input"
            type="text"
            onChange={this.handleChange}
          />
        </label>
        <input type="submit" value="Отправить" />
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
