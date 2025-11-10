For my project, I decided to create a Habit Tracker web application.
At the beginning, I studied a tutorial in Canvas and followed the steps to build the basic HTML, JS an CSS structure.
Then I tested how it looked in the browser to plan my nexе moves.
The HTML and CSS parts were already well organized, but the JavaScript was missing important logic for handling data and dates.The app didn’t work and didn’t allow to enter the parameters (habits).
I built a state management system that lets the app save and load data from localStorage, so the user’s progress is kept even after refreshing the page.
For example- created state object to store habits:

let state = loadState() || { habits: [] };

I also added helper functions to create new habits, calculate streaks, and show the last seven days automatically.
And added functions for saving and loading state in the browser localStorage:

function saveState(obj) {
localStorage.setItem("habitTrackerState", JSON.stringify(obj));
}

function loadState() {
const saved = localStorage.getItem("habitTrackerState");
return saved ? JSON.parse(saved) : null;
}

And also added habit function to create new habits with unique IDs:

function newHabit(name) {
return {
    **id: crypto.randomUUID(),**

    **name,**

    **log: {}**

};
}

Added the streak calculation (number of days in a row up to today):

function computeStreak(habit) {
let streak = 0;
const today = new Date();
for (let i = 0; i < 7; i++) {
    **const d = new Date();**

    **d.setDate(today.getDate() - i);**

    **const key = formatDateKey(d);**

    **if (habit.log\[key]) streak++;**

    **else break;**

}
return streak;

And also impemented the date and week functions:
 
function generateWeekKeys() {
const keys = [];
for (let i = 0; i < 7; i++) {
    **const d = new Date();**

    **d.setDate(d.getDate() - i);**

    **keys.push(formatDateKey(d));**

}
return keys;
}


function formatDateKey(date) {
return date.toISOString().split("T")[0];
}


function todayKey() {
return formatDateKey(new Date());
}


let weekKeys = generateWeekKeys();

Impover the The render() function  to create the grid for each habit and make every cell clickable with a mouse or keyboard.4

function render() {
rows.innerHTML = "";


const first = weekKeys[0]; // newest date
const last = weekKeys[weekKeys.length - 1]; //oldest date
weekRangeEl.textContent = `${first} → ${last}`;

I also added options to export and import data as a JSON file and to reset all habits when needed.

Export JSON: saves all data to habits-export.json using Blob + URL.createObjectURL().
Import JSON: loads data from user-uploaded .json file and replaces current state.
Reset All: Confirms and clears all stored data from browser.


In addition, I fixed the generateWeekKeys function, changed the color palette and made the week display from oldest to newest.
After testing in Chrome, the app now works completely in the browser!