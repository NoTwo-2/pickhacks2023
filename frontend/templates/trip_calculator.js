const apiKey = 'VmO1MFS235Hqbtt8vREynA';
const apiUrl = 'https://www.carboninterface.com/api/v1/';

// Do all of this on page load

function getMakes() {
    const url = `${apiUrl}vehicle_makes`;
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
                console.log("fail")
                reject(error)
            })
    })
}

