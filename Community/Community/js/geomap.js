function GEOMAP(data, mapID, popupID){
 var geodiv = new GEODIV();
 var iconFeatures = [];
 var divList = [];
 var icon = new ol.style.Icon({
  anchor: [0.5, 0.5],
  anchorXUnits: 'fraction',
  anchorYUnits: 'fraction',
  src: 'new_pin.png'
 });
 var iconStyle = new ol.style.Style({
  image: icon
 });
 for(var i=0; i<data.length; i++){
  var div = geodiv.create(data[i]);
  var iconFeature = new ol.Feature({
   geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[i].longtitue),
   parseFloat(data[i].latitue)])),
   content: data[i],
   div: div
  });
  div.attr('id', 'gd' + i);
  iconFeature.setStyle(iconStyle);
  iconFeatures.push(iconFeature);
  divList.push(div);
 }
 var vectorSource = new ol.source.Vector({
  features: iconFeatures
 });
 var vectorLayer = new ol.layer.Vector({
  source: vectorSource
 })
 var view = new ol.View({
  center: new ol.proj.fromLonLat([114.1,22.30]),
  zoom: 10
 });
 this.map = new ol.Map({
  controls: ol.control.defaults({
   attributionOptions: {
    collapsible: false
   }
  }),
  layers: [
    new ol.layer.Tile({
     source: new ol.source.OSM()
    }),
    vectorLayer
   ],
   target: document.getElementById(mapID),
   view: view
 });
 this.hideFeature = function(feature){ feature.setStyle(new ol.style.Style());}
 this.showFeature = function(feature){ feature.setStyle(new ol.style.Style({image: icon}));}
 this.getFeatures = function(){ return iconFeatures;}
 this.getMap = function(){ return this.map;}
 this.getView = function() {return view;}
 this.getDiv = function(){ return divList;}
 this.change = function(lonlat, zoom){
  view.animate({
   center: ol.proj.fromLonLat(lonlat),
   zoom: (zoom==null) ? 18 : zoom,
   duration: 100
  });
 }
 this.zoneFocus = function(topLeft, bottomRight){
  var center = {
   longtitude: 0,
   latitude: 0
  };
  center.longtitude = (topLeft.longtitude + bottomRight.longtitude) / 2;
  center.latitude = (topLeft.latitude + bottomRight.latitude) / 2;
  console.log(center);
  this.change([center.longtitude, center.latitude],12);
 }
 this.isInside = function(zone, point){
  var flag_lon = (zone.topLeft.longtitude <= point.longtitude &&
                  zone.bottomRight.longtitude >= point.longtitude);
  var flag_lat = (zone.topLeft.latitude >= point.latitude &&
                  zone.bottomRight.latitude <= point.latitude);
  return (flag_lon && flag_lat);
 }
 this.getContentGeo = function(content){
  var point = {};
  point.longtitude = parseFloat(content.longtitue);
  point.latitude = parseFloat(content.latitue);
  return point;
 }
 this.compareDate = function(date1, date2){
  // return 0, 1, -1
  // refer to equal, larger, smaller
  var d1 = date1.split('-');
  var d2 = date2.split('-');
  var result = 0;
  if(d1[0] == d2[0]){
   if(d1[1] == d2[1]){
    if(d1[2] == d2[2]){
     result = 0;
    } else if(d1[2] > d2[2]){
     result = 1;
    } else {
     result = -1;
    }
   } else if(d1[1] > d2[1]){
    result = 1;
   } else {
    result = -1;
   }
  } else if(d1[0] > d2[0]){
   result = 1
  } else {
   result = -1;
  }
  return result;
 }
 var element = document.getElementById(popupID);
 var popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
  offset: [0, -50]
 });
 this.map.addOverlay(popup);
 this.map.on('click', function(evt){
  var feature = this.forEachFeatureAtPixel(evt.pixel,
   function(feature){
    return feature;
   });
   if(feature){
    var coordinates = feature.getGeometry().getCoordinates();
    popup.setPosition(coordinates);
    $(element).popover({
     'placement': 'top',
     'html': true,
     'content': feature.get('content').toPopup,
    });
    $(element).popover('show');
    view.animate({
     center: coordinates,
     zoom: 18,
     duration: 1000
    });
    geodiv.addFocus(feature.get('div'));
   } else {
    $(element).popover('destroy');
   }
 });
 
 this.map.on('pointermove', function(e) {
  if(e.dragging){
   $(element).popover('destroy');
   return;
  }
  var pixel = this.getEventPixel(e.originalEvent);
  var hit = this.hasFeatureAtPixel(pixel);
  this.getTarget().style.cursor = hit ? 'pointer' : '';
 });
 for(var i=0; i<divList.length; i++){
  var div = divList[i];
  div.click(function(){
   var id = $(this).attr('id');
   id = id.replace('gd', '');
   var feature = iconFeatures[parseInt(id)];
   console.log(feature);
   var coordinates = new ol.proj.fromLonLat(
      [parseFloat(feature.get('content').longtitue),
      parseFloat(feature.get('content').latitue)]
     );
    view.animate({
     center: coordinates,
     zoom: 18,
     duration: 1000
    });
    $(element).popover('destroy');
    popup.setPosition(coordinates);
    $(element).popover({
     'placement': 'top',
     'html': true,
     'content': feature.get('content').toPopup,
    });
    $(element).popover('show');
    geodiv.addFocus($(this));
  });
 }
}