// GitHub sign-in flow per Firebase JavaScript SDK
// ===============================================
var provider = new firebase.auth.GithubAuthProvider();

// To sign in with a pop-up window, call signInWithPopup:
firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a GitHub Access Token. You can use it to access the GitHub API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  // ...
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});


// Ensure document is ready
// ========================
$(document).ready(function() {

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyC531r4gMhQnG4w6y1ZfK7wfTs2diWP9b4", // Insert API Key
    authDomain: "bcbc-firebase.firebaseapp.com",
    databaseURL: "https://bcbc-firebase.firebaseio.com",
    projectId: "bcbc-firebase",
    storageBucket: "bcbc-firebase.appspot.com",
    messagingSenderId: "890360445286"
  };
  firebase.initializeApp(config);

  // VARIABLES
  // =========
  var database = firebase.database(); // Declare variable for firebase database
  
  // connectionsRef references a specific location in our database
  // ==============================================================

  // All of our connections will be stored in this directory
  var connectionsRef = database.ref("/connections");

  // '.info/connected' is a special location provided by Firebase that is updated
  // every time the client's connection state changes
  // '.info/connected' is a boolean value, true if the client is connected and false if they are not
  var connectedRef = database.ref(".info/connected");

  // When the client's connection state changes
  connectedRef.on("value", function(snap) {

    // If they are connected
    if (snap.val()) {

      // Add user to the connections list
      var con = connectionsRef.push(true);
      // Remove user from the connection list when they disconnect
      con.onDisconnect().remove();
    }
  });

  // When first loaded or when the connections list changes...
  connectionsRef.on("value", function(snap) {

    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#connected-viewers").text(snap.numChildren());
  });
  
  // FUNCTIONS
  // =========

  // Get train data from form and upload to /trainData database.ref
  function addTrainData() {
    event.preventDefault();

    // Get train data from form
    var trainName = $("#train-name-input").val().trim();
    var trainDest = $("#destination-input").val().trim();
    var trainFirstTime = $("#first-train-time-input").val().trim();
    var trainFreq = $("#frequency-input").val().trim();

    // Check if all form inputs have been provided
    if (trainName !== "" && trainDest !== "" && trainFirstTime !== "" && trainFreq !== "") {
      // Create local temporary object for holding train data
      var newTrain = {
        name: trainName,
        dest: trainDest,
        firstTime: trainFirstTime,
        freq: trainFreq,
        arrivalChange: "",
        updatedFlag: false
      }

      // Upload train data to database
      database.ref("/trainData").push(newTrain);

      // Clear form inputs
      $("#train-name-input").val("");
      $("#destination-input").val("");
      $("#first-train-time-input").val("");
      $("#frequency-input").val("");
    }
  }

  // Refresh current train schedule every minute by grabbing /trainData snapshot 
  function refreshData() {
    database.ref("/trainData").on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        // Locally store database snapshot
        var trainName = childSnapshot.val().name;
        var trainDest = childSnapshot.val().dest;
        var trainFirstTime = childSnapshot.val().firstTime;
        var trainFreq = childSnapshot.val().freq;
        var trainArrivalChange = childSnapshot.val().arrivalChange;
        var trainUpdatedFlag = childSnapshot.val().updatedFlag;
        var trainKey = childSnapshot.key;
        var addTrainFlag = false;

        // Check if updated arrival time and call updateDisplay and pass either updated arrival time or first train time
        // Once updated arrival time passes, the next train and minutes away will be calculated based on the first train time 
        if (trainArrivalChange !== "") {
          if (moment().format("HH:mm") < trainArrivalChange) {
            updateDisplay(trainName, trainDest, trainArrivalChange, trainFreq, trainUpdatedFlag, trainKey, addTrainFlag);
          } else {
            database.ref(`/trainData/${trainKey}`).update({arrivalChange: ""})
          }
        } else {
          updateDisplay(trainName, trainDest, trainFirstTime, trainFreq, trainUpdatedFlag, trainKey, addTrainFlag);
        }
      });
    });
  }

  // Update display after Moment.js calls
  function updateDisplay(trainName, trainDest, trainTime, trainFreq, updatedFlag, trainKey, addTrainFlag) {
    // First time, pushed back 1 year to ensure before current time
    var firstTimeConverted = moment(trainTime, "HH:mm").subtract(1, "years");
    // Difference between current time and first time
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    // Time apart
    var tRemainder = diffTime % trainFreq;
    // Minutes until next train
    var tMinutesTillTrain = trainFreq - tRemainder;
    // Next train; update /trainData
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    // Check if adding new train
    if (addTrainFlag) {
      // Create new entries to add to current train schedule
      newRow = $(`<tr data-key="${trainKey}">`).append(
        $(`<td id="${trainName.replace(/\s/g, '')}-name" contenteditable="true">`).text(trainName),
        $(`<td id="${trainName.replace(/\s/g, '')}-dest" contenteditable="true">`).text(trainDest),
        $("<td>").text(trainFreq),
        $(`<td id="${trainName.replace(/\s/g, '')}-next-train" contenteditable='true'>`).text(moment(nextTrain).format("hh:mm A")),
        $(`<td id="${trainName.replace(/\s/g, '')}-minutes-away">`).text(tMinutesTillTrain),
        $(`<button type="button" class="btn btn-outline-warning btn-lg update-btn">Update</button>`),
        $(`<button type="button" class="btn btn-outline-danger btn-lg remove-btn">Remove</button>`)
      );
      $("#current-trains > tbody").append(newRow);
    // Update minutes to arrival and next train time for refreshing data
    } else if (!addTrainFlag && !updatedFlag) {
      $(`#${trainName.replace(/\s/g, '')}-next-train`).text(moment(nextTrain).format("hh:mm A"));
      $(`#${trainName.replace(/\s/g, '')}-minutes-away`).text(tMinutesTillTrain);
      
    // Return nextTrain for conditional check to see if /trainData updated
    } else if (updatedFlag) {
      return moment(nextTrain).format("HH:mm");
    }
  }


  // MAIN CONTROLLER
  // ===============
  $("#current-trains > tbody").empty();

  // Listen for form submit button
  $("#add-train-btn").on("click", addTrainData);

  // Listen for child_added to /trainData and grab childSnapshot
  database.ref("/trainData").on("child_added", function(childSnapshot) {
    // Locally store database snapshot
    var trainName = childSnapshot.val().name;
    var trainDest = childSnapshot.val().dest;
    var trainFirstTime = childSnapshot.val().firstTime;
    var trainFreq = childSnapshot.val().freq;
    var trainArrivalChange = childSnapshot.val().arrivalChange;
    var trainUpdatedFlag = childSnapshot.val().updatedFlag;
    var trainKey = childSnapshot.key;
    var addTrainFlag = true;

    // Call updateDisplay with values assigned to childSnapshot arguments
    updateDisplay(trainName, trainDest, trainFirstTime, trainFreq, trainUpdatedFlag, trainKey, addTrainFlag);

    // Error handler
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  // Listen for remove buttons
  $(document).on("on click", ".remove-btn", function(event){
    // If confirmed, remove from /trainData and current train schedule
    var response = confirm("Confirm removal of " + $(this).parent().children()[0].textContent + " train.");
    if (response) {
      database.ref(`/trainData/${$(this).parent().attr("data-key")}`).remove();
      $(this).parent().remove();
    }
    
  });

  // Listen for update buttons
  $(document).on("on click", ".update-btn", function(event){
    var updateRow = $(this).parent();
    // Check if confirmed, update /trainData
    var response = confirm("Confirm updates for " + updateRow.children()[0].textContent + " train.");
    // Locally store database snapshot
    database.ref(`/trainData/${updateRow.attr("data-key")}`).once("value", function(snapshot) {
      // Locally store database snapshot
      var trainName = snapshot.val().name;
      var trainDest = snapshot.val().dest;
      var trainFreq = snapshot.val().freq;
      var trainFirstTime = snapshot.val().firstTime;
      var trainArrivalChange = snapshot.val().arrivalChange;
      var trainUpdatedFlag = snapshot.val().updatedFlag;
      var trainKey = snapshot.key;
      var addTrainFlag = false;

      if (response) {
        // Create local temporary object for holding train data; assign nextTrain to firstTime 
        var updatedTrain = {
          name: updateRow.children()[0].textContent,
          dest: updateRow.children()[1].textContent, 
          updatedFlag: true
        }
        var arrivalChange = moment(updateRow.children()[3].textContent, "hh:mm A").format("HH:mm");

        // Call updateDisplay to get nextTrain for conditional check to see if /trainData updated
        if (trainArrivalChange !== "") {
          if (moment().format("HH:mm") < trainArrivalChange) {
            var nextTrain = updateDisplay(trainName, trainDest, trainArrivalChange, trainFreq, updatedTrain.updatedFlag, trainKey, addTrainFlag);
          }
        } else {
          var nextTrain = updateDisplay(trainName, trainDest, trainFirstTime, trainFreq, updatedTrain.updatedFlag, trainKey, addTrainFlag);
        }
        // Check if /trainData was updated
        if (updatedTrain.name !== trainName || updatedTrain.dest !== trainDest || arrivalChange !== nextTrain) {
          // Reset flag
          updatedTrain.updatedFlag = false;
          if (arrivalChange !== nextTrain) {
            updatedTrain.arrivalChange = moment(updateRow.children()[3].textContent, "hh:mm A").format("HH:mm");
          }
          // Upload train data to database
          database.ref(`/trainData/${trainKey}`).update(updatedTrain);
          refreshData();
        }
      } else {
        $(updateRow.children()[0]).text(trainName);
        $(updateRow.children()[1]).text(trainDest);
      }
    });
  });

  // TIMER CONTROLS
  // ==============

  // Timer delay to update train data
  setInterval(refreshData, 10000);

});
