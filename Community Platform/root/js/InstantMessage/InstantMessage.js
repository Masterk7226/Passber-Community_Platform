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

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');


  this.delete = document.getElementById('delMember');
  this.delete.addEventListener('click', this.DelTheMember.bind(this));

  // this.creategroup = document.getElementById('CreateChatRoom');
  this.loadmoremsg = document.getElementById('loadMoreMsg');
  this.listRoom = document.getElementById('ListRoom');
  this.addMember = document.getElementById('addMember');
  this.loadText = document.getElementById('loadText');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));


  //Setting 2
  this.addMember.addEventListener('click', this.AddTheMember.bind(this));
  // this.creategroup.addEventListener('click', this.CreateRoom.bind(this));
  // this.loadText.addEventListener('click', this.loadingText.bind(this));


  //Setting 3
  var btn_community = document.getElementById("Community");
  var btn_Group = document.getElementById("Group");
  var btn_event = document.getElementById("Event");
  btn_community.addEventListener('click', function() {
    window.location = '?type=Community'
  });
  btn_Group.addEventListener('click', function() {
    window.location = '?type=Group'
  });
  btn_event.addEventListener('click', function() {
    window.location = '?type=Event'
  });

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
}



// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  // this.onAuthStateChanged();
  firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// FriendlyChat.prototype.getType = function() {
//   var url_string = window.location.href;
//   var url = new URL(url_string);
//   var type = url.searchParams.get("type");
//   this.type = type;
// }

FriendlyChat.prototype.prepareLoad = function() {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  var type = url.searchParams.get("type");

  var Gref = firebase.database().ref("InstantMessage/Messages/" + type);
  Gref.on("value", function(data) {
    data.forEach(function(childData) {
      if (childData.val().Name == id) {

      }
    });
  });

}

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function(Ref) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  var type = url.searchParams.get("type");
  var ref = url.searchParams.get("ref");

  if (id != null) {
    this.messagesRef = firebase.database().ref('InstantMessage/Messages/' + type + "/" + ref + '/Message');
    console.log("log: " + this.messagesRef);

    // Make sure we remove all previous listeners.
    this.messagesRef.off();
    // Loads the last 8 messages and listen for new ones.
    var setMessage = function(data) {
      var val = data.val();
      this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);
    // this.messagesRef.limitToLast(8).on('child_added', setMessage);
    // this.messagesRef.limitToLast(8).on('child_changed', setMessage);
    this.messagesRef.on('child_added', setMessage);
    this.messagesRef.on('child_changed', setMessage);
    this.loadNameandUser(id);
  }
};

FriendlyChat.prototype.loadNameandUser = function(id) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var ids = url.searchParams.get(id);
  var type = url.searchParams.get("type");

  var Gref = firebase.database().ref("InstantMessage/Messages/" + type);
  // var hidden_name = document.getElementById("hidden_id");

  Gref.once("value", function(data) {
    data.forEach(function(childData) {
      if (childData.val().Name == id) {
        // hidden_name.value = childData.key;
        setName(id);
        setHidden();
      }
    });
  });

  function setName(Name) {
    //Load Name
    var names = firebase.database().ref("InstantMessage/Details/" + type + "/" + Name);
    names.on("value", function(data) {
      var text = document.createElement("p");
      text.appendChild(document.createTextNode(data.val().Name));
      document.getElementById("TempGroupName").appendChild(text);
    });

    //Load Members
    var members = firebase.database().ref("InstantMessage/Details/" + type + "/" + Name + "/Members");
    members.once("value", function(data) {
      data.forEach(function(childData) {
        var text = document.createElement("p");
        text.appendChild(document.createTextNode(childData.val().email));
        document.getElementById("TempGroupUser").appendChild(text);
      });
    });
  }


  function setHidden() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var type = url.searchParams.get("type");
    var idr = url.searchParams.get("id");


  var ref = firebase.database().ref("InstantMessage/Details/" + type + "/" + idr + "/Role");


  ref.once("value",function(data) {

    data.forEach(function (childData) {

      if (childData.val().email == firebase.auth().currentUser.email) { //Tmp
        document.getElementById("Role").style.display="block";
      } else {
        document.getElementById("Role").style.display="none";
      }
    });
  });
}


}

