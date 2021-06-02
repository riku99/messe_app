import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import {RootState} from '../index';
import {AnotherUser} from '../types';
import {updateAlreadyViewed} from '../helpers/createViewedFlashes';
import {
  getNearbyUsersThunk,
  GetNearbyUsersPayload,
} from '../../apis/nearbyUsers/getNearbyUsers';
import {
  createAlreadyViewdFlashThunk,
  CreateAlreadyViewdFlashThunkPayload,
} from '../../apis/flashes/createAlreadyViewedFlashes';

// NearbyUserは位置情報により取得したユーザーなので必ずlat, lngが存在する。AnotherUserはトーク相手とかも含まれるので位置情報のデータが必ず含まれるとは限らない
type NearbyUser = Omit<AnotherUser, 'lat' | 'lng'> & {lat: number; lng: number};
export type NearbyUsers = NearbyUser[];

// entityのユニークなプロパテがidの場合は指定する必要ない
// ソート方法もAPIから送られてきた通りなので指定しない
export const nearbyUsersAdapter = createEntityAdapter<AnotherUser>();

export type NearbyUsersState = ReturnType<
  typeof nearbyUsersAdapter.getInitialState
>;

const nearbyUsersSlice = createSlice({
  name: 'nearbyUsers',
  initialState: nearbyUsersAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [getNearbyUsersThunk.fulfilled.type]: (
      state,
      action: PayloadAction<GetNearbyUsersPayload>,
    ) => {
      nearbyUsersAdapter.setAll(state, action.payload);
    },
    [createAlreadyViewdFlashThunk.fulfilled.type]: (
      state,
      action: PayloadAction<CreateAlreadyViewdFlashThunkPayload>,
    ) => {
      updateAlreadyViewed(state, action, {slice: nearbyUsersSlice.name});
    },
  },
});

export const nearbyUsersReducer = nearbyUsersSlice.reducer;

export const nearbyUsersSelector = nearbyUsersAdapter.getSelectors();

export const selectNearbyUsersArray = (state: RootState) =>
  nearbyUsersSelector.selectAll(state.nearbyUsersReducer);

export const selectNearbyUser = (
  state: RootState,
  userId: string,
): AnotherUser | undefined =>
  nearbyUsersSelector.selectById(state.nearbyUsersReducer, userId);

export const selectNearbyUserAlreadyViewed = (
  state: RootState,
  userId: string,
) => {
  const user = nearbyUsersSelector.selectById(state.nearbyUsersReducer, userId);
  if (user) {
    return user.flashes.alreadyViewed;
  } else {
    return [];
  }
};
