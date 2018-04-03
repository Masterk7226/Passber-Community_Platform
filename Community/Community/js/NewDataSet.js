function DataSet(obj){
 // Initialization start
 this.date_start = obj.start;
 this.date_end = obj.end;
 this.evt_address = obj.address;
 this.evt_name = obj.name;
 this.evt_stat = obj.stat;
 this.imgsrc = obj.imgsrc;
 this.evt_content = obj.content;
 this.evt_deadline = obj.deadline;
 this.longtitude = obj.longtitude;
 this.latitude = obj.latitude;
 this.evt_fee = obj.fee;
 this.pinsrc = "new_pin.png";
 // Initialization end 
}
DataSet.prototype.get = function(prop){ // get the attribute by string
 return Object.getOwnPropertyDescriptor(this, prop).value;
}
DataSet.prototype.getPopup = function(prop){
 var element;
 if(prop!='evt_fee'){
  // normal situation
  var item = this.get(prop);
  if(prop!='imgsrc'){
   // normal situation
   var extra = (prop=='evt_address') '<img class="popup-pin" src="' + this.pinsrc + '"></img>' : '';
   element = '<div class="popup-' + prop + '">' + extra + item + '</div>';
  } else {
   // image situation
   element = '<img class="popup-img" src="' + item + '"></img>';
  }
 } else {
  // evt_fee situation
  // not included
 }
 return element;
}
DataSet.prototype.getDiv = function(prop){
 var element;
 if(prop!='evt_fee'){
  // normal situation
  var item = this.get(prop);
  if(prop!='imgsrc'){
   // normal situation
   var tag = prop.split('_');
   tag = tag[1];
   element = '<div class="geo-div-' + prop + '">' + tag + ': ' + item + '</div>';
  } else {
   // image situation
   element = '<img class="geo-div-img" src="' + item + '"></img>');
  }
 } else {
  element = '';
  $.each( this.evt_fee, function(key, val){
   $.each( val, function(key, val){
    var num = (val=='Free')? val: '$ ' + val;
    element += '<div class="geo-div-fee-items' + '">' + key + ': ' + num + '</div>';
   });
  });
 }
 return element;
}
DataSet.prototype.toPopup = function(){
 var popup = $('<div class="popup-container"></div>');
 var title = $('<div class="popup-title"></div>');
 var content = $('<div class="popup-content"></div>');
 title.append(this.getPopup('imgsrc'));
 title.append(this.getPopup('evt_name'));
 content.append(this.getPopup('evt_address'));
 popup.append(title);
 popup.append(content);
 return popup;
}
DataSet.prototype.toDiv = function(){
 var div = $('<div class="geo-div-content"></div>');
 var info = $('<div class="geo-div-info"></div>');
 info.append(this.getDiv('evt_name'));
 info.append(this.getDiv('evt_address'));
 info.append(this.getDiv('date_start'));
 info.append(this.getDiv('date_end'));
 info.append(this.getDiv('evt_fee'));
 div.append(info);
 return div;
 
}