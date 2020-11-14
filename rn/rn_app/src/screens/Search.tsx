import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Container as SearchOthers} from '../containers/others/SearchOthers';
import {Container as OtherUser} from '../containers/others/AnotherUserProfile';
import {Container as OtherPost} from '../containers/others/OtherPost';
import {MenuBar} from '../components/utils/MenuBar';
import {Post} from '../redux/post';
import {anotherUser} from '../redux/others';

export type SearchStackParamList = {
  SearchOthers: undefined;
  OtherProfile: anotherUser;
  OtherPost: Post;
};

const Stack = createStackNavigator<SearchStackParamList>();

export const SearchStackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <MenuBar />,
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name="SearchOthers"
        component={SearchOthers}
        options={{title: 'ユーザーを見つける'}}
      />
      <Stack.Screen
        name="OtherProfile"
        component={OtherUser}
        options={{title: 'ユーザーのプロフィール'}}
      />
      <Stack.Screen
        name="OtherPost"
        component={OtherPost}
        options={{title: 'ユーザーの投稿'}}
      />
    </Stack.Navigator>
  );
};
