var map, originMarker, destMarker,originAutocomplete, destAutocomplete;;

async function initMap() {
  // Create a map centered on the United States
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.8283, lng: -98.5795},
    zoom: 4
  });
  const [{ Map }] = await Promise.all([google.maps.importLibrary("places")]);
  
  // Create the input HTML element, and append it
  const input = document.createElement("input");
  const pac = new google.maps.places.PlaceAutocompleteElement({
    inputElement: input,
    map: map,
  });

  document.body.appendChild(pac.element);
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

      // Create orgin and Destination markers for search term
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': origin }, function(results, status) {
        if (status === 'OK') {
          originMarker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            title: origin
          });
        } else {
          alert('Error: ' + status);
        }
      });

      geocoder.geocode({ 'address': destination }, function(results, status) {
        if (status === 'OK') {
          destMarker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            title: destination
          });
        } else {
          alert('Error: ' + status);
        }
      });

    } else {
      alert('Error: ' + status);
    }
  });
}