// FriendlyChat.prototype.setReference = function() {
//   var url_string = window.location.href;
//   var url = new URL(url_string);
//   var id = url.searchParams.get("id");
//
//    if (id != null) {
//      document.getElementById("hidden_id").value = id;
//    }
// }

// FriendlyChat.prototype.ListPerson = function() {
//
// }

// FriendlyChat.prototype.ListGroup = function() {
//   var ref = firebase.database().ref("InstantMessage/Details/Group");
//   var GroupList = document.getElementById("Group_Tab");
//
//   ref.once("value").then(function(GroupData) {
//     GroupData.forEach(function(childData) {
//       handleEventList(childData.val().Name, childData.key);
//     });
//   });
//
//   function handleEventList(Name, key) {
//     var hyper = document.createElement("a");
//     var li = document.createElement("li");
//     var button = document.createElement("button");
//
//     button.appendChild(hyper);
//     li.appendChild(button);
//     hyper.appendChild(document.createTextNode(Name));
//     hyper.setAttribute("href", "?type=Group&id=" + key);
//     document.getElementById("Group_Tab").appendChild(li);
//   }
// }
//=======================================================================
FriendlyChat.prototype.ListGroup2 = function() {
  var makeRef = firebase.database().ref("InstantMessage/Messages/Group");
  makeRef.once("value", function(Refdata) {
    Refdata.forEach(function (RefChildData) {
      Ref(RefChildData.val().Name, RefChildData.key);
    });
  });

  function Ref(Name, id) {
  var Nameref = firebase.database().ref("InstantMessage/Details/Group/"+Name+'/Members');

  Nameref.once("value", function(NameChild) {
    NameChild.forEach(function(childData) {
      if (childData.val().email == firebase.auth().currentUser.email) { //Tmp
      var ref = firebase.database().ref("InstantMessage/Details/Group/"+Name);
      ref.once("value").then(function(GroupData) {
        handleEventList(GroupData.val().Name, Name, id);
      });
      }
    });
  });

  }

  function handleEventList(Name, key, id) {
    var hyper = document.createElement("a");
    var li = document.createElement("li");
    var button = document.createElement("button");

    button.appendChild(hyper);
    li.appendChild(button);
    hyper.appendChild(document.createTextNode(Name));
    hyper.setAttribute("href", "?type=Group&id=" + key + "&ref=" +id);
    button.setAttribute("class","buttonList");
    document.getElementById("Group_Tab").appendChild(li);
  }
}
//==========================================================
FriendlyChat.prototype.ListEvent = function() {
  var makeRef = firebase.database().ref("InstantMessage/Messages/Event");
  makeRef.once("value", function(Refdata) {
    Refdata.forEach(function (RefChildData) {
      Ref(RefChildData.val().Name, RefChildData.key);
    });
  });

  function Ref(Name, id) {
  var Nameref = firebase.database().ref("InstantMessage/Details/Event/"+Name+'/Members');

  Nameref.once("value", function(NameChild) {
    NameChild.forEach(function(childData) {
      if (childData.val().email == firebase.auth().currentUser.email) { //Tmp
      var ref = firebase.database().ref("InstantMessage/Details/Event/"+Name);
      ref.once("value").then(function(GroupData) {
        handleEventList(GroupData.val().Name, Name, id);
      });
      }
    });
  });

  }

  function handleEventList(Name, key,id) {
    var hyper = document.createElement("a");
    var li = document.createElement("li");
    var button = document.createElement("button");

    button.appendChild(hyper);
    li.appendChild(button);
    hyper.appendChild(document.createTextNode(Name));
    hyper.setAttribute("href", "?type=Event&id=" + key + "&ref=" +id);
    button.setAttribute("class","buttonList");
    document.getElementById("Event_Tab").appendChild(li);
  }
}
//===================================================================================

