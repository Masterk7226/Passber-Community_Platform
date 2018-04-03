var divList = document.getElementById("ListAllCommunity");

function loadCommunity() {
  var ref = firebase.database().ref("Platform");
  ref.once('value', function(data) {
    data.forEach(function(childData) {
      CreateDiv(childData.key);
    });
  });

  function CreateDiv(key) {
    var prepare = "/CommunityPanel.html?id=" + key;
    var div = document.createElement("div");
    div.setAttribute('class', "showInfo");

    var a = document.createElement("a");
    a.setAttribute('href', prepare);

    var ref = firebase.database().ref("Platform/" + key + "/Info");
    ref.once('value', function(data) {
      var p = document.createElement("p");
      var text = document.createTextNode(data.val().Name);
      var pre = document.createElement("p");
      var desc = document.createTextNode(data.val().Desc);

      a.appendChild(text);
      p.appendChild(a);
      div.appendChild(p);
      pre.appendChild(desc);
      div.appendChild(pre);
      divList.appendChild(div);
    });
  }
}


window.onload = function() {
  loadCommunity();
}
