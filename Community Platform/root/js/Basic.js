function onAuthStateChanged() {
  // Check for the user does it login

  firebase.auth().onAuthStateChanged(function (user) {
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

try {
  BTN_logout = document.getElementById("btn_logout");
  BTN_logout.addEventListener('click', logout);

  function logout() {
    firebase.auth().signOut();
    alert("You have sign out.");
  }

  window.onload = function () {
    onAuthStateChanged();
  }
} catch (error) {

}