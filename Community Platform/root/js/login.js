var loginMethod = "eP";

function LoginAccount(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
    loginMethod = "eP";
    onAuthStateChanged(this);
  }).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}

function LoginWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function (result) {
    loginMethod = "gg";
    onAuthStateChanged();
  }).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}

function onAuthStateChanged() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      window.location = '/index.html';
    }
  });
}

window.onload = function () {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
}