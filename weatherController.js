const axios = require('axios');

async function getWeatherData(city, apiKey) {
  try {
    // Make API request to retrieve current weather data
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Check if the API request for current weather was successful
    if (weatherResponse.status !== 200 || weatherData.cod !== 200) {
      throw new Error('Error making weather API request: ' + weatherData.message);
    }

    // Extract relevant information from the weather response
    const temperatureKelvin = weatherData.main.temp;
    const temperatureFahrenheit = Math.round((temperatureKelvin - 273.15) * 9/5 + 32);
    const humidity = weatherData.main.humidity;
    const weatherDescription = weatherData.weather[0].description;

    // Make API request to retrieve 5-day forecast data
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    const forecastResponse = await axios.get(forecastUrl);
    const forecastData = forecastResponse.data;

    // Check if the API request for forecast was successful
    if (forecastResponse.status !== 200 || forecastData.cod !== '200') {
      throw new Error('Error making forecast API request: ' + forecastData.message);
    }

    // Extract relevant information from the forecast response
    const forecast = forecastData.list.map(item => {
      return {
        dateTime: item.dt_txt,
        temperature: Math.round((item.main.temp - 273.15) * 9/5 + 32),
        weatherDescription: item.weather[0].description,
        weatherIcon: `http://openweathermap.org/img/w/${item.weather[0].icon}.png`
      };
    });

    // Return the weather data and forecast
    return {
      temperature: temperatureFahrenheit,
      humidity,
      weatherDescription,
      forecast
    };
  } catch (error) {
    throw new Error('Error retrieving weather data: ' + error.message);
  }
}

module.exports = {
  getWeatherData
};
