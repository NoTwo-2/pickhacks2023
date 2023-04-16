let map, dRenderer, originAutocomplete, destAutocomplete;;
let globalDistance

// TODO: SECRET HERE, DESTROY!!!
const apiKey = "VmO1MFS235Hqbtt8vREynA"
const apiUrl = 'https://www.carboninterface.com/api/v1/';

async function initMap() {
  const [{ Map }] = await Promise.all([google.maps.importLibrary("places")]);
  // Create a map centered on the United States
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.8283, lng: -98.5795},
    zoom: 4
  });
  
  // Create the input HTML element, and append it
  // const input = document.createElement("input");
  // const pac = new google.maps.places.PlaceAutocompleteElement({
  //   inputElement: input,
  //   map: map,
  // });

  // document.body.appendChild(pac.element);
}

// this function does an api request to the carbon interface
function carbonRequest(api_dir, vehicleID="", miles=0) {
  // define constants
  const url = `${apiUrl}${api_dir}`;
  let options = {};
  // if we are not getting estimates, we can send a general request and edit the url directly
  if (api_dir != "estimates") {
    options = {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
    };
  }
  // if we are getting estimates, we must construct a proper json block
  else if (api_dir == "estimates") {
    options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "vehicle",
        distance_unit: "mi",
        distance_value: miles,
        vehicle_model_id: vehicleID
      })
    };
  }
  // use a promise to allow the api request to run
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        resolve(data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

function calculateDistance() {
  var origin = document.getElementById('origin').value;
  var destination = document.getElementById('destination').value;
  var service = new google.maps.DistanceMatrixService();
  var dService = new google.maps.DirectionsService();

  // this will get the distance between the origin and destination
  service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.IMPERIAL,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status === 'OK') {
      var distance = response.rows[0].elements[0].distance.value * 0.000621371192;
      globalDistance = distance
      console.log(distance);
      distanceText = `${distance.toFixed(2)} miles`
      var top = document.getElementById("distance");
      var bottom = document.getElementById("distance_l");
      top.innerHTML = `${distance.toFixed(2)} miles`;
      bottom.innerHTML = `${distance.toFixed(2)} miles`;

      // activate the transportation divs
      enableMakeDiv()

    } else {
      alert('Error: ' + status);
    }

  // this will get the route google uses to get the distance data
  dService.route({
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING'
  }, function(result, status) {
    if (status == 'OK') {
      console.log(dRenderer)
      // remove the old renderer
      if (dRenderer) {
        dRenderer.setMap(null)
        dRenderer = null
        console.log(dRenderer)
      }
      // create a new renderer
      dRenderer = new google.maps.DirectionsRenderer();
      dRenderer.setMap(map)
      // display the polyline representing the direction
      dRenderer.setDirections(result);
    } else {
      alert('Error: ' + status);
    }
  })
  });
}

// this function will make an api request for the make info
// and display the make search/input box
function enableMakeDiv() {
  const make = document.getElementById("make")
  const makeList = document.getElementById("make_list")
  const makeSearch = document.getElementById("make_search")

  // clear data from these (so they are fresh)
  makeList.innerHTML = ''
  makeSearch.value = ''
  make.style.display = "block"

  // make a carbon api request for make info...
  carbonRequest("vehicle_makes")
    .then(data => {
      // create a dictionary to hold mappings of make names to their ids
      let makeListItems = new Map();

      // we want to propigate the data into the datalist
      data.forEach(element => {
        // create a new option to put in the datalist "make_list"
        const option = document.createElement('option')
        option.value = element.data.attributes.name;
        // put the mapping of the name to the id in the dictionary for easy lookup
        makeListItems.set(element.data.attributes.name.toLowerCase(), element.data.id)
        // add the option to the datalist "make_list"
        makeList.appendChild(option);
      });

      // listen for if the user changes the value of the input box
      makeSearch.addEventListener('input', () => {
        // get what the user inputted
        const searchTerm = makeSearch.value.toLowerCase();

        console.log(searchTerm)
        // check if what the user inputted is a valid item
        if (makeListItems.has(searchTerm)) {
          // activate models
          enableModelDiv(makeListItems.get(searchTerm));
        }
        else {
          disableDiv("model");
          disableDiv("year");
          disableDiv("generate")
          disableDiv("usr_box")
          disableDiv("bad_box")
          disableDiv("okay_box")
          disableDiv("good_box")
          disableDiv("facts")
        }
      })
    })
    .catch(error => {
      console.error('Make request failed', error);
    })
}

// this function will make an api request for the model info
// and display the model search/input box
function enableModelDiv(makeID) {
  const model = document.getElementById("model")
  const modelList = document.getElementById("model_list")
  const modelSearch = document.getElementById("model_search")

  // clear data from these (so they are fresh)
  modelList.innerHTML = ''
  modelSearch.value = ''
  model.style.display = "block"

  // make a carbon api request for model info...
  carbonRequest(`vehicle_makes/${makeID}/vehicle_models`)
    .then(data => {
      // this is a dictionary to hold models with model names as keys
      // and as values, a dictionary that stores years as keys and the corresponding id as values
      // EX: { "Elantra" : { 1993 : 352153215, 2023 : 53132532153 }, Corrola : { 1993 : 132453210 } }
      let modelDict = new Map();

      // for each data element
      data.forEach(element => {
        const modelName = element.data.attributes.name
        const modelYear = element.data.attributes.year
        const modelID = element.data.id
        // if the model does not exist in the model dictionary... 
        if (!modelDict.has(modelName.toLowerCase())) {
          // create a new year to id dictionary
          let yearToID = new Map();
          // add the year and id info to the dictionary
          yearToID.set(modelYear, modelID);
          // add the name and dictionary to the model dictionary
          modelDict.set(modelName.toLowerCase(), yearToID);

          // add the option for the model to the models datalist
          const option = document.createElement('option');
          option.value = modelName;
          modelList.appendChild(option);
        }
        // if the model is in the dictionary, but the year is not...
        else if (!modelDict.get(modelName.toLowerCase()).has(modelYear)) {
          // add the year and id pair
          modelDict.get(modelName.toLowerCase()).set(modelYear, modelID);
        }
      });

      console.log(modelDict);

      // listen for if the user changes the inputs
      modelSearch.addEventListener('input', () => {
        // get what the user inputted
        const searchTerm = modelSearch.value.toLowerCase();

        console.log(searchTerm)
        // check if what the user inputted is a valid item
        if (modelDict.has(searchTerm)) {
          // populate years
          activateYears(modelDict.get(searchTerm));
        }
        else {
          disableDiv("year");
          disableDiv("generate")
          disableDiv("usr_box")
          disableDiv("bad_box")
          disableDiv("okay_box")
          disableDiv("good_box")
          disableDiv("facts")
        }
      });
    })
    .catch(error => {
      console.error('Model request failed', error)
    })
}

