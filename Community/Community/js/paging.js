function divpag(options){
 var paging = options.paging;
 var divList = null;
 var pageMenu = null;
 this.setDivList = function(DL){
  divList = $(DL);
  divList.hide().filter(':lt('+paging+')').show();
 }
 this.setPageMenu = function(PM){pageMenu = $('#'+PM);}
 this.pag = function(){
  pageMenu.bootpag({
   total: divList.length/paging + 1
  }).on('page', function(event, num){
   divList.hide().filter(function(index){
   var min = (num - 1) * paging;
   var max = (num) * paging;
   return (index>=min && index <max);
  }).show();
 })
 this.getDiv = function(){return this.divList;}
 }
}