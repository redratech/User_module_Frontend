import axios from "axios";

const API_URL = "https://user-module-backend.onrender.com/api/users";

export const createUserApi = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getUsersApi = async () => {
  const response = await axios.get(API_URL);

  return response.data;
};

export const updateUserApi = async (id, formData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteUserApi = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);

  return response.data;
};
