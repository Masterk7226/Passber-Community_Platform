function GEOPOPUP(link){
 this.container = "popup-container";
 this.title = "popup-title";
 this.img = "popup-img";
 this.name = "popup-name";
 this.content = "popup-content";
 this.address = "popup-address";
 this.pin = "popup-pin";
 this.pinsrc = link;
 this.createContainer = function(){
  return $('<div class="'+this.container+'"></div>');
 }
 this.createTitle = function(){
  return $('<div class="'+this.title+'"></div>');
 }
 this.createImage = function(data){
  return $('<img class="'+this.img+'"src="'+data+'"></img>');
 }
 this.createName = function(data){
  return $('<p class="'+this.name+'">'+data+'</p>');
 }
 this.createContent = function(){
  return $('<div class="'+this.content+'"></div>');
 }
 this.createAddress = function(data){
  return $('<p class="'+this.address+'">'+data+'</p>');
 }
 this.createPin = function(){
  return $('<img class="'+this.pin+'" src="'+this.pinsrc+'"></img>');
 }
}
GEOPOPUP.prototype.createPopup = function(obj){
 if(obj instanceof DataSet){
  var popup = this.createContainer()
             .append(this.createTitle()
                     .append(this.createImage(obj.imgsrc))
                     .append(this.createName(obj.evt_name)))
             .append(this.createContent()
                     .append(this.createAddress(obj.evt_address)
                             .append(this.createPin())));
  return popup;
 } else{
  return null;
 }
}