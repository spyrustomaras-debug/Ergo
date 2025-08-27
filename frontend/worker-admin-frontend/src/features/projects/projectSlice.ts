import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { setAuthToken } from "../../api/axios";
import { RootState } from "../auth/index"; // Make sure your store is correctly typed

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  start_date?: string;   // new
  finish_date?: string;  // new
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

// Fetch all projects for the logged-in worker
export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { state: RootState; rejectValue: any }
>("projects/fetchProjects", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    setAuthToken(token || null); // Attach token to Axios
    const response = await axiosInstance.get("/projects/");
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch projects");
  }
});

// Create a new project
export const createProject = createAsyncThunk<
  Project,
  { name: string; description: string; start_date?: string; finish_date?: string },
  { state: RootState; rejectValue: any }
>(
  "projects/createProject",
  async (data, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      setAuthToken(token || null); 
      const response = await axiosInstance.post("/projects/", data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to create project");
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        // Handle object errors from DRF
        state.error = typeof action.payload === "string" ? action.payload : action.payload?.detail || "Error fetching projects";
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : action.payload?.detail || "Error creating project";
      });
  },
});

export default projectSlice.reducer;
