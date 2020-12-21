import React, {useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {SearchOthers} from '../../components/others/SearchOthers';
import {FlashesWithUser} from '../../components/flashes/ShowFlash';
import {RootState} from '../../redux/index';
import {AnotherUser} from '../../components/others/SearchOthers';
import {AppDispatch} from '../../redux/index';
import {getOthersThunk} from '../../actions/others';
import {RootStackParamList} from '../../screens/Root';
import {SearchStackParamList} from '../../screens/Search';

type SearchNavigationProp = StackNavigationProp<
  SearchStackParamList,
  'SearchOthers'
>;

type RootNavigationProp = StackNavigationProp<RootStackParamList, 'Tab'>;

export const Container = () => {
  const isFocused = useIsFocused();

  const position = useSelector((state: RootState) => {
    const lat = state.userReducer.user!.lat;
    const lng = state.userReducer.user!.lng;
    return {lat, lng};
  }, shallowEqual);

  const _range = useRef(1);

  const [range, setRange] = useState(_range.current);

  const [flashesWithUser, setFlashesWithUser] = useState<FlashesWithUser[]>([]);

  const dispatch: AppDispatch = useDispatch();

  const [others, setOthers] = useState<AnotherUser[]>([]);

  // API通信が成功した場合、そのデータはdispatchされる必要はないが
  // エラーハンドリングでdispatchが必要なのでthunkで通信を行う
  useEffect(() => {
    const getOthers = async (range: number) => {
      if (isFocused) {
        const result = await dispatch(
          getOthersThunk({lat: position.lat, lng: position.lng, range}),
        );
        if (getOthersThunk.fulfilled.match(result)) {
          setOthers(result.payload);
        }
      }
    };
    getOthers(range);
  }, [dispatch, isFocused, position.lat, position.lng, range]);

  useEffect(() => {
    if (others.length) {
      const othersWithFlashes = others.filter((f) => f.flashes.entities.length);
      if (othersWithFlashes.length) {
        const _flashesWithUser = othersWithFlashes.map((user) => {
          const {flashes, ...rest} = user;
          return {
            flashes,
            user: rest,
          };
        });
        setFlashesWithUser(_flashesWithUser);
      }
    }
  }, [others]);

  const searchStackNavigation = useNavigation<SearchNavigationProp>();

  const rootStackNavigation = useNavigation<RootNavigationProp>();

  const pushProfile = (user: AnotherUser) => {
    searchStackNavigation.push('OtherProfile', user);
  };

  // 全てのアイテムを閲覧している場合、allFlashesWithUserには入らないようにする
  const pushFlashes = ({id}: {id: number}) => {
    const index = flashesWithUser!.findIndex((item) => item.user.id === id);
    rootStackNavigation.push('Flashes', {
      allFlashesWithUser: flashesWithUser,
      index,
    });
  };

  return (
    <SearchOthers
      others={others}
      refRange={_range}
      setRange={setRange}
      navigateToProfile={pushProfile}
      navigateToFlashes={pushFlashes}
    />
  );
};
