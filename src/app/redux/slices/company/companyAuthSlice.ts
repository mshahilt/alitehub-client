import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, googleLogin } from "../../../../services/api/auth/authApi";
import axiosInstance from "../../../../services/api/userInstance";
import axios from "axios";

export interface Company {
  id: string;
  name: string;
  email: string;
  companyIdentifier: string;
  industry: string;
  companyType: string;
  contact: {
    phone?: string | null;
  };
  profile_picture?: string;
  locations?: string[] | null;
  isBlock: boolean;
  subscriptionDetails?: {
    _id: string;
    companyId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface CompanyAuthState {
  company: Company | null;
  loading: boolean 
  fetchedCompanyProfile: {
    data: Company | null;
    ownAcc: boolean;
    loading: boolean;
    error: string | null;
  };
  login: {
    loading: boolean;
    error: string | null;
  };
}

const initialState: CompanyAuthState = {
  company: null,
  loading: false,
  fetchedCompanyProfile: {
    data: null,
    ownAcc: false,
    loading: false,
    error: null
  },
  login: {
    loading: false,
    error: null
  }
};

export const fetchCompanyProfile = createAsyncThunk(
  "company/fetchProfile",
  async (companyIdentifier: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance(`/company/${companyIdentifier}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch company profile");
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const getCompany = createAsyncThunk(
  "company/getCompany",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/company/getCompany`);
      const companyData = {
        ...response.data.company,
        subscriptionDetails: response.data.subscriptionDetails || null
      };
      
      if (companyData.isBlock) {
        alert("Company blocked by admin");
        localStorage.removeItem("token");
        window.location.href = "/company/login";
        return rejectWithValue("Admin is blocked");
      }
      return companyData;
    } catch (error) {
      return rejectWithValue(axios.isAxiosError(error) ? error.response?.data : error);
    }
  }
);

export const updateCompanyProfilePicture = createAsyncThunk(
  'company/updateProfilePicture',
  async (imageFile: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await axiosInstance.post('/company/uploadProfileImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response) {
        throw new Error('Failed to upload image');
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      if (state.fetchedCompanyProfile.data) {
        (state.fetchedCompanyProfile.data[field] as any) = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.login.loading = true;
        state.loading = true; // Set company loading true
        state.login.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Company>) => {
        state.login.loading = false;
        state.loading = false; // Set company loading false
        state.company = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.login.loading = false;
        state.loading = false; // Set company loading false
        state.login.error = action.error.message || "Login failed";
      });

    builder
      .addCase(googleLogin.pending, (state) => {
        state.login.loading = true;
        state.loading = true; // Set company loading true
        state.login.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action: PayloadAction<Company>) => {
        state.login.loading = false;
        state.loading = false; // Set company loading false
        state.company = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.login.loading = false;
        state.loading = false; // Set company loading false
        state.login.error = action.error.message || "Google login failed";
      });

    builder
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.fetchedCompanyProfile.loading = true;
        state.fetchedCompanyProfile.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.fetchedCompanyProfile.loading = false;
        state.fetchedCompanyProfile.data = {
          ...action.payload.company,
          subscriptionDetails: action.payload.subscriptionDetails || null
        };
        state.fetchedCompanyProfile.ownAcc = action.payload.company.id === state.company?.id;
        state.fetchedCompanyProfile.error = null;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.fetchedCompanyProfile.loading = false;
        state.fetchedCompanyProfile.error = action.payload as string;
      });

    builder
      .addCase(getCompany.pending, (state) => {
        state.fetchedCompanyProfile.loading = true;
        state.loading = true; // Set company loading true
        state.fetchedCompanyProfile.error = null;
      })
      .addCase(getCompany.fulfilled, (state, action: PayloadAction<Company>) => {
        state.fetchedCompanyProfile.loading = false;
        state.loading = false; // Set company loading false
        state.company = action.payload;
        state.fetchedCompanyProfile.data = action.payload;
        state.fetchedCompanyProfile.ownAcc = true;
      })
      .addCase(getCompany.rejected, (state, action) => {
        state.fetchedCompanyProfile.loading = false;
        state.loading = false; // Set company loading false
        state.fetchedCompanyProfile.error = action.payload as string;
      });

    builder
      .addCase(updateCompanyProfilePicture.pending, (state) => {
        state.loading = true; // Set company loading true
      })
      .addCase(updateCompanyProfilePicture.fulfilled, (state, action) => {
        state.loading = false; // Set company loading false
        if (state.company) {
          state.company.profile_picture = action.payload.profileImage;
        }
        if (state.fetchedCompanyProfile.data) {
          state.fetchedCompanyProfile.data.profile_picture = action.payload.profileImage;
        }
      })
      .addCase(updateCompanyProfilePicture.rejected, (state) => {
        state.loading = false; // Set company loading false
      });
  }
});

export const { setCompanyFormData } = companyAuthSlice.actions;
export default companyAuthSlice.reducer;