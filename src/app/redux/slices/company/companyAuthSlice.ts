import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register, generateOtp, googleLogin } from "../../../../services/api/auth/authApi";
import axiosInstance from "../../../../services/api/userInstance";
import axios from "axios";

export interface Company {
  name: string;
  email: string;
  industry: string;
  companyType: string;
  companyIdentifier: string;
  contact?: {
    phone?: string | null;
  };
  profile_picture?: string | null;
  locations?: string[] | null;
}

export interface CompanyAuthState {
  company: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyAuthState = {
  company: {
    name: "",
    email: "",
    industry: "",
    companyType: "",
    companyIdentifier: "",
    contact: {
      phone: null
    },
    profile_picture:null,
    locations: null
  },
  loading: false,
  error: null
};

export const fetchCompanyProfile = createAsyncThunk(
  "company/fetchProfile",
  async (companyIdentifier: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance(`/company/${companyIdentifier}`);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch company profile");
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const getCompany = createAsyncThunk<Company>(
  "company/getCompany",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/company/getCompany`);
      console.log("from getcompany",response.data);
      return response.data.company;
    } catch (error) {
      return rejectWithValue(axios.isAxiosError(error) ? error.response?.data : error);
    }
  }
);

const companyAuthSlice = createSlice({
  name: "companyAuth",
  initialState,
  reducers: {
    setCompanyFormData: (
      state,
      action: PayloadAction<{ field: keyof Company; value: any }>
    ) => {
      const { field, value } = action.payload;
      if (state.company) {
        state.company[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.company = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Login failed";
    });

    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.company = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Registration failed";
    });

    builder.addCase(generateOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(generateOtp.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(generateOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === "string" ? action.payload : "OTP generation failed";
    });

    builder.addCase(googleLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleLogin.fulfilled, (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.company = action.payload;
    });
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Google login failed";
    });
    builder.addCase(fetchCompanyProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
    builder.addCase(fetchCompanyProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.company = action.payload;
            state.error = null;
          })
    builder.addCase(fetchCompanyProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          })
    builder.addCase(getCompany.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCompany.fulfilled, (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.company = action.payload;
    });
    builder.addCase(getCompany.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setCompanyFormData } = companyAuthSlice.actions;
export default companyAuthSlice.reducer;
