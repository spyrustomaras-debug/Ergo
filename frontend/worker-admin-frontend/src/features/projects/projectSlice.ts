import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance, { setAuthToken } from "../../api/axios";
import { RootState } from "../auth/index";

export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  start_date?: string;
  finish_date?: string;
  status: ProjectStatus;
  latitude?: number | null;   // ✅ new
  longitude?: number | null;  // ✅ new
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

// Fetch all projects
export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { state: RootState; rejectValue: any }
>("projects/fetchProjects", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.accessToken;
    setAuthToken(token || null);
    const response = await axiosInstance.get("/projects/");
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch projects");
  }
});

export const createProject = createAsyncThunk<
  Project,
  { 
    name: string; 
    description: string; 
    start_date?: string; 
    finish_date?: string;
    latitude?: number | null;
    longitude?: number | null;
  },
  { state: RootState; rejectValue: any }
>(
  "projects/createProject",
  async (data, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      if (!token) throw new Error("No access token available");

      // Set token in axios instance
      setAuthToken(token);

      // Only include latitude/longitude if valid numbers
      const payload: any = {
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        finish_date: data.finish_date,
      };
      console.log(payload)
      if (typeof data.latitude === "number") payload.latitude = data.latitude;
      if (typeof data.longitude === "number") payload.longitude = data.longitude;
      console.log(payload)
      const response = await axiosInstance.post("/projects/", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to create project");
    }
  }
);




// Update project status
// projectSlice.ts

export const updateProjectStatus = createAsyncThunk<
  Project,
  { id: number; status: "IN_PROGRESS" | "COMPLETED" },
  { state: RootState; rejectValue: any }
>(
  "projects/updateStatus",
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      setAuthToken(token || null); // attaches Authorization: Bearer <token>
      const response = await axiosInstance.patch(`/projects/${id}/update_status/`, {
        status, // ✅ payload matches your curl
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to update project status");
    }
  }
);


const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : action.payload?.detail || "Error fetching projects";
      })
      // create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : action.payload?.detail || "Error creating project";
      })
      // update status
      .addCase(updateProjectStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.projects = state.projects.map((proj) =>
          proj.id === action.payload.id ? action.payload : proj
        );
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : action.payload?.detail || "Error updating status";
      });
  },
});

export default projectSlice.reducer;
