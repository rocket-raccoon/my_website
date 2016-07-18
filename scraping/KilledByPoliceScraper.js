var cheerio = require('cheerio');
var request = require('request');
var phantom = require('phantom');
var fs = require("fs");
var _ = require("underscore");


var checkUnknown = function(field) {
    return field == undefined ? "Unknown": field;
};

var formatDate = function(date) {
    date = date.replace(/ *\([^)]*\) */g, "");
    date = date.replace(",", "");
    return date;
};

var formatGenderAndRace = function(genderAndRace) {
    genderAndRace = genderAndRace.split("/");
    gender = genderAndRace[0].trim();
    race = genderAndRace[1];
    return {
        "gender": checkUnknown(gender),
        "race": checkUnknown(race)
    }
};

var formatNameAndAge = function(nameAndAge) {
    nameAndAge = nameAndAge.replace(", Jr.", "").replace(", Sr.", "");
    nameAndAge = nameAndAge.split(",");
    var name = nameAndAge[0];
    var age = nameAndAge[1];
    if (undefined != age) {
        age = age.trim();
    }
    return {
        "name": checkUnknown(name),
        "age": checkUnknown(age)
    }
};

var scrapeData = function(html) {
    $ = cheerio.load(html);
    var data = [];
    var headers = ["Date", "State", "Gender", "Race", "Name", "Age", "Cause"];
    data.push(headers);
    var rows = $("tbody tr").slice(4);
    rows.each(function() {
        var firstColumn = $(this).find("td:first-child");
        var date = firstColumn.text();
        date = formatDate(date);
        var state = firstColumn.siblings().eq(0).text();
        var genderAndRace = firstColumn.siblings().eq(1).text();
        genderAndRace = formatGenderAndRace(genderAndRace);
        var gender = genderAndRace.gender;
        var race = genderAndRace.race;
        var nameAndAge = firstColumn.siblings().eq(2).text();
        nameAndAge = formatNameAndAge(nameAndAge);
        var name = nameAndAge.name;
        var age = nameAndAge.age;
        var cause = firstColumn.siblings().eq(3).text();
        data.push([date, state, gender, race, name, age, cause]);
    });
    return data;
};

var saveData = function(data) {
    data = _.map(data, function(row) { return row.join(); });
    data = data.join("\n");
    fs.writeFile("killed_by_police.csv", data);
};

var url = "http://killedbypolice.net/";
phantom.create(function(ph) {
  return ph.createPage(function(page) {
    return page.open(url, function(status) {
      console.log("opened google? ", status);
      return page.evaluate((function() {
        return document.documentElement.outerHTML;
      }), function(result) {
        var data = scrapeData(result);
        saveData(data);
        return ph.exit();
      });
    });
  });
});

