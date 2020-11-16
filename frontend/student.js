
async function loadExercises() {
    var exercises = await (await fetch('/user/exercises')).json();
    return exercises;
}

async function displayExercises() {
    
    var exercisesData = document.getElementById('exercisesData');
    exercisesData.innerHTML = "Loading...";
    try {
        var exercises = await loadExercises();
    } catch {
        window.location.href = '/';
    }
    
    
    document.getElementById('exercisesContent').style.display = "block";
    document.getElementById('resultsContent').style.display = "none";
    document.getElementById('aboutContent').style.display = "none";

    if (exercises.length > 0) {
        var table = "<table>";
        table += "<tr><th>Id</th><th>Description</th><th>Submit</th></tr>";
        
        for (var ex of exercises) {
            table += `<tr><td>${ex.id}</td><td>${ex.description}</td>`; 
            table += `<td><button onclick="showHandin(${ex.id});">hand in</button></td></tr>`;
        }
        table += "</table>";
        exercisesData.innerHTML = table;
    } else {
        exercisesData.innerHTML = "<p>No new exercises so far, if you feel bored ask your teacher for exercises!</p>";
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

function submitHandin(exerciseId) {
    fetch("/submissions", 
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(
                {
                    msg: document.getElementById('msg').value,
                    exercise_id: exerciseId
                    //student_id: 3
                })
        }
    ).then(function(response) {
        var exercisesView = document.getElementById('exercisesData');
        if (response.ok) {
            
            exercisesView.innerHTML = "<p>Thanks for submitting and have a nice day!</p>";
        } else {
            exercisesView.innerHTML = "<p class='errorMsg'>Something went wrong!</p>";
        }
    });

}


async function displayResults() {
    document.getElementById('exercisesContent').style.display = "none";
    document.getElementById('resultsContent').style.display = "block";
    document.getElementById('aboutContent').style.display = "none";
    
    var resultsData = document.getElementById('resultsData');
    resultsData.innerHTML = "Loading...";

    var results = await (await fetch('/user/submissions')).json();
    resultsData.innerHTML = "";
    var table = "<table>";
    table += "<tr><th>Exercise id</th><th>Description</th><th>Rating</th></tr>";
    
    for (var res of results) {
        let rating = res.rating >= 0 ? res.rating : " - ";
        table += `<tr><td>${res.exercise_id}</td><td>${res.description}</td><td>${rating}</td></tr>`; 
    }
    table += "</table>";
    resultsData.innerHTML += table;

}

function displayAbout() {
    document.getElementById('exercisesContent').style.display = "none";
    document.getElementById('resultsContent').style.display = "none";
    document.getElementById('aboutContent').style.display = "block";
}