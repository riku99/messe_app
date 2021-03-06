import React, {useCallback, useMemo, useState} from 'react';
import {View, Switch, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import {RootState} from '~/stores';
import {changeUserDisplayThunk} from '~/thunks/users/changeUserDisplay';
import {useCustomDispatch} from '~/hooks/stores';
import {ConfigList} from './List';
import {commonStyles} from './constants';
import {CustomPopupModal} from '~/components/utils/PopupModal';

export const DisplayConfig = React.memo(() => {
  const userDisplay = useSelector((state: RootState) => {
    return state.userReducer.user!.display;
  });

  const dispatch = useCustomDispatch();

  const [switchForDisplay, setSwitchForDisplay] = useState(userDisplay);
  const [
    showDisplayDescriptionModal,
    setShowDisplayDescriptionModal,
  ] = useState(false);

  const onUserDisplaySwitchValueChange = useCallback(
    async (v: boolean) => {
      setSwitchForDisplay(v);
      const result = await dispatch(changeUserDisplayThunk(v));
      if (!changeUserDisplayThunk.fulfilled.match(result)) {
        setSwitchForDisplay(!v);
      }
    },
    [setSwitchForDisplay, dispatch],
  );

  const navigation = useNavigation();

  const list = useMemo(() => {
    return [
      {
        title: '他のユーザーに自分を表示',
        switch: (
          <Switch
            value={switchForDisplay}
            style={commonStyles.switch}
            onValueChange={onUserDisplaySwitchValueChange}
          />
        ),
        description: true,
        onItemPress: () => setShowDisplayDescriptionModal(true),
      },
      {
        title: 'プライベートゾーンの設定',
        onItemPress: () => {
          navigation.navigate('PrivateConfig', {goTo: 'zone'});
        },
      },
      {
        title: 'プライベートタイムの設定',
        onItemPress: () => {
          navigation.navigate('PrivateConfig', {goTo: 'time'});
        },
      },
    ];
  }, [switchForDisplay, onUserDisplaySwitchValueChange, navigation]);

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.sectionContainer}>
        <ConfigList list={list} />
      </View>
      <CustomPopupModal
        isVisible={showDisplayDescriptionModal}
        closeModal={() => setShowDisplayDescriptionModal(false)}>
        <View style={commonStyles.descriptionModal}>
          <Text
            style={{fontSize: 17, marginHorizontal: 10, marginVertical: 10}}>
            ONの場合、一定の範囲内にいる他のユーザーに対して自分が表示されます。
            {'\n'}OFFの場合は他のユーザーに表示されることはありません。
          </Text>
        </View>
      </CustomPopupModal>
    </View>
  );
});
