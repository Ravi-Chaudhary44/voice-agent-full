import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_URL;


export const registerUser = async ({ fullName, email, password }) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/register`, {
      fullName,
      email,
      password,
    }, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("registerUser error:", err?.response?.data || err?.message || err);
    throw err;
  }
};


export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/login`, {
      email,
      password,
    }, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("loginUser error:", err?.response?.data || err?.message || err);
    throw err;
  }
};


export const googleAuth = async (code) => {
  try {
    return await axios.get(`${BASE_URL}/auth/google?code=${code}`);
  } catch (err) {
    console.error("googleAuth error:", err?.response?.data || err?.message || err);
    throw err;
  }
};


export const uploadFile = async (file) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${BASE_URL}/question/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (err) {
    console.error("uploadFile error:", err?.response?.data || err?.message || err);
    throw err;
  }
};
