// Initialize Firebase
var config = {
    apiKey: "AIzaSyBtoc_nzve5IxOQ0rVfHbGUQC6mxvsJT3g",
    authDomain: "passber-community-platform.firebaseapp.com",
    databaseURL: "https://passber-community-platform.firebaseio.com/",
    projectId: "passber-community-platform",
    storageBucket: "passber-community-platform.appspot.com",
    messagingSenderId: "192299184519",
    "headers": [ {
        "source" : "**/*.@(jpg|jpeg|gif|png)",
        "headers" : [ {
          "key" : "Access-Control-Allow-Origin",
          "value" : "*"
        } ]
      } ]
};
firebase.initializeApp(config);