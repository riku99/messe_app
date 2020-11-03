import {createAsyncThunk} from '@reduxjs/toolkit';

import {sendPost, deletePost} from '../apis/posts_api';
import {checkKeychain} from '../helpers/keychain';
import {requestLogin} from '../helpers/login';
import {alertSomeError} from '../helpers/error';
import {loginErrorThunk} from './index';

export const createPostAction = createAsyncThunk(
  'posts/createPost',
  async ({text, image}: {text: string; image: string}, thunkAPI) => {
    const keychain = await checkKeychain();

    if (keychain) {
      const response = await sendPost({
        text,
        image,
        id: keychain.id,
        token: keychain.token,
      });
      if (response.type === 'success') {
        return response.post;
      }
      if (response.type === 'loginError') {
        const callback = () => {
          thunkAPI.dispatch(loginErrorThunk());
        };
        requestLogin(callback);
        return thunkAPI.rejectWithValue({loginError: true});
      }

      if (response.type === 'invalid') {
        return thunkAPI.rejectWithValue({invalid: response.invalid});
      }

      if (response.type === 'someError') {
        console.log(response.message);
        alertSomeError();
        return thunkAPI.rejectWithValue({someError: true});
      }
    } else {
      const callback = () => {
        thunkAPI.dispatch(loginErrorThunk());
      };
      requestLogin(callback);
      return thunkAPI.rejectWithValue({loginError: true});
    }
  },
);

export const deletePostThunk = createAsyncThunk(
  'post/deletePost',
  async (id: number, thunkAPI) => {
    const keychain = await checkKeychain();
    if (keychain) {
      const response = await deletePost({
        postId: id,
        id: keychain.id,
        token: keychain.token,
      });

      if (response.type === 'success') {
        return id;
      }

      if (response.type === 'loginError') {
        const callback = () => {
          thunkAPI.dispatch(loginErrorThunk());
        };
        requestLogin(callback);
        return thunkAPI.rejectWithValue({loginError: true});
      }

      if (response.type === 'invalid') {
        return thunkAPI.rejectWithValue({invalid: response.invalid});
      }

      if (response.type === 'someError') {
        console.log(response.message);
        alertSomeError();
        return thunkAPI.rejectWithValue({someError: true});
      }
    } else {
      const callback = () => {
        thunkAPI.dispatch(loginErrorThunk());
      };
      requestLogin(callback);
      return thunkAPI.rejectWithValue({loginError: true});
    }
  },
);