function DataSet(obj){
 // Collect Event Data
 this.id = obj.id;
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
}
DataSet.prototype.getFee = function(){
 var str = '';
  $.each( this.evt_fee, function( key, val){
   $.each( val, function( key, val){
    var num = (val=='Free')? val : '$ '+ val;
    str += '<div class="geo-div-fee-items' + '">' + key + ': ' + num + '</div>';
   })
  });
  return str;
}
DataSet.prototype.get = function(prop){
 return Object.getOwnPropertyDescriptor(this, prop).value;
}
