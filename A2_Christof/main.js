

// PAGE NAVIGATION LOGIC
// Target navigation buttons and page sections
const page1btn = document.querySelector("#page1btn");
const page2btn = document.querySelector("#page2btn");
const page3btn = document.querySelector("#page3btn");
const page1 = document.querySelector("#page1");
const page2 = document.querySelector("#page2");
const page3 = document.querySelector("#page3");

// Function to hide all pages
let currentPage = "";
function hideall() { //function to hide all pages
    page1.style.display = "none";
    page2.style.display = "none";
    page3.style.display = "none";
    currentPage = "";
}

// Event listeners to switch between pages
/*Listen for clicks on the buttons, assign anonymous
eventhandler functions to call show function*/
page1btn.addEventListener("click", function () {
    hideall(); //we don't know which page is shown, so hideall
    page1.style.display = "block";
    currentPage = "game";
    ResetPos(); // Reset robot game when page 1 is shown
});
page2btn.addEventListener("click", function () {
    hideall(); //we don't know which page is shown, so hideall
    page2.style.display = "block";
    currentPage = "info";
});
page3btn.addEventListener("click", function () {
    hideall(); //we don't know which page is shown, so hideall
    page3.style.display = "block";
    currentPage = "quiz";
});

hideall(); //call hideall function to hide all pages

/*JS for hamMenu */
const hamBtn = document.querySelector("#hamIcon");
const menuItemsList = document.querySelector("#menuItemsList");
let toggleState = false;

// 🔹 Toggle menu visibility and animate hamburger icon
hamBtn.addEventListener("click", function () {
    hamBtn.classList.remove("openA", "openB", "closeA", "closeB");
    void hamBtn.offsetWidth; // force reflow

    const newClass = toggleState ? "closeA" : "openA";
    hamBtn.classList.add(newClass);
    toggleState = !toggleState;

    menuItemsList.classList.toggle("menuShow");
});



// ROBOT GAME CONTROLS AND SETUP
// Target control buttons and game container
/*find references to all the buttons and ball */
const leftBtn = document.querySelector("#leftBtn");
const rightBtn = document.querySelector("#rightBtn");
const upBtn = document.querySelector("#upBtn");
const downBtn = document.querySelector("#downBtn");
const resetBtn = document.querySelector("#resetBtn");


var score = 0;
const scoreBox = document.getElementById("scoreBox");
const collectAudio = new Audio("Audio/success-1.mp3");
let timeLeft = 30;
let timerInterval;
let gameActive = false;

var robotX = 0; //assign initial position of robot
var robotY = 0;

// Reset robot position and game state
function ResetPos() {
    const container = document.getElementById("container");
    const robot = document.getElementById("robot");
    const waypointObj = document.getElementById("Waypoint");

    if (!container || !robot || !waypointObj) {
        console.warn("ResetPos aborted: missing container, robot, or waypoint.");
        return;
    }

    robot.classList.add("robot-reset");

    robotX = 0;
    robotY = 0;
    score = 0;
    scoreBox.innerHTML = "Score: " + score;
    MoveWaypoint(waypointObj);

    timeLeft = 30;
    document.getElementById("timerDisplay").textContent = "Time Left: " + timeLeft + "s";
    document.getElementById("gameResult").textContent = "";
    gameActive = true;

    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        timeLeft--;
        document.getElementById("timerDisplay").textContent = "Time Left: " + timeLeft + "s";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameActive = false;
            checkGameEnd();
        }
    }, 1000);

    const maxX = container.clientWidth - robot.offsetWidth;
    const maxY = container.clientHeight - robot.offsetHeight;

    robotX = Math.max(0, Math.min(robotX, maxX));
    robotY = Math.max(0, Math.min(robotY, maxY));

    robot.style.left = robotX + "px";
    robot.style.top = robotY + "px";


    setTimeout(function () {
        robot.classList.remove("robot-reset");
    }, 500);

}

// Move robot and update direction
function MovePos(leftInc, topInc) {

    if (!gameActive || currentPage !== "game") return;
    const container = document.getElementById("container");
    const robot = document.getElementById("robot");

    if (!container || !robot) return;

    robotX += leftInc;
    robotY += topInc;

    // Swap facing direction
    if (leftInc < 0) {
        robot.classList.remove("robot-right");
        robot.classList.add("robot-left");
    } else if (leftInc > 0) {
        robot.classList.remove("robot-left");
        robot.classList.add("robot-right");
    }

    checkCollision();

    // Clamp and update visuals
    const maxX = container.clientWidth - robot.offsetWidth;
    const maxY = container.clientHeight - robot.offsetHeight;

    robotX = Math.max(0, Math.min(robotX, maxX));
    robotY = Math.max(0, Math.min(robotY, maxY));

    robot.style.left = robotX + "px"; //set left css property to ball x variable
    robot.style.top = robotY + "px"; //set top css property to ball y variable
}

// Button controls for robot movement
leftBtn.addEventListener("click", function () {
    MovePos(-10, 0);
});
rightBtn.addEventListener("click", function () {
    MovePos(10, 0);
});
upBtn.addEventListener("click", function () {
    MovePos(0, -10);
});
downBtn.addEventListener("click", function () {
    MovePos(0, 10);
});
resetBtn.addEventListener("click", ResetPos);

