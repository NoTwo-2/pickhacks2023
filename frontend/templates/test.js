var map, originMarker, destMarker,originAutocomplete, destAutocomplete;;

function initMap() {
  // Create a map centered on the United States
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.8283, lng: -98.5795},
    zoom: 4
  });

originAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('origin'), {types: ['geocode']});
  destAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('destination'), {types: ['geocode']});
}

function calculateDistance() {
  var origin = document.getElementById('origin').value;
  var destination = document.getElementById('destination').value;
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.IMPERIAL,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status === 'OK') {
      var distance = response.rows[0].elements[0].distance.text;
      console.log(distance);
      var consoleDiv = document.getElementById("distance");
      consoleDiv.innerHTML += distance;

    } else {
      alert('Error: ' + status);
    }
  });
}
