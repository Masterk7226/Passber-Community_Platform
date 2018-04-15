function getMAPJSON(callback){
 var dataArray = [];
 var url = new URL(location.href);
 var communityID = url.searchParams.get("communityID");
 var ref = firebase.database().ref("Community/" + communityID);
 ref.on("value", function(data) { // In the Form Level
  data.forEach(function(childData) { // In the Key Level
   callback(childData);
  });
 });
}

