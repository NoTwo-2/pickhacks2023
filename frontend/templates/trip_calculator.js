const apiKey = 'VmO1MFS235Hqbtt8vREynA';
const apiUrl = 'https://www.carboninterface.com/api/v1/';

// Function to request data from the carbon api
function carbonRequest(api_dir) {
    // define constants
    const url = `${apiUrl}${api_dir}`;
    const options = {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    };
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

// this function populates the car makes list used by the input "make_search"
function populateMakes(data) {
    // define html elements
    const list = document.getElementById("make_list");
    const search = document.getElementById("make_search");
    // create a dictionary to hold mappings of make names to their ids
    let listItems = new Map();

    // for each element in the json data we are given
    data.forEach(element => {
        // create a new option to put in the datalist "make_list"
        const option = document.createElement('option')
        option.value = element.data.attributes.name;
        // put the mapping of the name to the id in the dictionary for easy lookup
        listItems.set(element.data.attributes.name.toLowerCase(), element.data.id)
        // add the option to the datalist "make_list"
        list.appendChild(option);
    });

    // enable the input box
    search.disabled = false

    // listen for if the user changes the value of the input box
    search.addEventListener('input', () => {
        // get what the user inputted
        const searchTerm = search.value.toLowerCase();

        console.log(searchTerm)
        // check if what the user inputted is a valid item
        if (listItems.has(searchTerm)) {
            // activate models
            activateModels(listItems.get(searchTerm));
        }
        else {
            deactivateModels();
        }
    });
}

// this function populates the car models list used by the input "model_search"
function populateModels(data) {
    // define html elements
    const modelList = document.getElementById("model_list");
    const search = document.getElementById("model_search");
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
            yearToID.set(modelYear, modelID)
            // add the name and dictionary to the model dictionary
            modelDict.set(modelName.toLowerCase(), yearToID)

            // add the option for the model to the models datalist
            const option = document.createElement('option')
            option.value = modelName;
            modelList.appendChild(option)
        }
        // if the model is in the dictionary, but the year is not...
        else if (!modelDict.get(modelName.toLowerCase()).has(modelYear)) {
            // add the year and id pair
            modelDict.get(modelName.toLowerCase()).set(modelYear, modelID)
        }

        search.disabled = false
    });
    console.log(modelDict)

    // listen for if the user changes the inputs
    search.addEventListener('input', () => {
        // get what the user inputted
        const searchTerm = search.value.toLowerCase();

        console.log(searchTerm)
        // check if what the user inputted is a valid item
        if (modelDict.has(searchTerm)) {
            // populate years
            populateYears(modelDict.get(searchTerm));
        }
        else {
            depopulateYears();
        }
    });
}

// unlike the other populate functions, this one takes in a map directly
// without having to parse through json data
function populateYears(yearMap) {

}

function activateModels(makeID) {
    carbonRequest(`vehicle_makes/${makeID}/vehicle_models`)
        .then(data => {
            populateModels(data)
        })
        .catch(error => {
            console.error('Model request failed', error)
        })
}

function deactivateModels() {
    const list = document.getElementById("model_list");
    const search = document.getElementById("model_search");

    list.innerHTML = '';
    search.disabled = true
}

// function depopulateYears() {
//     const list = document.getElementById("model_list");
//     const search = document.getElementById("model_search");

//     list.innerHTML = '';
//     search.disabled = true
// }

carbonRequest("vehicle_makes")
    .then(data => {
        populateMakes(data)
    })
    .catch(error => {
        console.error('Make request failed', error);
    })