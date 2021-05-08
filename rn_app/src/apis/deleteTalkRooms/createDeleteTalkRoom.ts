import {
  axios,
  createAsyncThunk,
  rejectPayload,
  logoutAction,
  checkKeychain,
  requestLogin,
  handleBasicError,
  headers,
  origin,
} from '../re-modules';

export type CreateDeleteRoomThunkPayload = {
  talkRoomId: number;
};

export const createDeleteRoomThunk = createAsyncThunk<
  CreateDeleteRoomThunkPayload,
  {talkRoomId: number},
  {rejectValue: rejectPayload}
>(
  'deleteTalkRoom/createDeleteRoom',
  async ({talkRoomId}, {dispatch, rejectWithValue}) => {
    const credentials = await checkKeychain();

    if (credentials) {
      try {
        await axios.post(
          `${origin}/deleteTalkRooms?id=${credentials.id}`,
          {
            talkRoomId,
          },
          headers(credentials.token),
        );

        return {talkRoomId};
      } catch (e) {
        const result = handleBasicError({e, dispatch});
        return rejectWithValue(result);
      }
    } else {
      // credentials存在しないエラー
      requestLogin(() => dispatch(logoutAction));
      return rejectWithValue({errorType: 'loginError'});
    }
  },
);