import axios from "axios";

const API_URL = "http://localhost:5000"; // URL del backend

// Save the search
export const saveSearch = async (searchData: any) => {
  try {
    const response = await axios.post(`${API_URL}/searches`, searchData);
    return response.data;
  } catch (error) {
    console.error("Error trying to save the search:", error);
    return null;
  }
};

// Take all the saved searches
export const getSearches = async () => {
  try {
    const response = await axios.get(`${API_URL}/searches`);
    return response.data;
  } catch (error) {
    console.error("Error trying to fetch the searches:", error);
    return [];
  }
};

// Delete search byID
export const deleteSearch = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/searches/${id}`);
  } catch (error) {
    console.error("Error deleting the search:", error);
  }
};
