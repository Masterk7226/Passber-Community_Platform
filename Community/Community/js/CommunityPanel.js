var header = document.getElementById("header");
var url_string = window.location.href;
var url = new URL(url_string);
var key = url.searchParams.get("id");

function loadHeader() {
  var ref = firebase.database().ref("Platform/" + key + "/Info");
  ref.once('value', function(data) {
    header.innerHTML = "<h1>" + data.val().Name + "</h1><hr/>";
  });
}

function loadContent() {
  var Content = document.getElementById("Content");
  Content.innerHTML =
    "<fieldset>" +
    "<legend>Basic Information</legend>" +
    "<a href='Geo-Mapping/ver5.html'>Display Event</a><br/>"+
    "<a href='PhotoAlbum/album_view.html'>Photo Album</a>"+
    "</fieldset>"

    // "<fieldset>"+
    // "<legend>Adminstrator</legend>"+
    // "<a href = 'MemberControl.html' > Control Page < /a><br/ >"+
    // "<a href = 'Form_CreateEvent.html' > Create Event Form < /a><br/ >"+
    // "<a href = 'Dynamic-Form/select-template.html' > Event Register Form < /a><br/ >"+
    // "</fieldset>"
}



window.onload = function() {
  loadHeader();
  loadContent();
}
