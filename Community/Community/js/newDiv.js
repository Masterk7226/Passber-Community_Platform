function GEODIV(){
 this.content = "geo-div-content";
 this.img = "geo-div-img";
 this.infoBlock = "geo-div-info";
 this.name = "geo-div-name";
 this.address = "geo-div-address";
 this.date_start = "geo-div-start";
 this.date_end = "geo-div-end";
 this.fee = "geo-div-fee";
 this.createContent = function(){
  return $('<div class="'+this.content+'"></div>');
 }
 this.createImage = function(data){
  return $('<img class="'+this.img+'" src="'+data+'"></img>');
 }
 this.createInfoBlock = function(data){
  return $('<div class="'+this.infoBlock+'"></div>');
 }
 this.createName = function(data){
  return $('<div class="'+this.name+'">'+data+'</div>');
 }
 this.createAddress = function(data){
  return $('<div class="'+this.address+'">'+data+'</div>');
 }
 this.createDS = function(data){
  return $('<div class="'+this.date_start+'">'+data+'</div>');
 }
 this.createDE = function(data){
  return $('<div class="'+this.date_end+'">'+data+'</div>');
 }
 this.createFee = function(key, val){
  var num = (val=='Free') ? val : '$ ' + val;
  return $('<div class="'+this.fee+'">' + key + ': ' + num + '</div>');
 }
}
GEODIV.prototype.createDiv = function(obj){
 var div = null;
 if(obj instanceof DataSet){
  div = this.createContent().append(this.createImage(obj.imgsrc))
             .append(this.createName(obj.evt_name))
             .append(this.createAddress(obj.evt_address))
             .append(this.createDS(obj.date_start))
             .append(this.createDE(obj.date_end));
  var creator = this.createFee;
  $.each( obj.evt_fee, function( key, val){
   $.each( val, function( key, val){
    div.append(creator(key, val));
   });
  });
 } else {
  console.log("This is not an DataSet Object");
 }
 return div;
}