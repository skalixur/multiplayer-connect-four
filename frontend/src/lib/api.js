import axios from "axios"

const baseUrl = `${import.meta.env.VITE_API_URL}/api`

export const API = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})
