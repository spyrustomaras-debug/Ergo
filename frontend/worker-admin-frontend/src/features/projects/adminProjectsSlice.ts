import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { setAuthToken } from "../../api/axios";
import { RootState } from "../auth"; // Adjust path to your auth slice

interface Project {
  id: number;
  worker: string;
  name: string;
  description: string;
  created_at: string;
}

interface AdminProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminProjectsState = {
  projects: [],
  loading: false,
  error: null,
};

// Fetch all projects for ADMIN
export const fetchAdminProjects = createAsyncThunk<
  Project[],
  void,
  { state: RootState; rejectValue: any }
>("adminProjects/fetchAdminProjects", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    setAuthToken(token || null); // attach token
    const response = await axiosInstance.get("/projects/"); 
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch admin projects");
  }
});

const adminProjectsSlice = createSlice({
  name: "adminProjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch admin projects
      .addCase(fetchAdminProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchAdminProjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.detail || "Error fetching admin projects";
      });
  },
});

export default adminProjectsSlice.reducer;
