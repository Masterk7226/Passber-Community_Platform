// Getting the setting in html
var btn_submit = document.getElementById("btn_submit");
btn_submit.addEventListener('click', createNewGroup);

// Create the details of the New Group
function createDetails() {
  var key = "Null"; // Use to store the key
  var ref = firebase.database().ref("InstantMessage/Details/Group");
  var input_groupname = document.getElementById("NewGroupName").value; // Get the user inputed Group Name

  if (input_groupname != null && input_groupname != "") { // Check input not null and empty
    var strings = { // prepare for upload to database
      Members: {
        "-001M": {
          email: firebase.auth().currentUser.email // Get from where
        }
      },
      Name: input_groupname,
      Role: {
        "-001R": {
          email: firebase.auth().currentUser.email
        }
      }
    } // End of strings
    key = ref.push(strings); //Upload to DB
  } // End of if-else

  return key;
}

// Create store Message Record place for the new create
function createMessages(details) {
  var ref = firebase.database().ref("InstantMessage/Messages/Group");
  var Msgstrings = { // Prepare for upload to database
    Message: {
      name: "New Group Created."
    },
    Name: details.key
  };
  var checking = ref.push(Msgstrings); //Upload to DB
  alert("Create Success"); // Message to user that created

  document.getElementById("NewGroupName").value = ""; // Clear the input box
}

function createNewGroup() {
  var details = createDetails();
  if (details != null) {
    createMessages(details);
  } else {
    alert("Something Error!");
  }
}

function onAuthStateChanged() { // Check user login
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      alert("Something Error!");
    }
  });
}

window.onload = function() {
  onAuthStateChanged();
}
