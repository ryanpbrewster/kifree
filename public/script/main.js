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
  thread.users = {};
  thread.users[user.uid] = true;

  var newThreadRef = threadsRef.push();
  var updateData = {};
  updateData["users/" + user.uid + "/threads/" + newThreadRef.key] = true;
  updateData["threads/" + newThreadRef.key] = thread;
  console.log("updating: " + JSON.stringify(updateData));
  return rootRef.update(updateData);
}

var googleAuth = new firebase.auth.GoogleAuthProvider();
var user = null;

function canonicalizeUser() {
  usersRef.child(user.uid).child("profile").set({
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
  console.log("viewing: " + JSON.stringify(thread));
  var threadElement = document.createElement("div");

  var titleElement = document.createElement("a");
  titleElement.innerText = thread.title;
  titleElement.href = thread.url;
  threadElement.appendChild(titleElement);

  return threadElement;
}

function setUpListeners() {
  usersRef.child(user.uid + "/threads").on("child_added", function(userThread) {
    threadsRef.child(userThread.key).once("value", function (thread) {
      centerBlock.appendChild(viewThreadElement(thread.val()));
    });
  });
}


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
    setUpListeners();
  } else {
    setUserLoggedIn(false);
  }
});
