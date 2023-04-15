var map, originMarker, destMarker;

function initMap() {
  // Create a map centered on the United States
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.8283, lng: -98.5795},
    zoom: 4
  });
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
      alert('Distance between origin and destination: ' + distance);
    } else {
      alert('Error: ' + status);
    }
  });
}
