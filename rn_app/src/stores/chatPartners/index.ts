import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import {AnotherUser, ReceivedMessageData} from '../types';
import {RootState} from '../index';
import {receiveMessage} from '../messages';
import {User} from '../user';
import {updateAlreadyViewed} from '../helpers/createAlreadyViewedFlash';
import {refreshUser} from '../helpers/refreshUser';
import {
  sessionLoginThunk,
  SessionLoginThunkPayload,
} from '../../actions/session/sessionLogin';
import {
  firstLoginThunk,
  FirstLoginThunkPayload,
} from '../../actions/session/firstLogin';
import {
  sampleLogin,
  SampleLoginThunkPayload,
} from '../../actions/session/sampleLogin';
import {
  getNearbyUsersThunk,
  GetNearbyUsersPayload,
} from '../../actions/nearbyUsers/getNearbyUsers';
import {refreshUserThunk} from '../../actions/user/refreshUser';
import {logoutAction} from '../../actions/session/logout';
import {
  createRoomThunk,
  CreateRoomThunkPayload,
} from '../../actions/rooms/createRoom';
import {
  createAlreadyViewdFlashThunk,
  CreateAlreadyViewdFlashThunkPayload,
} from '../../actions/flashes/createAlreadyViewedFlash';

export const chatPartnersAdapter = createEntityAdapter<AnotherUser>({});

export type ChatPartnersState = ReturnType<
  typeof chatPartnersAdapter.getInitialState
>;

export const chatPartnersSlice = createSlice({
  name: 'chatPartners',
  initialState: chatPartnersAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [sampleLogin.fulfilled.type]: (
      state,
      action: PayloadAction<SampleLoginThunkPayload>,
    ) => chatPartnersAdapter.setAll(state, action.payload.chatPartners),
    [logoutAction.type]: () => {
      chatPartnersAdapter.getInitialState();
    },
    [firstLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<FirstLoginThunkPayload>,
    ) => chatPartnersAdapter.setAll(state, action.payload.chatPartners),
    [sessionLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<SessionLoginThunkPayload>,
    ) => chatPartnersAdapter.setAll(state, action.payload.chatPartners),
    [createRoomThunk.fulfilled.type]: (
      state,
      action: PayloadAction<CreateRoomThunkPayload>,
    ) => {
      if (!action.payload.presence) {
        chatPartnersAdapter.addOne(state, action.payload.partner);
      }
    },
    [receiveMessage.type]: (
      state,
      action: PayloadAction<ReceivedMessageData>,
    ) => {
      chatPartnersAdapter.upsertOne(state, action.payload.sender);
    },
    [refreshUserThunk.fulfilled.type]: (
      state,
      action: PayloadAction<
        {isMyData: true; data: User} | {isMyData: false; data: AnotherUser}
      >,
    ) => {
      refreshUser({
        slice: chatPartnersSlice.name,
        state,
        action,
      });
    },
    [createAlreadyViewdFlashThunk.fulfilled.type]: (
      state,
      action: PayloadAction<CreateAlreadyViewdFlashThunkPayload>,
    ) => {
      updateAlreadyViewed(state, action, {slice: chatPartnersSlice.name});
    },
    [getNearbyUsersThunk.fulfilled.type]: (
      state,
      action: PayloadAction<GetNearbyUsersPayload>,
    ) => {
      const result = action.payload;
      const forUpdateArray: {id: number; changes: AnotherUser}[] = [];
      const ids = selectIds(state);
      ids.forEach((n) => {
        const target = result.find((data) => data.id === n);
        if (target) {
          const updateObj = {id: target.id, changes: target};
          forUpdateArray.push(updateObj);
        }
      });
      chatPartnersAdapter.updateMany(state, forUpdateArray);
    },
  },
});

const chatPartnersSelector = chatPartnersAdapter.getSelectors();

export type ReturnTypeOfSelectChatPartnerEntities = ReturnType<
  typeof selectChatPartnerEntities
>;
export const selectChatPartnerEntities = (state: RootState) => {
  return chatPartnersSelector.selectEntities(state.chatPartnersReducer);
};

export const selectChatPartner = (state: RootState, partnerId: number) => {
  return chatPartnersSelector.selectById(state.chatPartnersReducer, partnerId);
};

export const selectChatPartnerAlreadyViewed = (
  state: RootState,
  userId: number,
) => {
  const user = chatPartnersSelector.selectById(
    state.chatPartnersReducer,
    userId,
  );
  if (user) {
    return user.flashes.alreadyViewed;
  } else {
    // ユーザーがいない場合はそもそもselectChatPartnerAlreadyViewedが実行されない
    // なのでこのブロックが実行されることは基本的にない
    return [];
  }
};

const selectIds = (state: RootState['chatPartnersReducer']) =>
  chatPartnersSelector.selectIds(state);

export const chatPartnersReducer = chatPartnersSlice.reducer;