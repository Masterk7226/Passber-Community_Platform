
'use strict';

// Initializes PhotoAlbum.
function PhotoAlbum() {
  this.checkSetup();
  
  var url_string = window.location.href;
  var url = new URL(url_string);
  this.communityID = url.searchParams.get("communityID");
  

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');

  //Added In 16:20 17/12/2017 Testing
  this.submitPhotoButton = document.getElementById('submitPhoto');
  this.imageFormPhoto = document.getElementById('image-form-photo');
  this.deletePhotoButton = document.getElementById('deletePhoto');
  this.deleteFormPhoto = document.getElementById('delete-form-photo');
  this.mediaCapturePhoto = document.getElementById('mediaCapture-photo');
  //Added

  //Album element
  this.album = document.getElementById('album');


  this.imageForm = document.getElementById('image-form');
  this.mediaCaptureImage = document.getElementById('mediaCapture-image');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCaptureImage.click();
  }.bind(this));
  this.mediaCaptureImage.addEventListener('change', this.saveImageMessage.bind(this));

  // Events for photo upload.
  this.submitPhotoButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapturePhoto.click();
  }.bind(this));
  this.mediaCapturePhoto.addEventListener('change', this.savePhotoMessage.bind(this));

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
PhotoAlbum.prototype.loadMessages = function() {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var viewId = url.searchParams.get("view");
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('Platform/ABCClub/PhotoAlbum/' + viewId + '/messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// Loads chat album history and listens for upcoming ones.
PhotoAlbum.prototype.loadAlbum = function() {
  //Reference to the /ALBUM/ database path.
  var url_string = window.location.href;
  var url = new URL(url_string);
  var viewId = url.searchParams.get("view");

  this.albumRef = this.database.ref('Community/' + this.communityID + '/PhotoAlbum/' + viewId);
  this.photoRef = this.database.ref('Community/' + this.communityID + '/PhotoAlbum/' + viewId + '/images');
  //Make sure we remove all previous listeners.
  this.photoRef.off();
  this.albumRef.off();

  // Loads the last 30 photos and listen for new ones.
  var setPhoto = function(data) {
    var val = data.val();
    this.displayAlbumContent(data.key, val.name, val.text, val.photoUrl, val.imageUrl, val.ratings);
  }.bind(this);
  this.photoRef.limitToLast(30).on('child_added', setPhoto);
  this.photoRef.limitToLast(30).on('child_changed', setPhoto);
  this.photoRef.limitToLast(30).on('child_removed', setPhoto);
  this.setColorBox();
};

// Saves a new message on the Firebase DB.
PhotoAlbum.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;

    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      PhotoAlbum.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
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

// Sets the URL of the given a element with the URL of the image stored in Cloud Storage.
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

// Sets the URL of the given a element with the URL of the image stored in Cloud Storage.
PhotoAlbum.prototype.setColorBox = function() {
  $(".event").colorbox({
    rel: 'event',
    transition: "none",
    width: "90%",
    height: "90%"
  });
};

PhotoAlbum.prototype.deletePhoto = function(photoId) {
  event.preventDefault();
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.photoDelRef = this.photoRef.child(photoId);

    this.photoDelRef.remove().then(function() {
      console.log("Remove succeeded.")
    }).catch(function(error) {
      console.log("Remove failed: " + error.message)
    });
  }
};

PhotoAlbum.prototype.thumbsUp = function(photoId) {
  event.preventDefault();
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.photoRateRef = this.photoRef.child(photoId);
    this.ratings = this.photoRateRef.child("ratings");
    var emailRef = this.photoRateRef.child("RatedEmail");

    var result;
    var resultRef;

    emailRef.orderByValue().equalTo(currentUser.email).on("child_added", function(snapshot) {
      console.log(snapshot.key);
      result = snapshot.key;
      resultRef = emailRef.child(result);
    });

    if (result == null) {
      emailRef.push(currentUser.email).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
      });

      this.ratings.transaction(function(ratings) {
        return ratings + 1;
      }, function(error) {
        if (error) {
          console.log('Transaction failed abnormally!', error);
        }
      });

    } else {
      resultRef.remove();
      this.ratings.transaction(function(ratings) {
        return ratings - 1;
      }, function(error) {
        if (error) {
          console.log('Transaction failed abnormally!', error);
        }
      });
    }
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
PhotoAlbum.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;

    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: PhotoAlbum.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function(snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({
          imageUrl: this.storage.ref(fullPath).toString()
        });
      }.bind(this));
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
PhotoAlbum.prototype.savePhotoMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageFormPhoto.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;

    this.photoRef.push({
      name: currentUser.displayName,
      imageUrl: PhotoAlbum.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
      ratings: 0,
    }).then(function(data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function(snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({
          imageUrl: this.storage.ref(fullPath).toString()
        });
      }.bind(this));
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
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

    // We load currently existing chant messages.
    this.loadMessages();

    //Testing 17/12
    this.loadAlbum();

    // We save the Firebase Messaging Device token and enable notifications.

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
  firebase.messaging().requestPermission().then(function() {}.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
PhotoAlbum.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
PhotoAlbum.MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  '</div>';

// A loading image URL.
PhotoAlbum.LOADING_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif';

// Displays a Message in the UI.
PhotoAlbum.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = PhotoAlbum.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {
    div.classList.add('visible')
  }, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Template for Album Photos. Added 18/12
PhotoAlbum.PHOTO_TEMPLATE =
  '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">' +
  '<div class="photo-box">' +
  '<div class="image-wrap">' +
  '</div>' +
  '</div>' +
  '</div>';

// Displays a Message in the UI.
PhotoAlbum.prototype.displayAlbumContent = function(key, name, text, picUrl, imageUri, ratings) {

  var div = document.getElementById(key);

  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = PhotoAlbum.PHOTO_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.album.appendChild(div);
  }

  // if (picUrl) {
  //   var pic = document.createElement('div');
  //   pic.setAttribute('class','pic');
  //   pic.style.backgroundImage = 'url(' + picUrl + ')';
  // }

  var delSelect = document.createElement('button');
  delSelect.setAttribute('type', 'button');
  delSelect.setAttribute('name', 'photo');
  delSelect.innerHTML = 'Delete';
  delSelect.setAttribute('value', key);
  delSelect.addEventListener('click', function(e) {
    this.deletePhoto(key);
  }.bind(this));

  var albumElement = div.querySelector('.image-wrap');

  if (text) { // If the message is text.
    albumElement.textContent = text;
    // Replace all line breaks by <br>.
    albumElement.innerHTML = albumElement.innerHTML.replace(/\n/g, '<br>');


  } else if (imageUri) { // If the message is an image.
    var hrefWrap = document.createElement('a');
    var image = document.createElement('img');
    var likes = document.createElement('div');
    var likeBtn = document.createElement('button');

    var icon = document.createElement('i');
    icon.setAttribute('class', 'material-icons');
    icon.innerHTML = "thumb_up";

    likes.setAttribute('class', 'likes');
    likeBtn.setAttribute('value', key);
    likeBtn.appendChild(icon);
    likeBtn.addEventListener('click', function(e) {
      this.thumbsUp(key);
    }.bind(this));



    //Test ratings function
    likes.innerHTML = ratings + ' Ratings';

    this.setImageUrl(imageUri, image);
    hrefWrap.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    hrefWrap.appendChild(image);
    this.setImageUrlForHref(imageUri, hrefWrap);
    hrefWrap.setAttribute('class', 'event cboxElement');
    albumElement.innerHTML = '';
    albumElement.appendChild(hrefWrap);
    likes.appendChild(likeBtn);
    likes.appendChild(delSelect);

    albumElement.appendChild(likes);
    // albumElement.appendChild(pic);
    this.setColorBox();
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {
    div.classList.add('visible')
  }, 1);
  this.album.scrollTop = this.album.scrollHeight;
  this.messageInput.focus();
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
  var url_string = window.location.href;
  var url = new URL(url_string);
  var viewId = url.searchParams.get("view");
  if (viewId == null) {
    window.location.replace("404.html");
  }
  window.photoAlbum = new PhotoAlbum();
};
