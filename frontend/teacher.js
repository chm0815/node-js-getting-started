async function loadExercises() {
    var exercisesResponse = await fetch('/exercises');
    if (!exercisesResponse.ok || exercisesResponse.status == 401) {
        console.log(exercisesResponse);
        console.log("request failed, go to login page!");
        window.location.href = "/";
    }
    var exercises = await exercisesResponse.json();
    return exercises;
}

async function displayExercises() {

    document.getElementById('exercisesContent').style.display = "block";
    document.getElementById('submissionsContent').style.display = "none";
    document.getElementById('aboutContent').style.display = "none";

    var newExerciseTemplate = 
    `<div id="newExerciseTemplate">
    <form action="javascript:submitNewExercise();" id="exerciseForm">
    <fieldset>
        <legend>Create Exercise:</legend>
        <textarea rows="5" cols="100" name="description" id="description"></textarea><br>
        <input type="submit" value="create!">
    </fieldset>
    </form>
    </div>`;
    var exercisesData = document.getElementById('exercisesData');
    exercisesData.innerHTML = "<p>Loading...</p>";
    var exercises = await loadExercises();
    exercisesData.innerHTML = newExerciseTemplate;

    if (exercises.length > 0) {
        var table = "<table>";
        table += "<tr><th>Id</th><th>Description</th></tr>";
        
        for (var ex of exercises) {
            table += `<tr><td>${ex.id}</td><td>${ex.description}</td></tr>`; 
        }
        table += "</table>";
        exercisesData.innerHTML += table;
    } else {
        exercisesData.innerHTML = "<p>Your students feel bored, create some exercises!</p>";
        exercisesData.innerHTML += newExerciseTemplate;
    }
}

function showHandin(exerciseId) {
    var exercisesView = document.getElementById('exercisesData');
    var handinTemplate = 
    `<div id="handInTemplate" style="margin-top:10px; width=50%">
    <form action="javascript:submitHandin(${exerciseId});" id="handInForm">
    <fieldset>
        <legend>Submit Exercise ${exerciseId}:</legend>
        <textarea rows="5" cols="100" name="msg" id="msg"></textarea><br>
        <input type="submit" value="Submit">
    </fieldset>
    </form>
    </div>`;
    exercisesView.innerHTML = handinTemplate;
}

function submitNewExercise() {
    fetch("/exercises", 
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(
                {
                    description: document.getElementById('description').value
                })
        }
    ).then(function(response) {
        var exercisesView = document.getElementById('exercisesData');
        if (response.ok) {
            displayExercises();
        } else {
            exercisesView.innerHTML = "<p class='errorMsg'>Something went wrong!</p>";
        }
    });

}


async function displaySubmissions() {
    document.getElementById('exercisesContent').style.display = "none";
    document.getElementById('submissionsContent').style.display = "block";
    document.getElementById('aboutContent').style.display = "none";
    
    var submissionsData = document.getElementById('submissionsData');
    submissionsData.innerHTML = "Loading...";

    var submissions = await (await fetch('/submissions')).json();
    submissionsData.innerHTML = "";
    var table = "<table>";
    table += "<tr><th>Exercise id</th><th>Name</th><th>Description</th><th>Message</th><th>Rating</th></tr>";
    
    for (var sub of submissions) {
        let rating = sub.rating >= 0 ? sub.rating : "";
        table += `<tr><td>${sub.exercise_id}</td><td>${sub.uname}</td><td>${sub.description}</td><td>${sub.msg}</td>
        <td><input type="number" value="${rating}" id="rating_${sub.submission_id}">
        <button onclick="saveSubmission(${sub.submission_id})">save!</button></td></tr>`; 
    }
    table += "</table>";
    submissionsData.innerHTML += table;

}

function saveSubmission(submission_id) {
    var value = document.getElementById('rating_' + submission_id).value.trim();
    if (value.length > 0) {
        var rating = parseInt(value);
        fetch("/submissions/" + submission_id, 
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "PATCH",
            body: JSON.stringify(
                {
                    rating: rating
                })
        }
        ).then(function(response) {
            var submissionsData = document.getElementById('submissionsData');
            if (response.ok) {
                displaySubmissions();
            } else {
                submissionsData.innerHTML = "<p class='errorMsg'>Something went wrong!</p>";
            }
        });
    } 
}


function displayAbout() {
    document.getElementById('exercisesContent').style.display = "none";
    document.getElementById('submissionsContent').style.display = "none";
    document.getElementById('aboutContent').style.display = "block";
}