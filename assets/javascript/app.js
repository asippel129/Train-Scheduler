$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCLj8zq38QXnj8qzSVNNmylCmrz1RHN_2E",
    authDomain: "train-scheduler-for-real.firebaseapp.com",
    databaseURL: "https://train-scheduler-for-real.firebaseio.com",
    projectId: "train-scheduler-for-real",
    storageBucket: "",
    messagingSenderId: "559751630408"
  };
  firebase.initializeApp(config);

  //reference to our firebase db
    var database = firebase.database();

    // onClick even variables
    var name;
    var destination;
    var firstTrain;
    var frequency = 0;

    $("#add-train").on("click", function() {
        event.preventDefault();
        //the data we store and then retrieve from the db
        name = $("#train-name").val().trim();
        destination = $("#destination").val().trim();
        firstTrain = $("#first-train").val().trim();
        frequency = $("#frequency").val().trim();

        // Pushing to database
        database.ref().push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
        $("form")[0].reset();
    });

    database.ref().on("child_added", function(childSnapshot) {
        var nextArr;
        var minAway;
        // **MUST go back one year when we are doing time differences!!
        var firstTrainNew = moment(childSnapshot.val().firstTrain, "hh:mm").subtract(1, "years");
        // Difference between the current and firstTrain
        var diffTime = moment().diff(moment(firstTrainNew), "minutes");
        var remainder = diffTime % childSnapshot.val().frequency;
        // minutes until the next train
        var minAway = childSnapshot.val().frequency - remainder;
        //next train arrival
        var nextTrain = moment().add(minAway, "minutes");
        nextTrain = moment(nextTrain).format("hh:mm");

        $("#add-row").append("<tr><td>" + childSnapshot.val().name +
                "</td><td>" + childSnapshot.val().destination +
                "</td><td>" + childSnapshot.val().frequency +
                "</td><td>" + nextTrain + 
                "</td><td>" + minAway + "</td></tr>");

        }, function(errorObject) {
            console.log("Errors: " + errorObject.code);
    });

    database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
        //display on our html
        $("#name-display").html(snapshot.val().name);
        $("#email-display").html(snapshot.val().email);
        $("#age-display").html(snapshot.val().age);
        $("#comment-display").html(snapshot.val().comment);
    });
});