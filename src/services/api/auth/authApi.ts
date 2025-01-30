import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../instance";

export const login = createAsyncThunk(
    "auth/login",
    async (credential: { email: string; password: string }, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.post("/auth/login", credential);
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
    async (credential: { email: string; password: string }, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.post("/auth/register", credential);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
})