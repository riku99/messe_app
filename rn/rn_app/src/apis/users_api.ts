import axios from 'axios';

import {origin} from '../constants/origin';
import {UserType} from '../redux/user';
import {PostType} from '../redux/post';
import {headers} from '../helpers/headers';
import {credentials} from '../helpers/keychain';

type AxiosResponseUser = UserType & {posts: PostType[]};

export const sendNonce: (
  nonce: string,
) => Promise<boolean | undefined> = async (nonce) => {
  const response = await axios.post(`${origin}/nonce`, {nonce: nonce});

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  if (response.data.nonce) {
    return response.data.nonce;
  }
};

export const sendIDtoken: (
  token: string,
) => Promise<
  | {
      type: 'success';
      user: UserType;
      posts: PostType[];
      token: string;
    }
  | {type: 'loginError'}
> = async (token) => {
  const response = await axios.post(`${origin}/firstLogin`, {}, headers(token));

  if (response.data.success) {
    return {
      type: 'success',
      user: response.data.success.user,
      posts: response.data.success.posts,
      token: response.data.success.token,
    };
  }

  if (response.data.loginError) {
    return {type: 'loginError'};
  }

  throw new Error();
};

export const sendAccessToken: ({
  id,
  token,
}: credentials) => Promise<
  | {
      type: 'success';
      user: UserType;
      posts: PostType[];
    }
  | {type: 'loginError'}
  | {type: 'someError'; message: string}
> = async ({id, token}) => {
  try {
    const response = await axios.post<AxiosResponseUser>(
      `${origin}/subsequentLogin`,
      {id: id},
      headers(token),
    );

    const {posts, ...user} = response.data;
    return {
      type: 'success',
      user: user,
      posts: posts,
    };
  } catch (e) {
    if (e.response !== undefined && e.response.data.loginError) {
      console.log(e.response.data);
      return {type: 'loginError'};
    } else {
      return {type: 'someError', message: e.message};
    }
  }
};

export const sendEditedProfile: ({
  name,
  introduce,
  image,
  id,
  token,
}: {
  name: string;
  introduce: string;
  image: string | undefined;
  id: number;
  token: string;
}) => Promise<
  | {type: 'user' & UserType}
  | {type: 'invalid'; invalid: string}
  | {type: 'loginError'}
> = async ({name, introduce, image, id, token}) => {
  const response = await axios.put(
    `${origin}/user`,
    {
      id: id,
      name: name,
      introduce: introduce,
      image: image,
    },
    headers(token),
  );

  if (response.data.success) {
    return {type: 'user', ...response.data.success};
  }

  if (response.data.loginError) {
    return {type: 'loginError'};
  }

  if (response.data.invalid) {
    return {type: 'invalid', ...response.data};
  }
};
