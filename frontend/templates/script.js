const apiKey = 'VmO1MFS235Hqbtt8vREynA';
const apiUrl = 'https://www.carboninterface.com/api/v1/';

const florida_result = document.getElementById('florida_result');
const elec_cal = document.getElementById('elec_cal');

elec_cal.addEventListener('click', getElecFl);

function getElecFl() {
  const url = `${apiUrl}estimates`;
  const options = {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  };
  
  fetch(url, options)
    .then(response => response.json())
    .then(data => {
      // Handle the API response here

      console.log(data);
      florida_result.textContent = `Carbon data: ${data[0].data.attributes.carbon_g}`;
      


    })
    .catch(error => {
      // Handle any errors that occur during the API request
      console.error(error);
    });
}
