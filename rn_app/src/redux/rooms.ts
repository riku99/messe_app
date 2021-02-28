import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import {RootState} from './index';
import {AnotherUser} from './types';
import {createRoomThunk} from '../actions/rooms';
import {
  subsequentLoginThunk,
  firstLoginThunk,
  sampleLogin,
} from '../actions/users';
import {logoutAction} from '../actions/sessions';
import {createMessageThunk} from '../actions/messages';
import {Message, receiveMessage} from '../redux/messages';
import {SuccessfullLoginData} from '../apis/usersApi';

export type Room = {
  id: number;
  partner: number;
  timestamp: string;
  messages: number[];
  unreadNumber: number;
  latestMessage: string | null;
};

const roomsAdapter = createEntityAdapter<Room>({
  selectId: (room) => room.id,
  sortComparer: (a, b) =>
    new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1, // 更新日時を基準に降順
});

export const RoomsSlice = createSlice({
  name: 'rooms',
  initialState: roomsAdapter.getInitialState(),
  reducers: {
    resetUnreadNumber: (state, actions: PayloadAction<{roomId: number}>) => {
      roomsAdapter.updateOne(state, {
        id: actions.payload.roomId,
        changes: {
          unreadNumber: 0,
        },
      });
    },
  },
  extraReducers: {
    [sampleLogin.fulfilled.type]: (state, action) => {
      roomsAdapter.addMany(state, action.payload.rooms);
    },
    [logoutAction.type]: () => {
      return roomsAdapter.getInitialState();
    },
    [firstLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<SuccessfullLoginData>,
    ) => {
      roomsAdapter.addMany(state, action.payload.rooms);
    },
    [subsequentLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<SuccessfullLoginData>,
    ) => {
      roomsAdapter.addMany(state, action.payload.rooms);
    },
    [createRoomThunk.fulfilled.type]: (
      state,
      action: PayloadAction<{
        presence: boolean;
        roomId: number;
        partner: AnotherUser;
        timestamp: string;
      }>,
    ) => {
      // const room = state.entities[action.payload.roomId];
      // roomが存在する場合は何もしなくていい。upsertOneの必要ない
      // なかったら新しくaddする。messageとunreadNumberとlatestMessageはなしで。
      if (!action.payload.presence) {
        const data = action.payload;
        roomsAdapter.addOne(state, {
          id: data.roomId,
          partner: data.partner.id,
          timestamp: data.timestamp,
          messages: [],
          unreadNumber: 0,
          latestMessage: null,
        });
      }
    },
    [createMessageThunk.fulfilled.type]: (
      state,
      action: PayloadAction<{message: Message; roomId: number}>,
    ) => {
      const relatedRoom = state.entities[action.payload.roomId];
      if (relatedRoom) {
        roomsAdapter.updateOne(state, {
          id: action.payload.roomId,
          changes: {
            messages: [action.payload.message.id, ...relatedRoom.messages],
            timestamp: action.payload.message.timestamp,
            latestMessage: action.payload.message.text,
          },
        });
      }
    },
    [receiveMessage.type]: (
      state,
      action: PayloadAction<{room: Room; message: Message}>,
    ) => {
      roomsAdapter.upsertOne(state, action.payload.room);
    },
  },
});

export const {resetUnreadNumber} = RoomsSlice.actions;

export const roomSelectors = roomsAdapter.getSelectors();

export const selectRoom = (state: RootState, roomId: number) => {
  return roomSelectors.selectById(state.roomsReducer, roomId);
};

export const selectAllRooms = (state: RootState) => {
  return roomSelectors.selectAll(state.roomsReducer);
};

export const getAllUnreadMessagesNumber = (state: RootState) => {
  const rooms = selectAllRooms(state);
  let allunreadMessagesNumber = 0;
  for (let room of rooms) {
    allunreadMessagesNumber! += room.unreadNumber;
  }
  return allunreadMessagesNumber;
};

export const selectPartner = (state: RootState, roomId: number) => {
  const user = roomSelectors.selectById(state.roomsReducer, roomId)?.partner;
  if (user) {
    return user;
  } else {
    throw new Error();
  }
};

export const roomsReducer = RoomsSlice.reducer;