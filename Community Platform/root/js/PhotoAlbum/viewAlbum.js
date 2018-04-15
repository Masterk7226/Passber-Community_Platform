/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes PhotoAlbum.
function PhotoAlbum() {
  this.checkSetup();
  var url_string = window.location.href;
  var url = new URL(url_string);
  var communityID = url.searchParams.get("communityID");
   if (communityID == null) {
    window.location.replace("../../404.html");
  }
  

  // Shortcuts to DOM Elements.
  //Album element
  this.album = document.getElementById('album');

  //sign-in Elements
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);

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

// Loads chat album history and listens for upcoming ones.
PhotoAlbum.prototype.loadAlbum = function() {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var communityID = url.searchParams.get("communityID");
   
  //Reference to the /ALBUM/ database path.
  this.albumRef = this.database.ref('Community/' + communityID + '/PhotoAlbum');
  //Make sure we remove all previous listeners.
  this.albumRef.off();

  // Loads the last 90 albums and listen for new ones.
  var setPhoto = function(data) {
    var val = data.val();
    this.displayAlbums(data.key, val.albumName, val.creator, val.creatorPhotoUrl, val.child_added);
  }.bind(this);

  this.albumRef.limitToLast(90).on('child_added', setPhoto);
  this.albumRef.limitToLast(90).on('child_changed', setPhoto);
};

PhotoAlbum.prototype.setImageUrlForHref = function(imageUri, aElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    aElement.href = PhotoAlbum.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      aElement.href = metadata.downloadURLs[0];
    });
  } else {
    aElement.href = imageUri;
  }
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
PhotoAlbum.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = PhotoAlbum.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
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

    // We load currently existing chant Album.
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

// Requests permissions to show notifications.
PhotoAlbum.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
PhotoAlbum.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// A loading image URL.
PhotoAlbum.LOADING_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif';

// Template for Album Photos. Added 18/12
PhotoAlbum.PHOTO_TEMPLATE =
  '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">' +
  '<form action="album_event.html" method="get">' +
  '<div class="photo-box">' +
  '<div class="image-wrap">' +
  '</div>' +
  '</div>' +
  '</form>' +
  '</div>';

// Displays a Message in the UI.
PhotoAlbum.prototype.displayAlbums = function(key, albumName, creator, creatorPhotoUrl) {
  var thumbnailRef = this.database.ref('Community/' + communityID + '/PhotoAlbum/' + key + '/images');

  var result;
  var resultRef;

  var div = document.getElementById(key);

  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = PhotoAlbum.PHOTO_TEMPLATE;
    div = container.firstChild;
    this.album.appendChild(div);
  }

  if (creatorPhotoUrl) {
    var pic = document.createElement('div');
    pic.setAttribute('class', 'pic');
    pic.style.backgroundImage = 'url(' + creatorPhotoUrl + ')';
  }

  var thumbnailContainer = document.createElement('div');
  var thumbnailImg = document.createElement('img');

  thumbnailRef.limitToFirst(1).on("child_added", function(snapshot) {
    result = snapshot.val().imageUrl;
  });

  if (result != null) {
    this.setImageUrl(result, thumbnailImg);
  }

  thumbnailContainer.setAttribute('class', 'image-wrap');
  thumbnailContainer.appendChild(thumbnailImg);

  var albumElement = div.querySelector('.photo-box');
  albumElement.setAttribute('id', key);

  //set up description for info input
  var desc = document.createElement('div');
  desc.setAttribute('class', 'description');

  //get method to get id to album
  var keyinput = document.createElement('input');
  keyinput.setAttribute('type', 'hidden');
  keyinput.setAttribute('name', 'view');
  keyinput.setAttribute('value', key);

  //info from the album
  var descInfo = document.createElement('p');
  var text = document.createTextNode(albumName + ' - ' + creator);
  descInfo.appendChild(text);
  desc.appendChild(descInfo);

  //View button
  var getAlbum = document.createElement('input');
  getAlbum.setAttribute('type', 'submit');
  getAlbum.setAttribute('class', 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--amber-400 mdl-color-text--white');
  getAlbum.setAttribute('value', 'View');
  desc.appendChild(getAlbum);

  albumElement.innerHTML = '';
  albumElement.appendChild(thumbnailContainer);
  albumElement.appendChild(desc);
  albumElement.appendChild(keyinput);
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {
    div.classList.add('visible')
  }, 1);
};

PhotoAlbum.prototype.displayThumbnail = function(key, photoUrl, imageUrl) {
  var albumElement = div.querySelector('.photo-box');
};

// Enables or disables the submit button depending on the values of the input fields.
PhotoAlbum.prototype.toggleButton = function() {
  if (this.messageInput.value) {
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
