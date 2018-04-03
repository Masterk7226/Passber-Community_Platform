function GEODIV(){
 this.map = null;
 this.setMap = function(map){
  this.map = map;
 }
 this.addFocus = function(div){
  var curr = $('.geo-div-focus');
  if(curr==null){
   div.addClass('geo-div-focus');
   // focus the div and map
  } else {
   curr.removeClass('geo-div-focus');
   div.addClass('geo-div-focus');
  }
 }
 this.create = function(dataset){
  return dataset.toDiv;
 }
}