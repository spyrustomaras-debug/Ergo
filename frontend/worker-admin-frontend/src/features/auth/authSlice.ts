import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Worker registration
export const registerWorker = createAsyncThunk(
  "auth/registerWorker",
  async (data: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/register/worker/", data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (data: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login/", data);
      return response.data; // contains access, refresh, user
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    // Register Worker
    builder.addCase(registerWorker.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(registerWorker.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; });
    builder.addCase(registerWorker.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // Login
    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
