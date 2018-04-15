function GEOPAG(options){
 this.paging = options.paging;
 this.content = options.content;
 this.control = options.control;
 this.content.hide().filter(':lt('+this.paging+')').show();
}
GEOPAG.prototype.pag = function(){
 this.control.bootpag({
  total: this.content.length / this.paging + 1
 }).on('page', function(event, num){
  var min = (num - 1) * this.paging;
  var max = (num) * paging;
  return (index>=min && index <max);
 }).show();
};