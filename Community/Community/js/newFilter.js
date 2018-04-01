function GEOFILTER(options){
 this.gate = {
  date: options.date,
  district: options.district
 }
 this.result = {
  date: false,
  district: false,
  fee: false
 }
 this.feeCheck = function(value, fee){
  if(value==-1){ return true;}
  else {
   $.each(fee, function(key, val){
    if( val <= value ) return true;
   });
   return false;
  }
 }
 this.dateCheck = function(date1, date2){
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
 this.districtCheck = function(zone, point){
  if(zone==null) return true;
  else {
   var flag_lon = (zone.topLeft.longtitude <= point[0]&&
                   zone.bottomRight.longtitude >= point[0]);
   var flag_lat = (zone.topLeft.latitude >= point[1] &&
                   zone.bottomRight.latitude <= point[1]);
                   console.log(zone);
   return (flag_lon && flag_lat);
  }
 }
}
GEOFILTER.prototype.compare = function(selection, data){
 $.each(this.result, function(key, val){
  val = false;
 });
 this.result.fee = this.feeCheck(selection.fee, data);
 if( !this.gate.date && !this.gate.district){
  return this.result.fee;
 } else if(this.gate.date && !this.gate.district){
  this.result.date = ( 
  this.dateCheck(selection.start, data.date_start) >=0 &&
  this.dateCheck(selection.end, data.date_end) <=0);
  return (this.result.date && this.result.date); 
 } else if(!this.gate.date && this.gate.district) {
  this.result.district = this.districtCheck(selection.zone, [data.longtitue, data.latitue]);
  console.log(this.result);
  return (this.result.fee && this.result.district);
 } else {
  this.result.date = ( 
  this.dateCheck(selection.start, data.date_start) >=0 &&
  this.dateCheck(selection.end, data.date_end) <=0);
  this.result.district = districtCheck(selection.zone, [data.longtitue, data.latitue]);
  return (this.result.fee && this.result.date && this.result.district );
 }
}