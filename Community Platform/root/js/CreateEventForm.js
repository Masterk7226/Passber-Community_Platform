var div_UserProfile = document.getElementById("UserProfile");
var btn_Submit = document.getElementById("Submit");
btn_Submit.addEventListener("click",UpdateToDatabase);

function BackGround() {
  div_UserProfile.textContent = "User: " + firebase.auth().currentUser.email;
}

var btn_submit = document.getElementById("Submit");
btn_submit.addEventListener('click', UpdateToDatabase);

function UpdateToDatabase() {
  var Input_Logo = document.getElementsByName("evt_logo")[0].value;
  // Missing the Logo upload to firebase

  var Input_Name = document.getElementsByName("evt_name")[0].value;
  var Input_DoS = document.getElementsByName("date_start")[0].value;
  var Input_DoE = document.getElementsByName("date_end")[0].value;
  var Input_Address = document.getElementsByName("evt_address")[0].value;
  var Input_Content = document.getElementsByName("evt_content")[0].value;
  var Input_Deadline = document.getElementsByName("deadline")[0].value;
  var Input_Long = document.getElementsByName("longtitude")[0].value;
  var Input_Lat = document.getElementsByName("latitude")[0].value;
  // Missing the Fees
  var parent = document.getElementById("feesfield");
  var nodesSameClass = parent.getElementsByClassName("countfee").length;

    // console.log("nodesSameClass: " + nodesSameClass);

  var tempToStorageThefee = "";
  for (var i=0; i<nodesSameClass; i++) {
    tempToStorageThefee += "Members: " + document.getElementById("feeName"+i).value ;
    tempToStorageThefee += " Fee: " + document.getElementById("feeAmt"+i).value + " ";
  }
  // console.log(tempToStorageThefee);


  var EventRef = firebase.database().ref("Platform/ABCClub/EventForm");
  console.log("Ref: " + EventRef);
  var preStrings = {
    "Name" : Input_Name,
    "DoS" : Input_DoS,
    "DoE" : Input_DoE,
    "Address" : Input_Address,
    "Content" : Input_Content,
    "Deadline" : Input_Deadline,
    "Long" : Input_Long,
    "Lat" : Input_Lat,
    "Fee" : tempToStorageThefee
  };

  var result = EventRef.push(preStrings);
  alert("It is created.");
  window.location = "/Community";


  // CreateTheEventRoomDetails(Input_Name); Temp to close the Update
  // CreateThePhotoAlbum();
}

var savePhotoMessage = function(Input_Logo) {
  event.preventDefault();
  var file = event.target.files[0];

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
      ratings: 0
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

function CreateTheEventRoomDetails(Input_Name) {
  var CreateEventRoomRef = firebase.database().ref("IM/Details/Event");
  var preStrings = {
    Members: {
      "-001M": {
        email: firebase.auth().currentUser.email
      }
    },
    Name: Input_Name,
    Role: {
      "-001R": {
        email: firebase.auth().currentUser.email
      }
    }
  };
  var result = CreateEventRoomRef.push(preStrings);
  console.log("CreateTheEventRoom :" + result);

  CreateEventRoomRef = firebase.database().ref("IM/Messages/Group");
  var preStrings2 = {
    Message: {
      name: "New Group Created."
    },
    Name: result.key
  };
}

function onAuthStateChanged() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      BackGround();
    } else {
      alert("Not Login");
      window.location = "/login";
    }
  });
}

window.onload = function() {
  onAuthStateChanged();
}
