function DataSet(obj){
 // Collect Event Data
 this.id = (obj.id != null) ? obj.id : '1';
 this.date_start = (obj.start != null) ? obj.start : getToday();
 this.date_end = (obj.end != null) ? obj.end : getToday();
 this.evt_address = (obj.address != null) ? obj.address : "Hong Kong";
 this.evt_name = (obj.name != null) ? obj.name : 'Unknown';
 this.evt_stat = (obj.stat != null) ? obj.stat : 'Unknown';
 this.imgsrc = (obj.imgsrc != null) ? obj.imgsrc : 'http://www.john-james-andersen.com/wp-content/uploads/nullimage1.gif';
 this.evt_content = (obj.content != null) ? obj.content : '';
 this.evt_deadline = (obj.deadline != null) ? obj.deadline : getToday();
 this.longtitue = (obj.longtitue != null) ? obj.longtitue : '114.1';
 this.latitue = (obj.latitue != null) ? obj.latitue : '22.30';
 this.evt_fee = (obj.fee != null) ? obj.fee : [{"Everyone" : "0"}];
 
 function getToday(){
  var date = new Date();
  var year = date.getFullYear().toString();
  var month = date.getMonth().toString();
  var date = date.getDate().toString();
  if(parseInt(date) < 10){
   date = '0' + date;
  }
  if(parseInt(month) < 10){
   month = '0' + month;
  }
  return date + '/' + month + '/' + year;
 }
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
