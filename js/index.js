var locationQ;
var weatherObject;
applyWeather(searchWeather("somewhere"));




function searchWeather(searchTerm){
    locationQ = escape("select * from weather.forecast where woeid in (select woeid from geo.places(1) where text=\"" + searchTerm + "\") and u=\"c\"");
    var weatherObject = JSON.parse(httpGet("https://query.yahooapis.com/v1/public/yql?q=" + locationQ + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys")).query.results.channel;
    console.log(weatherObject);
    return weatherObject;
}

function applyWeather(wObject){
    document.getElementById("region-name").textContent = "Weather for " + wObject.location.city + ", " + wObject.location.region + ", " + wObject.location.country;
    document.getElementById("weather-degrees").textContent = wObject.item.condition.temp + String.fromCharCode(8451);
    document.getElementById("weather-conditions").textContent = wObject.item.condition.text;
    document.getElementById("weather-icon").className = "wi large wi-yahoo-" + wObject.item.condition.code;
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function validateForm(e) {
    e.preventDefault();
    var x = document.forms["locSearch"]["locSearchBar"].value;
    applyWeather(searchWeather(x));
    return false;
}