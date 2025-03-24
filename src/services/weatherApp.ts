import axios from "axios";

const API_KEY = "31e32a4b6e7129124a6139aa191239ae"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const getWeather = async (city: string) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric", // Puedes cambiar a 'imperial' si prefieres °F
        lang: "en",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo el clima:", error);
    return null;
  }
};
export const getForecast = async (city: string) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
        lang: "en",
      },
    });

    console.log("Forecast API Response:", response.data); // 🔹 Verificar qué devuelve
    return response.data;
  } catch (error) {
    return null;
  }
};