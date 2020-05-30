// variables
var city = [];
var activeCity;

// start function
function start() {
    // local storage
    city = JSON.parse(localStorage.getItem("weathercities"));
        activeCity = city[city.length - 1];
        getCities();
        getCurrent(activeCity);
}

function getCities() {
  if (city) {
    $("#prevSearches").empty();

      var btns = $("<div>").attr("class", "list-group");

      for (var i = 0; i < city.length; i++) {
        var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(city[i]);
        if (city[i] == activeCity){
            locBtn.attr("class", "list-group-item list-group-item-action active");
        }
        else {
            locBtn.attr("class", "list-group-item list-group-item-action");
        }
        btns.prepend(locBtn);
      }
    $("#prevSearches").append(btns);
  }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=9a56741155b7713b4590dc11e5c0dcf3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        // main weather card 
        var mainCard = $("<div>").attr("class", "card bg-light");
        $("#forecast").append(mainCard);
        // main weather card row
        var cardRow = $("<div>").attr("class", "row no-gutters");
        mainCard.append(cardRow);
        // icon for weather conditions
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
        var imgDiv = $("<div>").attr("class", "col-md-3 bg-img").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);
        // additional card elements
        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        // city name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        // date
        var date = moment().format("LL");
        cardBody.append($("<p>").attr("class", "card-text").text(date));
        // temperature
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp.toFixed(0) + " &#8457;"));
        // humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        // wind speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed.toFixed(0) + " MPH"));

        // uv-index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=9a56741155b7713b4590dc11e5c0dcf3&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            // change uv bg color based upon value
            var uvindex = uvresponse.value.toFixed(0);
            var bgcolor;
            if (uvindex <= 2) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 5) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        fiveDay(response.id);
    });
}

function fiveDay(city) {
    // five day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=9a56741155b7713b4590dc11e5c0dcf3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(queryURL)
        console.log(response)
        // row for cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#forecast").append(newrow);
        // loop for 5 cards
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "five-cards");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("LL"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp.toFixed(0) + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    $("#forecast").empty();
}

function saveLoc(loc){
    // add this to the saved locations array
    if (city === null) {
        city = [loc];
    }
    else if (city.indexOf(loc) === -1) {
        city.push(loc);
    }
    // save array to local storage
    localStorage.setItem("weathercities", JSON.stringify(city));
    getCities();
}

$("#searchbtn").on("click", function (e) {
    e.preventDefault();
    // city input field
    var loc = $("#searchinput").val().trim();
    //if loc wasn't empty
    if (loc !== "") {
        //clear the previous forecast
        clear();
        activeCity = loc;
        saveLoc(loc);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    activeCity = $(this).text();
    getCities();
    getCurrent(activeCity);
});

start();