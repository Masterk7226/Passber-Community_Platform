var btn_SignUp = document.getElementById("SignUp");
var btn_Login = document.getElementById("Login");
var btn_google = document.getElementById("Google");
// btn_SignUp.addEventListener("click", CreateAccount);
btn_Login.addEventListener("click", LoginAccount);
btn_google.addEventListener("click", LoginWithGoogle);

function LoginAccount() {
  var Input_Email = document.getElementById("Email").value;
  var Input_Password = document.getElementById("Password").value;
  firebase.auth().signInWithEmailAndPassword(Input_Email, Input_Password).then(function() {
    console.log("Logined");
    onAuthStateChanged();
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode + " " + errorMessage);
  });
}

function LoginWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    console.log("Logined");
    onAuthStateChanged();
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode + " " + errorMessage);
  });
}

function onAuthStateChanged() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location = '/Dynamic-Form/all-community-list.html';
    }
  });
}

window.onload = function () {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
}
