function DataSet(obj){
 this.date_start = obj.start;
 this.date_end = obj.end;
 this.evt_address = obj.address;
 this.evt_name = obj.name;
 this.evt_stat = obj.stat;
 this.imgsrc = obj.imgsrc;
 this.evt_content = obj.content;
 this.evt_deadline = obj.deadline;
 this.longtitue = obj.longtitue;
 this.latitue = obj.latitue;
 this.evt_fee = obj.fee;
 this.toPopup = '<div class="popup-container">' +
                '<div class="popup-title">' +
                '<!--<img class="popup-img" src="' + this.imgsrc + '"></img>-->' +
                '<p class="popup-name">' + this.evt_name + '</p>' +
                '</div>' +
                '<div class="popup-content">' +
                '<p class="popup-address">' + '<img class="popup-pin" src="new_pin.png"></img> ' +
                this.evt_address +'</p>' +
                '</div>' +
                '</div>';
                
 this.getFee = function(){
  var str = '';
  $.each( this.evt_fee, function( key, val){
   $.each( val, function( key, val){
    var num = (val=='Free')? val : '$ '+ val;
    str += '<div class="geo-div-fee-items' + '">' + key + ': ' + num + '</div>';
   })
  });
  return str;
 }
 var div = $('<div class="geo-div-content"></div>');
 div.append('<!--<img class="geo-div-img" src="' + this.imgsrc + '"></img>-->');
 var info = $('<div class="geo-div-info"></div>');
 div.append('<div class="geo-div-name">Name:<br />' + this.evt_name + '</div>');
 div.append('<div class="geo-div-address">Address:<br />' + this.evt_address + '</div>');
 div.append('<div class="geo-div-start">Start: ' + this.date_start + '</div>');
 div.append('<div class="geo-div-end">End: &nbsp;' + this.date_end + '</div>');
 div.append('<div class="geo-div-fee">' + this.getFee() + '</div>');
 div.append(info);
 this.toDiv = div;
 /*
 this.toDiv = '<div class="geo-div-content">' +
              '<img class="geo-div-img" src="' + this.imgsrc + '"></img>' +
              '<div class="geo-div-info">' +
              '<div class="geo-div-name">Name:<br />' + this.evt_name + '</div>' +
              '<div class="geo-div-address">Address:<br />' + this.evt_address + '</div>' +
              '<div class="geo-div-start">Start: ' + this.date_start + '</div>' +
              '<div class="geo-div-end">End: &nbsp;' + this.date_end + '</div>' +
              '<div class="geo-div-fee">' + this.getFee() + '</div>' +
              '</div>' +
              '</div>';*/
}

DataSet.prototype.get = function(prop){
 return Object.getOwnPropertyDescriptor(this, prop).value;
}