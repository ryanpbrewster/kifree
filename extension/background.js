var config = {
  apiKey: "AIzaSyC-fbhSxrLl5fOef06lxMM2k5twqUUyJmY",
  databaseURL: "https://kifree-5ad0c.firebaseio.com/"
};
firebase.initializeApp(config);

var rootRef = firebase.database().ref();
var threadsRef = rootRef.child("threads");
var usersRef = rootRef.child("users");

var user = null;


function startAuth() {
  console.log("startAuth called");
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({interactive: false}, function(token) {
    console.log("got a token: ", token);
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      console.log("credential = " + credential);
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, function() {
            startAuth();
          });
        }
      }).then(function(data) {
        console.log("yay! data = ", data);
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

/**
 * Create a new thread
 */
function pushNewThread(thread) {
  if (!user) {
    console.error("pushNewThread called with no user!");
    return;
  }
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

/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  console.log("initializing background");
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(authData) {
    console.log('User state change detected from the Background script of the Chrome Extension:', authData);
    if (authData) {
      user = authData;
    } else {
      startAuth();
    }
  });
  chrome.browserAction.onClicked.addListener(function(tab) {
    pushNewThread({
      title: tab.title,
      url: tab.url
    })
  });
}

window.onload = function() {
  initApp();
};
