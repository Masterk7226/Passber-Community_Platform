var testing = document.getElementById("testing");

function getJSON() {
  var ref = firebase.database().ref("Platform/ABCClub/EventForm");
  ref.once("value", function(data) { // In the Form Level
    data.forEach(function(childData) { // In the Key Level
        var Form = "Form: " + childData.val().Form;
        testing.innerHTML += Form + "<br/>";
      testing.innerHTML += "<hr/>";
    });
  });
}

function getEvent() { // To Create the button with the key
  testing.innerHTML += "<hr/>";

  var ref = firebase.database().ref("Platform/ABCClub/EventForm");
  ref.once("value", function(data) { // In the Form Level
    data.forEach(function(childData) { // In the Key Level
        var NameToKey = "<button value="+ childData.key +" onclick='convertToKey(this.value)'>" + childData.val().Name + "</button>";
        testing.innerHTML += NameToKey + "<br/>";
      testing.innerHTML += "<hr/>";
    });
  });
}

function convertToKey(value) { // Main function, prestrings to set the true value
  var ref = firebase.database().ref("Platform/ABCClub/EventForm/" + value);
  var prestrings = {
    "Form" : "FormSet"
  }; //This to set the value and update to database
  ref.update(prestrings);
}

window.onload = function() {
  getJSON();
  getEvent();
}
