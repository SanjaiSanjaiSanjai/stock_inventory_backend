import { API_BASE_URL } from "./axiosClient"


export const signupUser = async (userdata) => {
    return await API_BASE_URL.post('/signup',userdata)
}

export const loginUser = async (userdata) => {
    return await API_BASE_URL.post('/login',userdata)
}