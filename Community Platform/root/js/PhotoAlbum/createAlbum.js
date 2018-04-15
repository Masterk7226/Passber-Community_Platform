
'use strict';

// Initializes PhotoAlbum.
function PhotoAlbum() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.submitButton = document.getElementById('submit');
  this.nameInput = document.getElementById('name');
  this.albumForm = document.getElementById('album-form');

  //Sign-in function element event
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Toggle for the button.
  this.albumForm.addEventListener('submit', this.saveAlbum.bind(this));
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.nameInput.addEventListener('keyup', buttonTogglingHandler);
  this.nameInput.addEventListener('change', buttonTogglingHandler);

  //Sign-in function element event listeners
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
PhotoAlbum.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
PhotoAlbum.prototype.loadAlbum = function() {
  // Reference to the /messages/ database path.
  this.albumsRef = this.database.ref('Platform/ABCClub/PhotoAlbum');
  // Make sure we remove all previous listeners.
  this.albumsRef.off();
};

// Saves a new album on the Firebase DB.
PhotoAlbum.prototype.saveAlbum = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.nameInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;

    // Add a new message entry to the Firebase Database.
    this.albumsRef.push({
      photo: null,
      creator: currentUser.displayName,
      creatorEmail: currentUser.email,
      albumName: this.nameInput.value,
      creatorPhotoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      PhotoAlbum.resetMaterialTextfield(this.nameInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Signs-in Friendly Chat.
PhotoAlbum.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
PhotoAlbum.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
PhotoAlbum.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // Get database ref
    this.loadAlbum();

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
PhotoAlbum.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// // Saves the messaging device token to the datastore.
// PhotoAlbum.prototype.saveMessagingDeviceToken = function() {
//   firebase.messaging().getToken().then(function(currentToken) {
//     if (currentToken) {
//       console.log('Got FCM device token:', currentToken);
//       // Saving the Device Token to the datastore.
//       firebase.database().ref('/fcmTokens').child(currentToken)
//         .set(firebase.auth().currentUser.uid);
//     } else {
//       // Need to request permissions to show notifications.
//       this.requestNotificationsPermissions();
//     }
//   }.bind(this)).catch(function(error) {
//     console.error('Unable to get messaging token.', error);
//   });
// };

// Requests permissions to show notifications.
PhotoAlbum.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
PhotoAlbum.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Enables or disables the submit button depending on the values of the input fields.
PhotoAlbum.prototype.toggleButton = function() {
  if (this.nameInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
PhotoAlbum.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions and make ' +
      'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.photoAlbum = new PhotoAlbum();
};
