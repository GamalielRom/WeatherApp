import React, { useState, useEffect } from "react";
import { getWeather, getForecast } from "../services/weatherApp";
import { saveSearch, getSearches, deleteSearch } from "../services/apiService";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";

const Weather: React.FC = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  const [forecast, setForecast] = useState<any[]>([]);
  useEffect(() => {
  loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const searches = await getSearches();
    setSearchHistory(searches);
  };

  const formatCityName = (city: string) => {
    return city.trim().replace(/\s+/g, "+"); 
  }

  const handleSearch = async () => {
    const data = await getWeather(city);
    setWeather(data);
    console.log(data);
    if (city.trim() === "") {
      alert("Please enter a city name.");
      return;
    }
    if (!data || data.cod === "404") {
      alert("City not found. Please check the spelling and try again.");
      return;
    }
    const forecastData = await getForecast(city);
    if (forecastData) {
      setForecast(forecastData.list.slice(0, 5));

    }
    if (data) {
      const coordinates = await getCoordinates(city);
      if (!coordinates) {
        alert("Unable to find the coordinates of the city");
        return;
      }  
      const searchData = {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        condition: data.weather[0].description,
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
      await saveSearch(searchData);
      loadSearchHistory();
      setMapCenter({ lat: coordinates.lat, lng: coordinates.lng });
    }
  };
  const handleDelete = async (id: number) => {
    await deleteSearch(id);
    const updatedHistory = await getSearches();
    setSearchHistory(updatedHistory);
    if (updatedHistory.length > 0) {
      setMapCenter({ lat: updatedHistory[0].lat, lng: updatedHistory[0].lng });
    } else {
      setMapCenter({ lat: 20, lng: 0 }); //If there is no searches the map would be at the center
    }
  };
  
  const getCoordinates = async (city: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${formatCityName(city)}&key=AIzaSyC_alAgzv1AEwvP8jQpyLnk_mtXLHdshpo`
      );
      const data = await response.json();
      if (data.status === "ZERO_RESULTS") {
        console.error("Cant find the result fot that city.");
        return null;
      }
  
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        console.error("The api dont have the correct values");
        return null;
      }
    } catch (error) {
      console.error("Error trying to find the google api:", error);
      return null;
    }
  };
  const handleLocationSearch = () => {
    console.log("boton clickeado")
    if ("geolocation" in navigator) {
      console.log("Geolocalizacion soportada")
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude, "Longitud", longitude);
          try {
            const weatherData = await getWeatherByCoordinates(latitude, longitude);
            console.log(weatherData);
            if (weatherData) {
              setWeather(weatherData);
              setCity(weatherData.name); 
            }
          } catch (error) {
            console.error("Error obteniendo el clima con ubicación:", error);
            alert("Cant display the weather please try again");
          }
        },
        (error) => {
          alert("The geolocation is denied or desactivated");
        }
      );
    } else {
      alert("This navegator do not support geolocation");
    }
  };
  
  // Ejemplo de función para obtener datos de clima por coordenadas
  const getWeatherByCoordinates = async (lat: number, lon: number) : Promise<any> => {
    if (!lat || !lon) {
      console.error("LThe coordinates are not defined:", lat, lon);
      return null;
    }
    try {
      console.log(`fetching weather for lat=${lat} and long: ${lon}`);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=31e32a4b6e7129124a6139aa191239ae`
      );
      console.log("respuesta del servidor", response.data);
      return response.data;
    } catch (error) {
      console.error("Error with the coordinates:", error);
      return null;
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Check the Weather</h2>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter a city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border p-2 w-full rounded-l-lg focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        {weather && (
          <div className="mt-6 p-4 bg-blue-100 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{weather.name}, {weather.sys.country}</h3>
            <p className="text-gray-700"> {weather.main.temp}°C</p>
            <p className="text-gray-700"> {weather.weather[0].description}</p>
          </div>
        )}
      </div>
      <div className="flex mt-4">
        <button
          onClick={handleLocationSearch}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Use my location
        </button>
      </div>
      
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-center mb-4">5-Day Forecast</h3>
        <ul>
        {searchHistory.length > 0 && forecast.length > 0 && (
       
          <ul>
            {forecast.map((day, index) => (
              <li key={index} className="p-2 border-b text-center">
                <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                <p> {day.main.temp}°C</p>
                <p> {day.weather[0].description}</p>
              </li>
            ))}
          </ul>
      )}
        </ul>
      </div>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-center mb-4">History</h3>
        <ul>
          {searchHistory.map((search) => (
            <li key={search.id} className="flex justify-between items-center p-2 border-b">
              <span>{search.city}, {search.country} - {search.temperature}°C</span>
              <button
                onClick={() => handleDelete(search.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"

              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mt-6">
      <h3 className="text-lg font-bold text-center mb-4">Map for the search history</h3>
      <LoadScript googleMapsApiKey="AIzaSyC_alAgzv1AEwvP8jQpyLnk_mtXLHdshpo">
      <GoogleMap
      mapContainerStyle={{ height: "400px", width: "100%" }}
      zoom={2}
      center={mapCenter} 
    >
      {searchHistory.map((search) => {
        if (search.lat && search.lng) {
          return (
            <Marker
              key={search.id}
              position={{ lat: search.lat, lng: search.lng }}
              title={`${search.city}, ${search.country}`}
            />
          );
        } else {
          console.warn(`Missing coordinates for: ${search.city}, ${search.country}`);
          return null;
        }
      })}
</GoogleMap>
      </LoadScript>
    </div>
    </div>
  );
};

export default Weather;