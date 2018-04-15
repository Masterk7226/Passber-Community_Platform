var reg   = document.getElementById("Register");
reg.addEventListener("click", CreateAccount);

function CreateAccount() {
  var email = document.getElementById("Email").value;
  var pwd   = document.getElementById("Password").value;
  var spwd  = document.getElementById("sPassword").value;

  if (pwd == spwd && email!=null && email!="") {
    firebase.auth().createUserWithEmailAndPassword(email, pwd).then(function() {
      alert("Successful.");
      onAuthStateChanged();
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + " " + errorMessage);
    });
  } else {
    alert("Wrong Password!");
    document.getElementById("Email").value="";
    document.getElementById("Password").value="";
    document.getElementById("sPassword").value="";
  }
}

function onAuthStateChanged() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location = '/Community';
    }
  });
}

window.onload = function () {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
}
