const apiKey = "74eed6ea1f8ec3984e4cc07e5ac8edb5";

//DOM elements
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const loading = document.getElementById("loading");
const currentWeatherBox = document.getElementById("currentWeather");
const forecastBox = document.getElementById("forecast");
const errorBox = document.getElementById("error");

//Event listener
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city)
        return showError("Please enter a city name.");
    
    fetchWeather(city);
});

//Fetch Weather Data
function fetchWeather(city) {
    showLoading();

    const urlCurrent =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const urlForecast =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    Promise.all([
        fetch(urlCurrent).then(r => validateResponse(r)),
        fetch(urlForecast).then(r => validateResponse(r))
    ])
    .then(([current, forecast]) => {
        hideLoading();
        renderCurrentWeather(current);
        renderForecast(forecast);
    })
    .catch(err => {
        hideLoading();
        showError(err.message);
    });
}

//Validate AJAX response
function validateResponse(response) {
    if (!response.ok) {
        throw new Error("City not found");
    }
    return response.json();
}

//Render current weather
function renderCurrentWeather(data) {
    currentWeatherBox.innerHTML = `
        <h2>${data.name}</h2>
        <p>${data.weather[0].description}</p>
        <p>Temp: ${data.main.temp}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
    `;
}

//Render 5-day forecast
function renderForecast(data) {
    forecastBox.innerHTML = "";

    const daily = data.list.filter(item => item.dt_txt.includes("12:00"));

    daily.forEach(item => {
        const card = document.createElement("div");
        card.className = "forecast-item";

        card.innerHTML = `
            <p>${item.dt_txt.split(" ")[0]}</p>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png">
            <p>${item.main.temp}°C</p>
        `;

        forecastBox.appendChild(card);
    });
}

//UI helpers
function showLoading() {
    loading.classList.remove("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

function showError(msg) {
    errorBox.innerText = msg;
    errorBox.classList.remove("hidden");

    setTimeout(() => errorBox.classList.add("hidden"), 3000);
}
