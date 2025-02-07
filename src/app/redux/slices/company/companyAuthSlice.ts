import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, register, generateOtp, googleLogin } from "../../../../services/api/auth/authApi";

export interface CompanyAuthState {
  company: {
    companyName: string;
    email: string;
    password: string;
  };
  loading: boolean;
  error: string | null;
}

const initialState: CompanyAuthState = {
  company: {
    companyName: "",
    email: "",
    password: "",
  },
  loading: false,
  error: null,
};

const companyAuthSlice = createSlice({
  name: "companyAuth",
  initialState,
  reducers: {
    setCompanyFormData: (
      state,
      action: PayloadAction<{ field: keyof CompanyAuthState["company"]; value: any }>
    ) => {
      const { field, value } = action.payload;
      state.company[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<CompanyAuthState["company"]>) => {
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
    builder.addCase(register.fulfilled, (state, action: PayloadAction<CompanyAuthState["company"]>) => {
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
    builder.addCase(googleLogin.fulfilled, (state, action: PayloadAction<CompanyAuthState["company"]>) => {
      state.loading = false;
      state.company = action.payload;
    });
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Google login failed";
    });
  },
});

export const { setCompanyFormData } = companyAuthSlice.actions;
export default companyAuthSlice.reducer;
