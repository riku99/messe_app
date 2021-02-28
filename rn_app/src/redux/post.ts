import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import {createPostAction, deletePostThunk} from '../actions/posts';
import {firstLoginThunk, sampleLogin} from '../actions/users';
import {logoutAction} from '../actions/sessions';
import {SuccessfullLoginData} from '../apis/usersApi';
import {RootState} from '.';

export type Post = {
  id: number;
  text: string;
  image: string;
  date: string;
  userId: number;
};

const postsAdaper = createEntityAdapter<Post>({
  selectId: (post) => post.id,
  sortComparer: (a, b) => b.id - a.id,
});

const postSlice = createSlice({
  name: 'post',
  initialState: postsAdaper.getInitialState(),
  reducers: {},
  extraReducers: {
    [sampleLogin.fulfilled.type]: (state, action) => {
      postsAdaper.addMany(state, action.payload.posts);
    },
    [logoutAction.type]: () => {
      return postsAdaper.getInitialState();
    },
    [firstLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<SuccessfullLoginData>,
    ) => {
      postsAdaper.addMany(state, action.payload.posts);
    },
    // ExceptionsManager.js:179 Invariant Violation: Module AppRegistry is not a registered callable moduleが解決できないので文字列で直接指定
    'users/subsequentLogin/fulfilled': (
      state,
      action: PayloadAction<SuccessfullLoginData>,
    ) => {
      postsAdaper.addMany(state, action.payload.posts);
    },
    [createPostAction.fulfilled.type]: (state, action: PayloadAction<Post>) => {
      postsAdaper.addOne(state, action.payload);
    },
    [deletePostThunk.fulfilled.type]: (
      state,
      action: PayloadAction<number>,
    ) => {
      postsAdaper.removeOne(state, action.payload);
    },
  },
});

const postsSlectors = postsAdaper.getSelectors();

export const selectAllPosts = (state: RootState) => {
  return postsSlectors.selectAll(state.postsReducer);
};

export const postsReducer = postSlice.reducer;