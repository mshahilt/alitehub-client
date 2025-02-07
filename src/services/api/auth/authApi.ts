import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../userInstance";

export const login = createAsyncThunk(
    "auth/login",
    async (credential: { email: string; password: string }, {rejectWithValue}) => {
        try {
            console.log(credential)
            const response = await axiosInstance.post("/user/login", credential);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
})


export const register = createAsyncThunk(
    "auth/register",
    async (
        { userType, ...credential }: { 
            userType: "user" | "company"; 
            username: string; 
            name: string; 
            email: string; 
            password: string; 
        }, 
        { rejectWithValue }
    ) => {
        try {
            console.log(credential, `inside thunk register function for ${userType}`);
            const response = await axiosInstance.post(`/${userType}/register`, credential);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
    }
);

export const generateOtp = createAsyncThunk(
    "auth/generateOtp",
    async (email: string, { rejectWithValue }) => {
        try {
            console.log(email, "inside async thunk of generated otp");
            console.log("Sending request with:", { email });

            const response = await axiosInstance.post("/user/generateOtp", { email });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || "An error occurred");
            } else {
                return rejectWithValue("Something went wrong");
            }
        }
    }
);

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (token: string, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post("user/google-login", { token });
        return response.data;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Google login failed");
      }
    }
  );


// export const usernameCheck = createAsyncThunk(
//     "user/usernameCheck",
//     async(payload: {username:string}, {rejectWithValue}) =>{
//         try {
//             const response = await axiosInstance.post("/user/checkUsernameAvailability", payload.username);
//             console.log(response);
//         } catch (error) {
//             if (axios.isAxiosError(error) && error.response) {
//                 return rejectWithValue(error.response.data);
//             } else {
//                 return rejectWithValue(error);
//             }
//         }
//     }
// )