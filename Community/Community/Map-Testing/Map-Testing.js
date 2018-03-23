var testing = document.getElementById("testing");

function getJSON() {
  var ref = firebase.database().ref("Platform/ABCClub/EventForm");
  ref.on("value", function(data) { // In the Form Level
    data.forEach(function(childData) { // In the Key Level
        var address = "Address: " + childData.val().Address;
        var Content = "Content: " + childData.val().Content;
        var Deadline = "Deadline: " + childData.val().Deadline;
        var DoE = "DoE: " + childData.val().DoE;
        var DoS = "DoS: " + childData.val().DoS;
        var Lat = "Lat: " + childData.val().Lat;
        var Fee = "Fee: " + childData.val().Fee;
        var Long = "Long: " + childData.val().Long;
        var Logo = "Logo: " + childData.val().Logo;
        testing.innerHTML += address + "<br/>";
        testing.innerHTML += Content + "<br/>";
        testing.innerHTML += Deadline + "<br/>";
        testing.innerHTML += DoE + "<br/>";
        testing.innerHTML += DoS + "<br/>";
        testing.innerHTML += Lat + "<br/>";
        testing.innerHTML += Fee + "<br/>";
        testing.innerHTML += Long + "<br/>";
        testing.innerHTML += Logo + "<br/>";
      testing.innerHTML += "<hr/>";
    });
  });
}

window.onload = function() {
  getJSON();
}
