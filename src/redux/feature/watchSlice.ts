import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@redux/store';
import { getAllGroups } from '@redux/Api/GroupApi';

export interface WatchState {
  groupsData: unknown[];
  loadingGroups: boolean;
}

const initialState: WatchState = {
  groupsData: [],
  loadingGroups: false,
};

type EnrichedGroup = {
  groupId: string;
  groupName: string;
  isMuted: boolean;
  members: unknown[];
  activities: unknown[];
  max_activities_cnt: number;
};

export const fetchWatchGroups = createAsyncThunk<
  EnrichedGroup[],
  void,
  { state: RootState; rejectValue: string }
>(
  'watch/fetchGroups',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth?.token;
    if (!token) return rejectWithValue('No token');
    try {
      const res = await getAllGroups(token);
      const results = Array.isArray(res?.results) ? res.results : [];
      const enriched = results
        .map((group: Record<string, unknown>) => {
          const groupId = (group?.group_id || group?.username) as string;
          if (!groupId) return null;
          return {
            groupId,
            groupName: (group?.name || group?.username || 'Unnamed Group') as string,
            isMuted: (group?.notification ?? false) as boolean,
            members: (group?.members || []) as unknown[],
            activities: (group?.activities || []) as unknown[],
            max_activities_cnt: (group?.max_activities_cnt || 0) as number,
          };
        })
        .filter(Boolean) as EnrichedGroup[];
      return enriched;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch groups';
      return rejectWithValue(msg);
    }
  }
);

const watchSlice = createSlice({
  name: 'watch',
  initialState,
  reducers: {
    updateGroupsAfterLeave(state, action) {
      const groupIdsToRemove = action.payload as string[];
      if (groupIdsToRemove?.length) {
        state.groupsData = (state.groupsData as { groupId?: string }[]).filter(
          g => !groupIdsToRemove.includes(g?.groupId ?? '')
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchGroups.pending, state => {
        state.loadingGroups = true;
      })
      .addCase(fetchWatchGroups.fulfilled, (state, action) => {
        state.loadingGroups = false;
        state.groupsData = action.payload ?? [];
      })
      .addCase(fetchWatchGroups.rejected, state => {
        state.loadingGroups = false;
      });
  },
});

export const { updateGroupsAfterLeave } = watchSlice.actions;
export default watchSlice.reducer;
