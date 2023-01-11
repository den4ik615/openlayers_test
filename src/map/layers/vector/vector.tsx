import React from "react";
import { MapBrowserEvent } from "ol";
import { Interaction } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { MapContext } from "../../map";
import { IMapContext } from "../../map-types";
import { TVectorLayerProps, TVectorLayerComponentProps } from "./vector-types";
import Polygon from "ol/geom/Polygon";
import { Coordinate } from "ol/coordinate";
import LinearRing from "ol/geom/LinearRing";

class VectorLayerComponent extends React.PureComponent<
  TVectorLayerComponentProps
> {
  layer: VectorLayer;
  source: VectorSource;
  cnt: number;
  points: Array<Coordinate>;

  componentDidMount() {
    this.source = new VectorSource({
      features: undefined,
    });

    this.layer = new VectorLayer({
      source: this.source,
    });

    this.cnt = 0;

    this.points = [];

    this.props.map.addLayer(this.layer);
    this.props.map.on("singleclick", this.onMapClick);
    this.props.map.on("dblclick",this.dblMapClick);
  }
  /*
  componentWillUnmount() {
    this.props.map.removeLayer(this.layer);
  }

  componentDidUpdate(prevProps: TVectorLayerComponentProps) {
    if (prevProps.features != this.props.features) {
      this.source.clear();
      if (this.props.features) {
        this.source.addFeatures(this.props.features);
      }
    }
  }
  */
  onMapClick = (event: MapBrowserEvent) => {
    this.cnt ++;
    const featureToAdd = new Feature({
      geometry: new Point(event.coordinate),
      name: "Point",
    });
    //const point = new Point(event.coordinate);
    this.points.push(event.coordinate);
    const style = new Style({
      image: new Circle({
        radius: 3,
        fill: new Fill({color: 'red'}),
        stroke: new Stroke({
          color: [0,0,0], width: 2
        })
      })
    });
    // var line_feat1 = new Feature({
    //   geometry: new LineString(this.source.getFeatures,featureToAdd.getGeometry),
    //   name: "My_Simple_LineString"
    // });
    featureToAdd.setStyle(style);    
    //var vector = new this.props.map.;
    //vector.addFeatures([new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([start_point, end_point]))]);
    //map.addLayers([vector]);
    //this.source.clear();
    //this.source.
    this.source.addFeatures([featureToAdd]);
    console.log(this.cnt);
  };

  dblMapClick = (event: MapBrowserEvent) => {
    if (this.cnt>3)
    {
      let i = 0; 
      this.points.push(this.points[0]);
      //let linearRing = new LinearRing(this.points);
      //console.log(linearRing.getCoordinates())
      //let sitePoints = [];
      this.source.forEachFeature(element => {
        //if(element.getGeometryName()==)
        //console.log(this.points[i++].getCoordinates())
        //this.points[i].transform("EPSG:4326",)
        if(element.getGeometry().getType().toString()==="Point")
        {
          this.source.removeFeature(element);
        }
      });
       const featurePolygon = new Feature({
         //geometry: new Polygon([linearRing.getCoordinates()]),
         geometry: new Polygon([this.points]),
         name: "test",
         square: 0,
       });
       //this.source.clear();
       this.source.addFeatures([featurePolygon]);
       console.log(featurePolygon.getProperties().name)
       this.points.length=0;
       this.cnt=0;
    }
  };


  render() {
    return null;
  }
}

export const VectorLayerWithContext = (props: TVectorLayerProps) => {
  console.log(props);
  return (
    <MapContext.Consumer>
      {(mapContext: IMapContext | void) => {
        if (mapContext) {
          console.log(mapContext);
          return <VectorLayerComponent {...props} map={mapContext.map} />;
        }
      }}
    </MapContext.Consumer>
  );
};
