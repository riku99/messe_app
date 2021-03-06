import 'react-native-gesture-handler';
import React from 'react';
import {Provider} from 'react-redux';
import {store} from './stores/index';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {ToastProvider} from 'react-native-fast-toast';

import Root from './components/Root';
import {normalStyles} from '~/constants/styles';
import {Dimensions} from 'react-native';

const App: () => React.ReactNode = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Provider store={store}>
        <ToastProvider placement="bottom" offset={toastOffset}>
          <Root />
        </ToastProvider>
      </Provider>
    </NavigationContainer>
  );
};

export const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: normalStyles.headerTitleColor,
    primary: normalStyles.headerTitleColor,
    background: 'white',
  },
};

const {height} = Dimensions.get('screen');

const toastOffset = height * 0.1;

export default App;
