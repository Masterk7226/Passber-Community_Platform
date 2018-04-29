function locationMap(mapid, lon, lat){
 var app = {};
 var toggle = false;
 var mouse = document.createElement('div');
 app.Drag = function() {

  ol.interaction.Pointer.call(this, {
   handleDownEvent: app.Drag.prototype.handleDownEvent,
   handleDragEvent: app.Drag.prototype.handleDragEvent,
   handleMoveEvent: app.Drag.prototype.handleMoveEvent,
   handleUpEvent: app.Drag.prototype.handleUpEvent
  });
  this.coordinate_ = null;

  this.cursor_ = 'pointer';

  this.feature_ = null;

  this.previousCursor_ = undefined;

 };
 ol.inherits(app.Drag, ol.interaction.Pointer);
 app.Drag.prototype.handleDownEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
   function(feature) {
    return feature;
   });

  if (feature) {
   this.coordinate_ = evt.coordinate;
   this.feature_ = feature;
  }
  toggle = true;

   return !!feature;
  };
 app.Drag.prototype.handleDragEvent = function(evt) {
  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = this.feature_.getGeometry();
  geometry.translate(deltaX, deltaY);
  var lonlat = new ol.proj.transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
  lon.val(lonlat[0].toFixed(6));
  lat.val(lonlat[1].toFixed(6));

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
 };

 app.Drag.prototype.handleMoveEvent = function(evt) {
  if (this.cursor_) {
   var map = evt.map;
   var feature = map.forEachFeatureAtPixel(evt.pixel,
    function(feature) {
     return feature;
    });
   var element = evt.map.getTargetElement();
    if (feature) {
     if (element.style.cursor != this.cursor_) {
      this.previousCursor_ = element.style.cursor;
      element.style.cursor = this.cursor_;
     }
    } else if (this.previousCursor_ !== undefined) {
     element.style.cursor = this.previousCursor_;
     this.previousCursor_ = undefined;
    }
   }
 };

 app.Drag.prototype.handleUpEvent = function() {
  this.coordinate_ = null;
  this.feature_ = null;
  toggle = false;
  return false;
 };
 var icon = new ol.style.Icon({
  anchor: [0.5, 0.5],
  anchorXUnits: 'fraction',
  anchorYUnits: 'fraction',
  src: 'Geo-Mapping/new_pin.png'
 });
 var iconStyle = new ol.style.Style({
  image: icon
 });
 var iconFeature = new ol.Feature({
  geometry: new ol.geom.Point(new ol.proj.fromLonLat([114.1,22.30]))
 });
 iconFeature.setStyle(iconStyle);
 
 // Mouse Control
 
 var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(6),
  projection: 'EPSG: 4326',
  className: 'custom-mouse-position',
  target: mouse,
  undefinedHTML: '&nbsp;'
 });
 
 // End of Mouse Control

 var map = new ol.Map({
  controls: ol.control.defaults({
   attributionOptions: {
    collapsible: false
   }
  }).extend([mousePositionControl]),
  interactions: ol.interaction.defaults().extend([new app.Drag()]),
  layers: [
   new ol.layer.Tile({
    source: new ol.source.OSM()
   }),
   new ol.layer.Vector({
    source: new ol.source.Vector({
     features: [iconFeature]
    })
   })
  ],
  target: mapid,
  view: new ol.View({
   center: new ol.proj.fromLonLat([114.1,22.30]),
   zoom: 10
  })
 });
 lon.change(function(){
  var newlon = parseFloat(lon.val());
  var newlat = parseFloat(lat.val());
  if(!toggle){
   console.log(newlon);
   console.log(newlat);
   var newloc = new ol.proj.fromLonLat([newlon, newlat]);
   var oldloc = iconFeature.getGeometry().getCoordinates();
   iconFeature.getGeometry().translate(newloc[0]-oldloc[0],newloc[1] - oldloc[1]);
  }
 });
 lat.change(function(){
  var newlon = parseFloat(lon.val());
  var newlat = parseFloat(lat.val());
  if(!toggle){
   var newloc = new ol.proj.fromLonLat([newlon, newlat]);
   var oldloc = iconFeature.getGeometry().getCoordinates();
   iconFeature.getGeometry().translate(newloc[0]-oldloc[0],newloc[1] - oldloc[1]);
  }
 });
 map.on('click', function(evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel,
   function(feature){
    return feature;
  });
  if(feature){
  } else {
   var newLonLat = $(mouse).text().split(',');
   var newlon = parseFloat(newLonLat[0]);
   var newlat = parseFloat(newLonLat[1].replace(' ',''));
   var oldloc = iconFeature.getGeometry().getCoordinates();
   iconFeature.getGeometry().translate(newlon-oldloc[0],newlat - oldloc[1]);
   toggle = true;
   var lonlat = new ol.proj.transform(newLonLat, 'EPSG:3857', 'EPSG:4326');
   lon.val(lonlat[0].toFixed(6));
   lat.val(lonlat[1].toFixed(6));
   toggle = false;
  }
 });
}
