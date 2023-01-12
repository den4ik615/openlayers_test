import React from "react";
import { MapBrowserEvent } from "ol";
import { Interaction } from "ol/interaction";
import Draw, {
  createBox,
  createRegularPolygon,
} from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {getArea} from 'ol/sphere'
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { FeatureLike } from "ol/Feature";
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
import { features } from "process";
import Geometry from "ol/geom/Geometry";
import GeometryType from "ol/geom/GeometryType";

const selectStyle = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

// const featureOverlay = new VectorLayer({
//   source: new VectorSource(),
//   map: map,
//   style: new Style({
//     stroke: new Stroke({
//       color: 'rgba(255, 255, 255, 0.7)',
//       width: 2,
//     }),
//   }),
// });
let elm : Feature;
elm=new Feature({
});

let draw : Draw; // global so we can remove it later

export const SelecElm = {
  elem : elm, //выделенный объект
  flag : false, //был загружен объект из файла
  type : 'None' //тип отрисовываемой фигуры
};

class VectorLayerComponent extends React.PureComponent<
  TVectorLayerComponentProps
> {
  layer: VectorLayer;
  source: VectorSource;
  cnt: number;
  points: Array<Coordinate>;
  selected: any = null;

  componentDidMount() {
    this.source = new VectorSource({
      features: undefined,
    });

    this.layer = new VectorLayer({
      source: this.source,
    });

    this.cnt = 0; // количество точек 
    this.points = []; //массви точек вручную рисуемого объекта

    this.props.map.addLayer(this.layer);//доюавляем слой на карту
    this.props.map.on("singleclick", this.onMapClick);//обработка событий одиночных кликов
    this.props.map.on("dblclick",this.dblMapClick);//двойной клик
    this.props.map.on("pointermove",this.selectObj);//перемещение курсора, для выделения обЪекта


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

  selectObj = (event: MapBrowserEvent) =>
  {
    let sel : FeatureLike[];//массив выделенных объектов(полигонов)
    sel = this.props.map.getFeaturesAtPixel(event.pixel);//объект(полигон) под курсором
    //console.log(sel.length)

    if(SelecElm.flag)//был загружен полигон из файла
    {
      this.source.addFeatures([SelecElm.elem]);//добавляем полигон на карту
      SelecElm.flag = false;//сбрасываем флаг загрузки из файла
    }

    if(sel.length)//есть выделенные элементы
    {
      this.selected = sel[0];//текущий элемент
      SelecElm.elem=this.selected;//текущий элемент для передачи на верхний уровень для обработки в меню
      this.selected.setStyle(selectStyle)//задаем стиль выделенному полигону
      this.selected.setProperties({'square':getArea(this.selected.getGeometry())/1000/1000});//высчитываем площадь
      document.getElementById("select_name")?.setAttribute('value',this.selected.getProperties().name)//отображаем в инпуте имя текущего полигона
      document.getElementById("input_square")?.setAttribute('value',this.selected.getProperties().square)//отображаем в инпуте площадь текущего полигона
    }
    else//убран курсор с полигона
    {
      if (this.selected !== null) //был выделен полигон
      {
        this.selected.setStyle(undefined);//очищаем стиль
        this.selected = null; //обнуляем выделенный полигон
      }
    }
  
  }

  //обраюотка кликов по карте для ручного построения полигона
  onMapClick = (event: MapBrowserEvent) => {
    //console.log(document.getElementById("type")?.getAttribute('options'));
    if(SelecElm.type==="None")//ручное построение
    {
      this.props.map.removeInteraction(draw);//удаляем текущее рисование
      this.cnt ++;//насчитываем количество точек
      const featureToAdd = new Feature({ //новая точка
        geometry: new Point(event.coordinate), //с текущими координатами
        name: "Point",
      });
      //const point = new Point(event.coordinate);
      this.points.push(event.coordinate);//накапливаем массив координат
      const style = new Style({//стиль точки 
        image: new Circle({
          radius: 3,
          fill: new Fill({color: 'red'}),
          stroke: new Stroke({
            color: [0,0,0], width: 2
          })
        })
      });
      featureToAdd.setStyle(style); //задаем стиль
      this.source.addFeatures([featureToAdd]);//добавляем на слой точку
    }
    else//анализируем выбранный тип объекта
    {
        const value = SelecElm.type;
        if (value === 'Polygon') { //полигон
          this.props.map.removeInteraction(draw);//удаляем предыдущий тип рисования
          draw = new Draw({//создаем тип отрисовки
            source: this.source,
            type: GeometryType.POLYGON
          });
          this.props.map.addInteraction(draw);//передаем на обработку
        }
        if (value === 'Box') {//прямоугольник
          this.props.map.removeInteraction(draw);//удаляем предыдущий тип рисования
          draw = new Draw({
            source: this.source,
            type: GeometryType.CIRCLE,
            geometryFunction: createBox()//функция отрисовки прямоугольника
          });
          this.props.map.addInteraction(draw);//передаем на обработку
        }
        SelecElm.type='brr';//сбрасываем тип чтоб не возникло повторной обработки отрисовки
    }
    //console.log(this.cnt);
  };

  dblMapClick = (event: MapBrowserEvent) => {
    if (this.cnt>3)
    {
      let i = 0; 
      this.points.push(this.points[0]);//замыкаем полигон добявляя в конец первую точку
      this.source.forEachFeature(element => {
        //удаляем все точки
        if(element.getGeometry().getType().toString()==="Point")//если элемент точка
        {
          this.source.removeFeature(element);//удаляем
        }
        else
        {
          console.log(i++)
        }
      });
      //создаем новый полигон
       const featurePolygon = new Feature({
         //geometry: new Polygon([linearRing.getCoordinates()]),
         geometry: new Polygon([this.points]),//полигон из накопленных координат
         name: "test",//имя по умолчанию
         square: 0,//площадь
       });
       featurePolygon.setProperties({'square':getArea(featurePolygon.getGeometry())/1000/1000});//вычисляем площадь
       //featurePolygon.setProperties('square':featurePolygon.getGeometry());
       //this.source.clear();
       this.source.addFeatures([featurePolygon]);//добавляем полигон
       //console.log(featurePolygon.getProperties().square);
       //console.log(featurePolygon.getProperties().name)
       this.points.length=0; //обнуляем массив координат
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
    //возвращаем слой с содержимым
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
