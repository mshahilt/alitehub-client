import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../userInstance";

export const fetchUser = createAsyncThunk(
    "user/fetchUser",
    async (_, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get("/user");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error);
            }
        }
});