var rootRef = firebase.database().ref();
var threadsRef = rootRef.child("threads");
var usersRef = rootRef.child("users");

var loginButton = document.getElementById("login-button");
var logoutButton = document.getElementById("logout-button");
var centerBlock = document.getElementById("center-block");

var newThreadInput = document.createElement("input");
newThreadInput.id = "new-thread-input";
newThreadInput.type = "text";
newThreadInput.placeholder = "url goes here";
newThreadInput.onkeypress = function(keyPress) {
  if (keyPress.key === "Enter" && newThreadInput.value.length > 0) {
    pushNewThread({
      title: newThreadInput.value,
      url: "http://www.google.com"
    }).then(function (result) {
      newThreadInput.value = "";
    }).catch(function (fail) {
      alert(JSON.stringify(fail));
    });
  }
};
centerBlock.appendChild(newThreadInput);

function pushNewThread(thread) {
  thread.createdAt = firebase.database.ServerValue.TIMESTAMP;
  return threadsRef.push(thread);
}

var googleAuth = new firebase.auth.GoogleAuthProvider();
var user = null;

function canonicalizeUser() {
  usersRef.child(user.uid).set({
    displayName: user.displayName,
    photoUrl: user.photoURL
  });
};

loginButton.onclick = function() {
  firebase.auth().signInWithPopup(googleAuth);
};

logoutButton.onclick = function() {
  firebase.auth().signOut();
};

function viewThreadElement(thread) {
  var threadElement = document.createElement("div");

  var titleElement = document.createElement("h3");
  titleElement.innerText = thread.title || "untitled";
  threadElement.appendChild(titleElement);

  return threadElement;
}

threadsRef.on("child_added", function(data) {
  centerBlock.appendChild(viewThreadElement(data.val()));
});


function setUserLoggedIn(loggedIn) {
  console.log("setting user to login = " + loggedIn);
  loginButton.disabled = loggedIn;
  logoutButton.disabled = !loggedIn;
}

firebase.auth().onAuthStateChanged(function (signedInUser) {
  console.log("auth state changed");
  user = signedInUser;
  if (user) {
    canonicalizeUser();
    setUserLoggedIn(true);
  } else {
    setUserLoggedIn(false);
  }
});
