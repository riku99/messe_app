import {ThunkDispatch} from '@reduxjs/toolkit';

import {rejectPayload, basicAxiosError} from '~/apis/types';
import {requestLogin} from '~/apis/helpers/errors/requestLogin';
import {alertSomeError} from '~/helpers/errors';
import {logoutAction} from '~/apis/session/logout';
import {displayShortMessage} from '~/helpers/shortMessages/displayShortMessage';

export const handleBasicError = ({
  e,
  dispatch,
}: {
  e: any;
  dispatch: ThunkDispatch<unknown, unknown, any>;
}): rejectPayload => {
  if (e && e.response) {
    const axiosError = e as basicAxiosError;
    switch (axiosError.response?.data.errorType) {
      case 'loginError':
        requestLogin(() => dispatch(logoutAction));
        return {errorType: 'loginError'};
      case 'invalidError':
        displayShortMessage(axiosError.response.data.message, 'danger');
        return {
          errorType: 'invalidError',
          message: axiosError.response.data.message,
        };
      default:
        console.log(e.response);
        alertSomeError();
        return {
          errorType: 'someError',
        };
    }
  } else {
    console.log(e.response);
    alertSomeError();
    return {
      errorType: 'someError',
    };
  }
};