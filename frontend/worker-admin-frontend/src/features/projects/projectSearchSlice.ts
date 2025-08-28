import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../auth";
import {Project} from "./projectSlice";

interface ProjectSearchState {
  results: Project[];
  loading: boolean;
  error: string | null; // <-- allow string or null
}

const initialState: ProjectSearchState = {
  results: [],
  loading: false,
  error: null,
};

export const searchProjects = createAsyncThunk<
  Project[],
  string,
  { state: RootState; rejectValue: string }
>(
  "projectSearch/searchProjects",
  async (name, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/search/?name=${encodeURIComponent(name)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return rejectWithValue(err.response.data.detail);
      }
      return rejectWithValue("Something went wrong");
    }
  }
);

const projectSearchSlice = createSlice({
  name: "projectSearch",
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.results = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error searching projects"; // now type matches
      });
  },
});

export const { clearSearch } = projectSearchSlice.actions;
export default projectSearchSlice.reducer;
