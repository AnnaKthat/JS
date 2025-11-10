
//INITIAL STATE, HELPER FUNCTIONS AND LOCAL STORAGE

//Global state object
let state = loadState() || { habits: [] };

//Reference DOM elments
const rows = document.getElementById("rows");
const weekRangeEl = document.getElementById("week-range");

//Generate keys for last 7 days (including today and with today first)
function generateWeekKeys() {
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(formatDateKey(d));
  }
  return keys;
}

//Convert date to YYYY-MM-DD
function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

//Get today's key
function todayKey() {
  return formatDateKey(new Date());
}

//Generate once at load time
let weekKeys = generateWeekKeys();

//Save state to localStorage
function saveState(obj) {
  localStorage.setItem("habitTrackerState", JSON.stringify(obj));
}

//Load state from localStorage
function loadState() {
  const saved = localStorage.getItem("habitTrackerState");
  return saved ? JSON.parse(saved) : null;
}

//Function to create a new habit
function newHabit(name) {
  return {
    id: crypto.randomUUID(),
    name,
    log: {}
  };
}

//Calculate the current streak (number of days in a row up to today)
function computeStreak(habit) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    if (habit.log[key]) streak++;
    else break;
  }
  return streak;
}

//RENDER UI.Dynamic DOM Generation 

function render() {
  rows.innerHTML = "";

  //Update week range display
  const first = weekKeys[0]; // newest date 
  const last = weekKeys[weekKeys.length - 1]; //oldest date
  weekRangeEl.textContent = `${first} → ${last}`;


  if (state.habits.length === 0) {
    // Create a single placeholder row using the same grid layout as real rows
    // This ensures visual consistency even when empty
    const row = document.createElement("div");
    row.setAttribute("style",
      "display:grid;grid-template-columns:1.6fr repeat(7,.9fr) .8fr 1fr;align-items:center;border-bottom:1px solid #eef2f6;");
    
    //COLUMN 1: Name - Friendly message
    const nameCol = document.createElement("div");
    nameCol.setAttribute("style", "padding:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
    nameCol.textContent = "No habits yet";
    row.appendChild(nameCol);
    
    //COLUMNS 2-8:Empty day cells for alignment 
    weekKeys.forEach(() => {
      const col = document.createElement("div");
      col.setAttribute("style", "padding:10px;text-align:center;");
      row.appendChild(col);
    });
    
    //COLUMN 9:Streak - Show 0
    const streakCol = document.createElement("div");
    streakCol.setAttribute("style", "padding:10px;font-variant-numeric:tabular-nums;");
    streakCol.textContent = "0";
    row.appendChild(streakCol);
    
    //COLUMN 10:Actions - Gentle reminder
    const actionsCol = document.createElement("div");
    actionsCol.setAttribute("style", "padding:10px;color:#66788a;");
    actionsCol.textContent = "Add a habit";
    row.appendChild(actionsCol);
    
    rows.appendChild(row);
    return;
  }

  //POPULATED STATE: Build one row per habit
  state.habits.forEach(h => {
    const row = document.createElement("div");
    row.setAttribute("style", 
    "display:grid;grid-template-columns:1.6fr repeat(7,.9fr) .8fr 1fr;align-items:center;border-bottom:1px solid #eef2f6;");

    //COLUMN 1:Habit Name
    const nameCol = document.createElement("div");
    nameCol.setAttribute("style", "padding:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
    nameCol.textContent = h.name;
    row.appendChild(nameCol);

    //COLUMNS 2-8: Last 7 Days
    weekKeys.forEach(k => {
      const col = document.createElement("div");
      col.setAttribute("style", "padding:10px;text-align:center;");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `${h.name} on ${k}`); 
      btn.setAttribute("role", "checkbox"); 

      const checked = !!h.log[k];
      btn.setAttribute("aria-checked", String(checked));
      btn.textContent = checked ? "Yes" : ""; 

      btn.dataset.habitId = h.id;
      btn.dataset.dateKey = k;
      btn.setAttribute(
        "style",
        "display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin:auto;border-radius:8px;border:1px solid #dbe7f0;cursor:pointer;user-select:none;background:"+(checked?"#f7eff4ff":"#fff")+";color:"+(checked?"#dc127aff":"inherit")+";font-weight:"+
        (checked?"700":"400")+";"
      );

      btn.addEventListener("click", onToggleDay);
      //Keyboard support
      btn.addEventListener("keydown", e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          btn.click();
        }
      });

      //Add button to column, column to row
      col.appendChild(btn);
      row.appendChild(col);
    });

    //COLUMN 9:Current Streak Count
    const streakCol = document.createElement("div");
    streakCol.setAttribute("style", "padding:10px;font-variant-numeric:tabular-nums;");
    streakCol.textContent = String(computeStreak(h));
    row.appendChild(streakCol);

    //COLUMN 10:Action Buttons (Tick Today, Delete)
    const actions = document.createElement("div");
    actions.setAttribute("style", "padding:10px;display:flex;gap:8px;flex-wrap:wrap;");

    //Tick Today
    const tick = document.createElement("button");
    tick.type = "button";
    tick.textContent = "Tick today";
    tick.setAttribute("style", 
      "background:#fff;border:1px solid #dbe7f0;color:#0b3b58;padding:6px 10px;border-radius:8px;cursor:pointer;");
    tick.addEventListener("click", () => toggleLog(h.id, todayKey()));

    //Delete: remove habit permanently after confirmation
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete";
    del.setAttribute("style", 
      "background:#fff;border:1px solid #f2c9cd;color:#c71f23;padding:6px 10px;border-radius:8px;cursor:pointer;");
    del.addEventListener("click", () => {
      if (confirm(`Delete habit "${h.name}"?`)) {
        state.habits = state.habits.filter(x => x.id !== h.id);
        saveState(state);
        render();
      }
    });

    actions.appendChild(tick);
    actions.appendChild(del);
    row.appendChild(actions);
    rows.appendChild(row);
  });
}

