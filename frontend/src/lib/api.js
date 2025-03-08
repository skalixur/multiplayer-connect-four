import axios from "axios"

const baseUrl = `/api`

export const API = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})
