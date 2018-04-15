function getMAPJSON(callback){
 var dataArray = [];
 // Get the JSON from the database
 // Get Community ID from the url
 var url = new URL(location.href);
 var communityID = url.searchParams.get("communityID");
 var communityRef = firebase.database().ref("Community/" + communityID);
 var ref = communityRef.child("/EventSet");
 // Use callback to handle the data
 ref.on("value", function(data) { // In the Form Level
  data.forEach(function(childData) { // In the Key Level
  console.log(childData);
   callback(childData);
  });
 });
}

