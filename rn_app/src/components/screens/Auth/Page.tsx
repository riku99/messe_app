import React from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../stores/index';
import {lineLoginThunk} from '../../../apis/session/lineLogin';
import {Auth} from './Auth';
import {sampleLogin} from '../../../apis/session/sampleLogin';

export const Container = () => {
  const dispatch: AppDispatch = useDispatch();

  const login = (): void => {
    dispatch(lineLoginThunk());
  };

  const _sampleLogin = () => {
    dispatch(sampleLogin());
  };

  return <Auth login={login} sampleLogin={_sampleLogin} />;
};