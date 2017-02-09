var locationQ;
var searchCity;
var weatherObject;
var canGetWeather;
var units = "c";
getCityFromGeoLoc();



function searchWeather(searchTerm) {
    searchCity = searchTerm;
    locationQ = escape("select * from weather.forecast where woeid in (select woeid from geo.places(1) where text=\"" + searchTerm + "\") and u=\"c\"");
    var weatherObjectRaw;
    document.getElementById("preloader").style.display = "inline";
    try {
        weatherObjectRaw = JSON.parse(httpGet("https://query.yahooapis.com/v1/public/yql?q=" + locationQ + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys")).query.results;
    } catch (err) {
        document.getElementById("preloader").style.display = "none";
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
    document.getElementById("preloader").style.display = "none";
    console.log(weatherObject);
    return weatherObject;
}

function applyWeather(wObject) {
    document.getElementById("weather-timestamp").textContent = "Last updated at " + new Date().toString();
    if (canGetWeather == 2) {
        document.getElementById("region-name").textContent = "Weather for " + wObject.location.city + ", " + wObject.location.region + ", " + wObject.location.country;
        if (units == "c") {
            document.getElementById("weather-temperature").textContent = wObject.item.condition.temp + String.fromCharCode(176) + "C |";
        } else {
            document.getElementById("weather-temperature").textContent = Math.round(wObject.item.condition.temp * 1.8 + 32) + String.fromCharCode(176) + "F |";
        }
        document.getElementById("weather-conditions").textContent = wObject.item.condition.text;
        document.getElementById("weather-icon").className = "wi large wi-yahoo-" + wObject.item.condition.code;
        document.getElementById("unit-switch").style.display = "";
        for (var i = 1; i < 7; i++) {
            var cFor = wObject.item.forecast[i - 1];
            var proTemp = (Number(cFor.high) + Number(cFor.low)) / 2;
            if (units == "c") {
                document.getElementById("fc-" + i).textContent = proTemp + String.fromCharCode(176) + "C";
            } else {
                document.getElementById("fc-" + i).textContent = Math.round(proTemp * 1.8 + 32) + String.fromCharCode(176) + "F";
            }
            document.getElementById("fc-icon-" + i).className = "wi wi-yahoo-" + i + " fc-icon";
            document.getElementById("fcc-" + i).textContent = cFor.text;
            document.getElementById("fcw-" + i).textContent = cFor.day + " " + Number(cFor.date.split(" ")[0]);
        }
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

function getCityFromGeoLoc() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                long: position.coords.longitude
            };
            console.log("Current coordinates: " + pos.lat + ", " + pos.long);
            var getCity = JSON.parse(httpGet("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + pos.lat + "&lon=" + pos.long + "&zoom=18&addressdetails=1"));
            var cityString;
            if (getCity.address.city) {
                cityString = getCity.address.city + " " + getCity.address.country;
            } else if (getCity.address.village) {
                cityString = getCity.address.village + " " + getCity.address.country;
            } else if (getCity.address.state) {
                cityString = getCity.address.state + " " + getCity.address.country;
            }
            applyWeather(searchWeather(cityString));
        });


    }
}

function setUnits(toUnit) {
    units = toUnit;
    console.log("Setting units to " + toUnit + ".");
    applyWeather(weatherObject);
}