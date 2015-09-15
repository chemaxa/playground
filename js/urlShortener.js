 function makeShort() {
     var longUrl = document.getElementById("longurl").value;
     var request = gapi.client.urlshortener.url.insert({
         'resource': {
             'longUrl': longUrl
         }
     });
     request.execute(function(response) {

         if (response.id != null) {
             str = "<b>Long URL:</b>" + longUrl + "<br>";
             str += "<b>Short URL:</b> <a href='" + response.id + "'>" + response.id + "</a><br>";
             document.getElementById("output").innerHTML = str;
         } else {
             console.log("error: creating short url", response);
         }

     });
 }

 function getShortInfo() {
     var shortUrl = document.getElementById("shorturl").value;

     var request = gapi.client.urlshortener.url.get({
         'shortUrl': shortUrl,
         'projection': 'FULL'
     });
     request.execute(function(response) {

         if (response.longUrl != null) {
             str = "<b>Long URL:</b>" + response.longUrl + "<br>";
             str += "<b>Create On:</b>" + response.created + "<br>";
             document.getElementById("output").innerHTML = str;
         } else {
             alert("error: unable to get URL information");
             console.log(response);
         }

     });

 }

 function load() {
     gapi.client.setApiKey('AIzaSyDrOBmP3938j35S8wZxVOVroXVa61c79qs'); //get your ownn Browser API KEY
     gapi.client.load('urlshortener', 'v1', function() {});

 }
 window.onload = load;