// Keyboard controls (WASD)
document.addEventListener('keydown', function (kbEvt) {
    if (!gameActive || currentPage !== "game") return;

    //kbEvt: an event object passed to callback function
    console.log(kbEvt); //see what is returned
    const key = kbEvt.key.toLowerCase(); // Normalize to lowercase
    switch (key) {
        case "w":
            MovePos(0, -10); // Up
            break;
        case "a":
            MovePos(-10, 0); // Left
            break;
        case "s":
            MovePos(0, 10); // Down
            break;
        case "d":
            MovePos(10, 0); // Right
            break;
    }
});

// COLLISION DETECTION AND SCORING
let collisionCooldown = false;

// Check if robot overlaps with waypoint
function checkCollision() {

    if (!gameActive || currentPage !== "game") return;
    // skips collision if too short a time since last collision
    if (collisionCooldown) return;
    
    const robot = document.getElementById("robot");
    const robotObj = document.getElementById("robot");
    const waypointObj = document.getElementById("Waypoint");

    if (robotObj && waypointObj) {
        const robotRect = robotObj.getBoundingClientRect();
        const waypointRect = waypointObj.getBoundingClientRect();
        

        if (checkOverlap(robotRect, waypointRect)) {
            console.log("Collision detected!");
            score++;
            scoreBox.innerHTML = "Score: " + score;
            collectAudio.play();
            // move elsewhere after collection
            MoveWaypoint(waypointObj);

            // Activate cooldown
            collisionCooldown = true;
            setTimeout(function () {
                collisionCooldown = false;
                robot.classList.remove("robot-reset");
            }, 1000);
            // 500ms delay before next collision allowed
        }
    }

    if (score >= 5) {
        clearInterval(timerInterval);
        gameActive = false;
        checkGameEnd();
    }

}

// Check rectangle overlap
function checkOverlap(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// Generate random number between min and max
function GetRandom(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

// Move waypoint to random location
function MoveWaypoint(waypointObj) {
    const container = document.getElementById("container");
    if (container && waypointObj) {
        waypointObj.style.left = GetRandom(0, container.clientWidth - waypointObj.offsetWidth) + "px";
        waypointObj.style.top = GetRandom(0, container.clientHeight - waypointObj.offsetHeight) + "px";
    }
    else {
        console.warn("MoveWaypoint failed: Missing container or waypointObj.");
    }
}

// game instructions and end result
function updateInstructionText() {
    const instruction = document.getElementById("instructionText");
    if (!instruction) return;

    if (window.innerWidth < 800) {
        instruction.innerText = "Use the input controls below to guide the spot-explorer robot to the Waypoint! Reach a score of 5 in time!";
    } else {
        instruction.innerText = "Use the input controls or WASD keys to guide the spot-explorer robot to the Waypoint! Reach a score of 5 within the time limit!";
    }
}

// Display win/lose message
function checkGameEnd() {
    const result = document.getElementById("gameResult");
    gameActive = false;
    if (score >= 5) {
        result.textContent = " You Win!";
    } else {
        result.textContent = " You Lose. Try Again!";
    }
}


// Run once on load
updateInstructionText();

// Update on resize
window.addEventListener("resize", updateInstructionText);

// quiz submission and scoring
const btnSubmit = document.querySelector("#btnSubmit");
const scorebox = document.querySelector("#quizScoreBox");

// Define correct answers for each question
const correctAnswers = ["Ultrasonic", "Hearing", "Thermal Sensor"];
let quizScore = 0;
// Event listener to validate quiz answers and calculate score
btnSubmit.addEventListener("click", function () {
    quizScore = 0;

    // Check radio button answers (Q1–Q3)
    for (let i = 0; i < correctAnswers.length; i++) {
        const selected = document.querySelector("input[name='q" + (i + 1) + "']:checked");
        if (selected && selected.value === correctAnswers[i]) {
            quizScore++;
        }
    }

    // Check text input answer (Q4)
    const textAnswer = document.querySelector("#q4");
    if (textAnswer && textAnswer.value.trim().toLowerCase() === "adaptability") {
        quizScore++;
    }

    // Check dropdown answer (Q5)
    const dropdownAnswer = document.querySelector("#q5");
    if (dropdownAnswer && dropdownAnswer.value === "Speech Recognition") {
        quizScore++;
    }

    // Check checkbox answers (Q6)
    const correctCheckboxes = ["Speech Recognition", "Facial Recognition", "Gesture Detection"];
    const selectedCheckboxes = Array.from(document.querySelectorAll("input[name='q6']:checked")).map(cb => cb.value);

    if (correctCheckboxes.every(ans => selectedCheckboxes.includes(ans)) && selectedCheckboxes.length === correctCheckboxes.length) {
        quizScore++;
    }

    // Display final quiz score
    scorebox.innerHTML = "Score: " + quizScore;
});


// window size report
const heightOutput = document.querySelector("#height");
const widthOutput = document.querySelector("#width");
function reportWindowSize() {
    heightOutput.textContent = window.innerHeight;
    widthOutput.textContent = window.innerWidth;
}

// Function to update screen dimensions
reportWindowSize();
window.addEventListener("resize", reportWindowSize);//when resize, update
