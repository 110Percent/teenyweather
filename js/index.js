var locationQ;
var searchCity;
var weatherObject;
var canGetWeather;
var units = "c";



function searchWeather(searchTerm) {
    searchCity = searchTerm;
    locationQ = escape("select * from weather.forecast where woeid in (select woeid from geo.places(1) where text=\"" + searchTerm + "\") and u=\"c\"");
    var weatherObjectRaw;
    try {
        weatherObjectRaw = JSON.parse(httpGet("https://query.yahooapis.com/v1/public/yql?q=" + locationQ + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys")).query.results;
    } catch (err) {
        if (err) {
            canGetWeather = 0;
            try {
                httpGet("https://google.ca");
            } catch (err) {
                if (err) {
                    Materialize.toast("No internet connection. :(", 3000);
                } else {
                    Materialize.toast("Could not reach Yahoo! Weather API", 3000)
                }
            }
        }
        return 0;
    }
    if (weatherObjectRaw == null) {
        canGetWeather = 1;
    } else {
        weatherObject = weatherObjectRaw.channel;
        canGetWeather = 2;
    }
    console.log(weatherObject);
    return weatherObject;
}

function applyWeather(wObject) {
    if (canGetWeather == 2) {
        document.getElementById("region-name").textContent = "Weather for " + wObject.location.city + ", " + wObject.location.region + ", " + wObject.location.country;
        if (units == "c") {
            document.getElementById("weather-temperature").textContent = wObject.item.condition.temp + String.fromCharCode(176) + "C";
        } else {
            document.getElementById("weather-temperature").textContent = Math.round(wObject.item.condition.temp * 1.8 + 32) + String.fromCharCode(176) + "F";
        }
        document.getElementById("weather-conditions").textContent = wObject.item.condition.text;
        document.getElementById("weather-icon").className = "wi large wi-yahoo-" + wObject.item.condition.code;
        document.getElementById("unit-switch").style.display = "";
    } else if (canGetWeather == 1) {
        Materialize.toast("City " + searchCity + " not found.", 3000);
    }
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function validateForm(e) {
    e.preventDefault();
    var x = document.forms["locSearch"]["locSearchBar"].value;
    applyWeather(searchWeather(x));
    return false;
}

function setUnits(toUnit) {
    units = toUnit;
    console.log("Setting units to " + toUnit + ".");
    applyWeather(weatherObject);
}