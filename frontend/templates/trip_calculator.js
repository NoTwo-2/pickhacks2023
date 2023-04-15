const apiKey = 'VmO1MFS235Hqbtt8vREynA';
const apiUrl = 'https://www.carboninterface.com/api/v1/';

// Do all of this on page load

function carbonRequest(api_dir) {
    const url = `${apiUrl}${api_dir}`;
    const options = {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    };
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

function populateList(listID, searchID, data) {
    const list = document.getElementById(listID);
    const search = document.getElementById(searchID);
    let listItems = new Map();

    data.forEach(element => {
        const option = document.createElement('option')
        option.value = element.data.attributes.name;
        listItems.set(element.data.attributes.name.toLowerCase(), element.data.id)
        list.appendChild(option);
    });

    search.addEventListener('input', () => {
        const searchTerm = search.value.toLowerCase();

        console.log(searchTerm)
        if (listItems.has(searchTerm)) {
            activateModels(listItems.get(searchTerm))
        }
    });
}

function activateModels(modelID) {
    console.log(modelID)
}

carbonRequest("vehicle_makes")
    .then(data => {
        populateList("make_list", "make_search", data)
    })
    .catch(error => {
        console.error('Request failed', error);
    })