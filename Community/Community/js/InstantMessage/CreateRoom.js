var btn_submit = document.getElementById("btn_submit");
btn_submit.addEventListener('click', createNewGroup);

function createDetails() {
  var key = "Null";
  var ref = firebase.database().ref("Platform/InstantMessage/Details/Group");
  var input_groupname = document.getElementById("NewGroupName").value;

  if (input_groupname != null && input_groupname != "") {
    var strings = {
      Members: {
        "-001M": {
          email: firebase.auth().currentUser.email
        }
      },
      Name: input_groupname,
      Role: {
        "-001R": {
          email: firebase.auth().currentUser.email
        }
      }
    } // End of strings
    key = ref.push(strings);
  } // End of if-else

  return key;
}

function createMessages(details) {
  var ref = firebase.database().ref("Platform/InstantMessage/Messages/Group");
  var Msgstrings = {
    Message: {
      name: "New Group Created."
    },
    Name: details.key
  };
  var checking = ref.push(Msgstrings);
  alert("Create Success");

  document.getElementById("NewGroupName").value="";
}

function createNewGroup() {
  var details = createDetails();
  if (details != null) {
    createMessages(details);
  } else {
    alert("Something Error!");
  }
}

function onAuthStateChanged() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      alert("Something Error!");
    }
  });
}

window.onload = function() {
  onAuthStateChanged();
}
