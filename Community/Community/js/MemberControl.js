var owner     = document.getElementById("Owner");
var organizer = document.getElementById("Organizer");
var member    = document.getElementById("Members");
var awaiting  = document.getElementById("Awaiting");

function getOwner() {
  var ref = firebase.database().ref("Platform/ABCClub/Users/OwnerKey");
  ref.once("value", function(data) {
    owner.innerHTML = owner.innerHTML + data.val().Owner;
  });
}

function getOrganizer() {
  var ref = firebase.database().ref("Platform/ABCClub/Users/OrganizerKey");
  ref.once("value", function(data){
    data.forEach(function (childData) {
      organizer.innerHTML = organizer.innerHTML + childData.val().email + "<br/>";
    });
  });
}

function getMember() {
  var ref = firebase.database().ref("Platform/ABCClub/Users/Members");
  ref.once("value", function(data){
    data.forEach(function (childData) {
      member.innerHTML = member.innerHTML + childData.val().email + "<br/>";
    });
  });
}

function getAwaiting() {
  var ref = firebase.database().ref("Platform/ABCClub/Users/Awaiting");
  ref.once("value", function(data){
    data.forEach(function (childData) {
      awaiting.innerHTML = awaiting.innerHTML + childData.val().email + "<br/>";
    });
  });
}

function onAuthStateChanged() {
  // Check for the user does it login

  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      alert("Does Not Login, Redirect to login page");
      window.location = '/login';
    } else {
      var P_getName = document.getElementById("getName");
      P_getName.innerHTML = user.email;
    }
  });

  // End of function onAuthStateChanged
}

BTN_logout = document.getElementById("btn_logout");
BTN_logout.addEventListener('click',logout);

function logout() {
  firebase.auth().signOut();
  alert("You have sign out.");
}

window.onload = function() {
  getOwner();
  getOrganizer();
  getMember();
  getAwaiting();
  onAuthStateChanged();
}