// this function doesnt make an api request
// and instead just displays the years information
function activateYears(yearToIDMap) {
  const year = document.getElementById("year")
  const yearList = document.getElementById("year_list")
  const yearSearch = document.getElementById("year_search")

  // clear data from these (so they are fresh)
  yearList.innerHTML = ''
  yearSearch.value = ''
  year.style.display = "block"

  // for each element in the json data we are given
  yearToIDMap.forEach(function(value, key, map) {
    // create a new option to put in the datalist "make_list"
    const option = document.createElement('option')
    option.value = key;
    // add the option to the datalist "make_list"
    yearList.appendChild(option);
  });

  console.log(yearToIDMap)

  // listen for if the user changes the inputs
  yearSearch.addEventListener('input', () => {
    // get what the user inputted
    const searchTerm = parseInt(yearSearch.value);
    // check if what the user inputted is a valid item
    if (yearToIDMap.has(searchTerm)) {
      console.log(searchTerm);
      // run the carbon estimate for the vehicle id
      const generateButton = document.getElementById("gen_button");
      document.getElementById("generate").style.display = "block";
      generateButton.onclick = function() { 
        runCarbonEstimate(yearToIDMap.get(searchTerm));
      };
    }
    else {
      disableDiv("generate")
      disableDiv("usr_box")
      disableDiv("bad_box")
      disableDiv("okay_box")
      disableDiv("good_box")
      disableDiv("facts")
    }
  });
}

// this sends an api request for the carbon estimates for the user car
// as well as other benchmark cars
function runCarbonEstimate(vehicleID) {
  const badID = "f322bdd2-b120-484f-8609-4a3846e6ca12";
  const okayID = "9a7f2c35-f65e-4569-a897-1d5fd92beaa3";
  const goodID = "fbb36834-899e-4d90-b1f1-b067918e6ed7";

  const factContainer = document.getElementById("facts")

  carbonRequest('estimates', vehicleID, globalDistance)
    .then(data => {
      showCarBox(data, "usr_box", "usr_car_make", "usr_car_model", "usr_car_year", "usr_co2")
      carbonMT = data.data.attributes.carbon_mt
      // shows a few fun facts
      showFacts(carbonMT, "lbs_of_coal", 1119.820828667413)
      showFacts(carbonMT, "phones_charged", 121654.501216545)
      showFacts(carbonMT, "acres_of_forest", 4.333333333333333)
      showFacts(carbonMT, "bags_recycled", 43.29004329004329)

      factContainer.style.display = "flex"
    })
    .catch(error => {
      console.error('Estimate request failed', error)
    })

  carbonRequest('estimates', badID, globalDistance)
    .then(data => {
      showCarBox(data, "bad_box", "bad_make", "bad_model", "bad_year", "bad_co2")
    })
    .catch(error => {
      console.error('Estimate request failed', error)
    })

  carbonRequest('estimates', okayID, globalDistance)
    .then(data => {
      showCarBox(data, "okay_box", "okay_make", "okay_model", "okay_year", "okay_co2")
    })
    .catch(error => {
      console.error('Estimate request failed', error)
    })
  
  carbonRequest('estimates', goodID, globalDistance)
    .then(data => {
      showCarBox(data, "good_box", "good_make", "good_model", "good_year", "good_co2")
      // automatically scroll down when done generating
      document.getElementById("distance_l").scrollIntoView(true)
    })
    .catch(error => {
      console.error('Estimate request failed', error)
    })
}

function showCarBox(data, boxID, makeID, modelID, yearID, carbonID) {
  const carBox = document.getElementById(boxID)
  const carMake = document.getElementById(makeID)
  const carModel = document.getElementById(modelID)
  const carYear = document.getElementById(yearID)
  const carCarbon = document.getElementById(carbonID)

  carMake.innerHTML = data.data.attributes.vehicle_make
  carModel.innerHTML = data.data.attributes.vehicle_model
  carYear.innerHTML = data.data.attributes.vehicle_year
  carCarbon.innerHTML = data.data.attributes.carbon_lb

  // show the box
  carBox.style.display = "block"
}

// this disables a div in the html file
function disableDiv(divName) {
  const div = document.getElementById(divName)
  div.style.display = "none"
}

function showFacts(carbon, factID, multiplier) {
  const factVal = document.getElementById(factID)

  // black magic
  let float = (carbon * multiplier)
  let int = float.toFixed(0)
  let len = int.length
  if (len > 3) { len = 3 }
  else if (int == 0) { len = 0 }
  factVal.innerHTML = float.toFixed(3 - len)
}

initMap();