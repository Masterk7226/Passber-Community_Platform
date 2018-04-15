function GEOMAP(mapID){
 /*
 * Procedures
 * 1. Create GEOMAP Object
 * 2. Set Icon
 * 3. Initialize GEODIV
 * 4. Initialize Layer
 * 5. Initialize Map Object
 * 6. Set Popup Feature and GEOPOPUP
 * 7. Add Feature
 *
 */
 var id = mapID;
 var icon = null;
 var iconStyle = null;
 var iconFeatures = [];
 var vectorSource = null;
 var vectorLayer = null;
 var addedLayer = false;
 var popupElement = null;
 var popup = null;
 var map = null;
 var geodiv = null;
 var geopopup = null;
 var view = new ol.View({
  center: new ol.proj.fromLonLat([114.1,22.30]),
  zoom: 10
 });
 this.initLayer = function(){
  vectorSource = new ol.source.Vector({
  });
  vectorLayer = new ol.layer.Vector({
   source: vectorSource
  });
 }
 this.initDiv = function(div){
  geodiv = div;
 }
 this.initMap = function(){
   map = new ol.Map({
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
   target: document.getElementById(id),
   view: view
  });
 }
 this.setIcon = function(iconLink){
  icon = new ol.style.Icon({
   anchor: [0.5, 0.5],
   anchorXUnits: 'fraction',
   anchorYUnits: 'fraction',
   src: iconLink
  });
  iconStyle = new ol.style.Style({
   image: icon
  });
 }
 this.addFeature = function(data){
  var div = geodiv.createDiv(data);
  var iconFeature = new ol.Feature({
   geometry: this.getPointFromString([data.longtitue, data.latitue]),
   data: data,
   div: div
  });
  iconFeature.setStyle(iconStyle);
  iconFeatures.push(iconFeature);
  vectorSource.addFeature(iconFeature);
  div.click(function(){
   var coordinates = iconFeature.getGeometry().getCoordinates();
   popup.setPosition(coordinates);
   $(popupElement).popover({
    'placement': 'top',
    'html': true,
    'content': geopopup.createPopup(data),
   });
   $(popupElement).popover('show');
   view.animate({
    center: coordinates,
    zoom: 18,
    duration: 1000
   });
   $('.geo-div-focus').removeClass('geo-div-focus');
   $(this).addClass('geo-div-focus');
  });
  return div;
 }
 this.setPopup = function(id, obj){
  popupElement = document.getElementById(id);
  geopopup = obj;
  popup = new ol.Overlay({
   element: popupElement,
   positioning: 'bottom-center',
   stopEvent: false,
   offset: [0, -50]
  });
   map.addOverlay(popup);
   map.on('click', function(evt){
    var feature = this.forEachFeatureAtPixel(evt.pixel,
     function(feature){
      return feature;
     });
     if(feature){
      var coordinates = feature.getGeometry().getCoordinates();
      view.animate({
       center: coordinates,
       zoom: 18,
       duration: 1000
      });
      popup.setPosition(coordinates);
      $(popupElement).popover({
       'placement': 'top',
       'html': true,
       'content': geopopup.createPopup(feature.get('data')),
      });
      $(popupElement).popover('show');
      $('.geo-div-focus').removeClass('geo-div-focus');
      feature.get('div').addClass('geo-div-focus');
   } else {
    $(popupElement).popover('destroy');
   }
  });
  map.on('pointermove', function(e) {
   if(e.dragging){
    $(popupElement).popover('destroy');
    return;
   }
   var pixel = this.getEventPixel(e.originalEvent);
   var hit = this.hasFeatureAtPixel(pixel);
   this.getTarget().style.cursor = hit ? 'pointer' : '';
  });
 }
 this.hideFeatureByIndex = function(index){
  this.hideFeature(iconFeatures[index]);
 }
 this.showFeatureByIndex = function(index){
  this.showFeature(iconFeatures[index]);
 }
 this.hideFeature = function(feature){ feature.setStyle(new ol.style.Style());}
 this.showFeature = function(feature){ feature.setStyle(new ol.style.Style({image: icon}));}
 this.getFeatures = function(){ return iconFeatures;}
 this.getMap = function(){ return map;}
 this.getView = function() {return view;}
 this.getPoint = function(lonLat){
  return new ol.geom.Point(ol.proj.fromLonLat(lonLat));
 }
 this.getPointFromString = function(lonLat){
  return new ol.geom.Point(ol.proj.fromLonLat([parseFloat(lonLat[0]),
   parseFloat(lonLat[1])]));
 }
 this.zoneFocus = function(topLeft, bottomRight){
  var center = {
   longtitude: 0,
   latitude: 0
  };
  center.longtitude = (topLeft.longtitude + bottomRight.longtitude) / 2;
  center.latitude = (topLeft.latitude + bottomRight.latitude) / 2;
  this.change([center.longtitude, center.latitude],12);
 }
}