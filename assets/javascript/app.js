// Ensure document is ready
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
  
  // connectionsRef references a specific location in our database.
  // All of our connections will be stored in this directory.
  var connectionsRef = database.ref("/connections");

  // '.info/connected' is a special location provided by Firebase that is updated
  // every time the client's connection state changes.
  // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
  var connectedRef = database.ref(".info/connected");

  // When the client's connection state changes...
  connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {

      // Add user to the connections list.
      var con = connectionsRef.push(true);
      // Remove user from the connection list when they disconnect.
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
        freq: trainFreq
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

  // Refresh current train schedule every minute
  function dataRefresh() {
    database.ref("/trainData").on("value", function(snapshot) {

      $("#current-trains > tbody").empty();

      snapshot.forEach(function(childSnapshot) {
        // Locally store database snapshot
        var trainName = childSnapshot.val().name;
        var trainDest = childSnapshot.val().dest;
        var trainFirstTime = childSnapshot.val().firstTime;
        var trainFreq = childSnapshot.val().freq;

        // Moment.js calls
        // First time, pushed back 1 year to ensure before current time
        var firstTimeConverted = moment(trainFirstTime, "HH:mm").subtract(1, "years");
        // Difference between current time and first time
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart
        var tRemainder = diffTime % trainFreq;
        // Minutes until next train
        var tMinutesTillTrain = trainFreq - tRemainder;
        // Next train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");

        // Create new entries to add to current train schedule
        newRow = $("<tr>").append(
          $("<td>").text(trainName),
          $("<td>").text(trainDest),
          $("<td>").text(trainFreq),
          $("<td>").text(moment(nextTrain).format("hh:mm A")),
          $("<td>").text(tMinutesTillTrain),
        );
        $("#current-trains > tbody").append(newRow);
      });
    });
  }

  // MAIN CONTROLLER
  // ===============

  // Listen for form submit button
  $("#add-train-btn").on("click", addTrainData);

  // Listen for Firebase child_added
  database.ref("/trainData").on("child_added", function(childSnapshot) {
    // Locally store database snapshot
    var trainName = childSnapshot.val().name;
    var trainDest = childSnapshot.val().dest;
    var trainFirstTime = childSnapshot.val().firstTime;
    var trainFreq = childSnapshot.val().freq;

    // Moment.js calls
    // First time, pushed back 1 year to ensure before current time
    var firstTimeConverted = moment(trainFirstTime, "HH:mm").subtract(1, "years");
    // Difference between current time and first time
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    // Time apart
    var tRemainder = diffTime % trainFreq;
    // Minutes until next train
    var tMinutesTillTrain = trainFreq - tRemainder;
    // Next train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");

    // Create new entries to add to current train schedule
    newRow = $("<tr>").append(
      $("<td>").text(trainName),
      $("<td>").text(trainDest),
      $("<td>").text(trainFreq),
      $("<td>").text(moment(nextTrain).format("hh:mm A")),
      $("<td>").text(tMinutesTillTrain),
    );
    $("#current-trains > tbody").append(newRow);

    // timedCount();  

    // Error handler
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  // TIMER CONTROLS
  // ==============

  // Timer delay to update train data
  setInterval(dataRefresh, 60000);

});
