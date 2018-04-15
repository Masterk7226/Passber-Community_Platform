function getMAPJSON(callback){
 var dataArray = [];
 var url = new URL(location.href);
 var communityID = url.searchParams.get("communityID");
 var communityRef = firebase.database().ref("Community/" + communityID);
 var ref = communityRef.child("/EventSet");
 ref.on("value", function(data) { // In the Form Level
  data.forEach(function(childData) { // In the Key Level
  var feeString = childData.val().Fee;
  var feeArray = feeString.split("Members: ");
  var fees = [];
  for(var i=1; i<feeArray.length; i++){
   var fee = feeArray[i].split(" Fee: ");
	  var obj = {};
	  obj[fee[0]] = fee[1];
   fees.push(obj);
  }
  var data = new DataSet({
   "start":childData.val().DoS,
   "end":childData.val().DoE,
   "address":childData.val().Address,
   "name":childData.val().Name,
   "stat":"upcoming",
   "imgsrc":childData.val().Logo,
   "content":childData.val().Content,
   "deadline":"",
   "longtitue":childData.val().Long,
   "latitue":childData.val().Lat,
   "page":"about:blank",
   "fee":fees
  });
  dataArray.push(data);
  });
 });
 callback(dataArray);
}