FriendlyChat.prototype.ListCommunity = function() {
  var makeRef = firebase.database().ref("InstantMessage/Messages/Community");
  makeRef.once("value", function(Refdata) {
    Refdata.forEach(function (RefChildData) {
      Ref(RefChildData.val().Name, RefChildData.key);
    });
  });

  function Ref(Name, id) {
  var Nameref = firebase.database().ref("InstantMessage/Details/Community/"+Name+'/Members');

  Nameref.once("value", function(NameChild) {
    NameChild.forEach(function(childData) {
      if (childData.val().email == firebase.auth().currentUser.email) { //Tmp
      var ref = firebase.database().ref("InstantMessage/Details/Community/"+Name);
      ref.once("value").then(function(GroupData) {
        handleEventList(GroupData.val().Name, Name, id);
      });
      }
    });
  });
  }

  function handleEventList(Name, key,id) {
    var hyper = document.createElement("a");
    var li = document.createElement("li");
    var button = document.createElement("button");

    button.appendChild(hyper);
    li.appendChild(button);
    hyper.appendChild(document.createTextNode(Name));
    hyper.setAttribute("href", "?type=Community&id=" + key + "&ref=" +id);
    button.setAttribute("class","buttonList");
    document.getElementById("Community_Tab").appendChild(li);
  }
}



// Load and List the Group (temp: List out all the Group)
FriendlyChat.prototype.ListAllRoom = function() {
  //Community
  this.ListCommunity();
  //Group
  this.ListGroup2();
  //Event
  this.ListEvent();
};

// Add a Member
FriendlyChat.prototype.AddTheMember = function() {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  var type = url.searchParams.get("type");
  // var gn = "";

  // var Gref = firebase.database().ref("IM/Messages/Group/" + id);
  var Gref = firebase.database().ref("InstantMessage/Details/"+type+"/"+id+'/Members');
  // console.log("Gref: "+Gref);

  // var addmember = this.database.ref("IM/Details/Group/" + gn + "/Members");
  var user = document.getElementById('AddUser').value;

  if (user != null && user != "") {
    var strings = {
      email: user
    };
    Gref.push(strings);
    document.getElementById('AddUser').value = "";
    alert("Have Been add a member");
    window.location.reload();
  } else {
    alert("The Email field is empty!");
  }

};

// Delete a Member
FriendlyChat.prototype.DelTheMember = function() {
  var DeleteEmail = document.getElementById('DeleteUser').value;
  var url_string = window.location.href;
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  var type = url.searchParams.get("type");
  var DeleteMemberkey = "";

  var Gref = firebase.database().ref("InstantMessage/Details/"+type+"/"+id+'/Members');

  if (DeleteEmail != null && DeleteEmail != "") {
    Gref.on("value", function(DeleteData) {
      DeleteData.forEach(function(Delete) {
        if (Delete.val().email == DeleteEmail) {
          DeleteMemberkey = Delete.key;
        }
      });
    });

    if (DeleteMemberkey != "") {
      Gref.child(DeleteMemberkey).remove();
      document.getElementById('DeleteUser').value = "";
      alert("Have Been Delete a Member");
      window.location.reload();
    } else {
      alert("Not Valid Email");
    }

  } else {
    alert("The Email field is empty!");
  }
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value || this.checkSignedInWithMessage()) {
    var currentUser = firebase.auth().currentUser.email; //Tmp
    // Add a new message entry to the Firebase Database.
    // var temp = document.getElementById("GroupRef").value;

    var url_string = window.location.href;
    var url = new URL(url_string);
    var type = url.searchParams.get("type");
    var MsgRef = url.searchParams.get("ref");
    // var MsgRef = document.getElementById("hidden_id").value;

    var pushRef = this.database.ref('InstantMessage/Messages/' + type + "/" + MsgRef + '/Message');

    pushRef.push({
      name: currentUser, //Tmp
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '../../img/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};
// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
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
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '../../img/profile_placeholder.png'
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
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  // var provider = new firebase.auth.GoogleAuthProvider();
  // this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Sign out of Firebase.
  // this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) {
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '../../img/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    // this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    // this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.prepareLoad();
    this.ListAllRoom();
    // this.getType();
    // this.setReference();
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    // this.saveMessagingDeviceToken();
  } else {
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
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

// Saves the messaging device token to the datastore.
// FriendlyChat.prototype.saveMessagingDeviceToken = function() {
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
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
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

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions and make ' +
      'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var type = url.searchParams.get("type");

  if (type == "Group") {
    document.getElementById("Group").click();
  } else if (type == "Event") {
    document.getElementById("Event").click();
  } else if (type== "Community"){
    document.getElementById("Community").click();
  }
  window.friendlyChat = new FriendlyChat();

};