//EVENT HANDLING & STATE MUTATION

function onToggleDay(e) {
  const btn = e.currentTarget;
  const habitId = btn.dataset.habitId;
  const dateKey = btn.dataset.dateKey;
  toggleLog(habitId, dateKey);
}

function toggleLog(habitId, dateKey) {
  const h = state.habits.find(x => x.id === habitId);
  if (!h) return;

  if (h.log[dateKey]) {
    delete h.log[dateKey]; 
  } else {
    h.log[dateKey] = true; 
  }

  saveState(state); 
  render(); 
}


//3.FORM HANDLING: Add new habits
document.getElementById("habit-form").addEventListener("submit", (e) => {
  e.preventDefault(); 
  const input = document.getElementById("habit-name");
  const name = input.value.trim(); 
  if (!name) return; 
  state.habits.push(newHabit(name));
  saveState(state);
  input.value = ""; 
  render(); 
});


//Data managment (Export, Import, Reset) 
document.getElementById("export-json").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { 
    type: "application/json" });
  const url = URL.createObjectURL(blob); 
  const a = document.createElement("a");
  a.href = url;
  a.download = "habits-export.json";
  a.click();
  URL.revokeObjectURL(url);
});

//Import (load habits from uploaded JSON file)
document.getElementById("import-json").addEventListener("change", async (e) => {
  const file = e.target.files?.[0]; 
  if (!file) return;

  try {
    const text = await file.text(); 
    const data = JSON.parse(text); 
    if (!Array.isArray(data.habits)) throw new Error("Invalid format");
    state = data; 
    saveState(state);
    render();
    alert("Import complete. Data loaded.");
  } catch (err) {
    alert("Import failed. Please check the JSON file format.");
  }
  e.target.value = ""; 
});

document.getElementById("reset-all").addEventListener("click", () => {
  //Double-check with user before deleting everything
  if (
    !confirm(
      "Are you sure? This will permanently remove all habits and logs from this browser.")) 
    return;

  state = { habits: [] }; 
  saveState(state);
  render();
  alert("All data reset.");
});

//INT
render();