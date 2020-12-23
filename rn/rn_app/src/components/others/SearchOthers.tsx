import React, {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {ListItem} from 'react-native-elements';
import {SearchBar} from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import LinearGradient from 'react-native-linear-gradient';

import {flashesGradation} from '../../constants/lineGradation';
import {UserAvatar} from '../utils/Avatar';
import {UserType} from '../../redux/user';
import {Post} from '../../redux/post';
import {Flash} from '../../redux/flashes';

export type AnotherUser = Omit<UserType, 'display' | 'lat' | 'lng'> & {
  posts: Post[];
  flashes: {
    entities: Flash[];
    alreadyViewed: number[];
    isAllAlreadyViewed?: boolean;
  };
};

type Props = {
  others: AnotherUser[];
  refRange: MutableRefObject<number>;
  setRange: Dispatch<SetStateAction<number>>;
  navigateToProfile: (user: AnotherUser) => void;
  navigateToFlashes: ({id}: {id: number; isAllAlreadyViewed?: boolean}) => void;
};

export const SearchOthers = ({
  others,
  refRange,
  setRange,
  navigateToProfile,
  navigateToFlashes,
}: Props) => {
  const [filteredUsers, setFilteredUsers] = useState(others);
  const [keyword, setKeyword] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(0);

  const caluculateDuration = useCallback((n: number) => {
    return n * 5;
  }, []);

  const transformY = scrollY.interpolate({
    inputRange: [0, SEARCH_TAB_HEIGHT],
    outputRange: [0, -SEARCH_TAB_HEIGHT],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (keyword === '') {
      setFilteredUsers(others);
    } else {
      const matchedUsers = others.filter((u) => {
        return (
          u.name.toLowerCase().includes(keyword.toLowerCase()) ||
          u.introduce.toLowerCase().includes(keyword.toLowerCase()) ||
          u.message.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      setFilteredUsers(matchedUsers);
    }
  }, [keyword, others]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          ...styles.displayOptionsContainer,
          transform: [{translateY: transformY}],
        }}>
        <SearchBar
          placeholder="キーワードを検索"
          inputContainerStyle={styles.searchInputContainer}
          containerStyle={styles.searchContainer}
          lightTheme={true}
          round={true}
          value={keyword}
          onChangeText={(text) => {
            setKeyword(text);
          }}
        />
        <View style={{width: '90%', alignSelf: 'center'}}>
          <RNPickerSelect
            onValueChange={(value) => {
              refRange.current = value;
              setRange(refRange.current);
            }}
            items={[
              {label: '1km', value: 1},
              {label: '2km', value: 2},
              {label: '3km', value: 3},
              {label: '4km', value: 4},
              {label: '5km', value: 5},
            ]}
            placeholder={{}}
            style={{
              viewContainer: {
                width: '90%',
                height: 25,
                alignSelf: 'center',
                marginTop: 10,
              },
              inputIOS: {
                color: '#2c3e50',
                fontSize: 15,
                fontWeight: 'bold',
              },
            }}
            doneText="完了"
          />
        </View>
      </Animated.View>
      {filteredUsers.length ? (
        <>
          <ScrollView
            style={styles.fill}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              {
                useNativeDriver: false,
                listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
                  if (e.nativeEvent.contentOffset.y > SEARCH_TAB_HEIGHT) {
                    scrollY.setValue(SEARCH_TAB_HEIGHT);
                  }
                },
              },
            )}
            onScrollEndDrag={(e) => {
              if (e.nativeEvent.contentOffset.y > offsetY.current) {
                offsetY.current = e.nativeEvent.contentOffset.y;
              } else if (e.nativeEvent.contentOffset.y < offsetY.current) {
                Animated.timing(scrollY, {
                  toValue: 0,
                  duration: caluculateDuration(
                    offsetY.current > 80 ? 80 : offsetY.current,
                  ),
                  useNativeDriver: false,
                }).start();
                offsetY.current = e.nativeEvent.contentOffset.y;
              }
            }}>
            <View
              style={{
                ...styles.scrollViewContent,
              }}>
              {filteredUsers.map((u) => (
                <ListItem
                  key={u.id}
                  onPress={() => {
                    navigateToProfile(u);
                  }}>
                  {u.flashes.entities.length &&
                  !u.flashes.isAllAlreadyViewed ? ( // 閲覧していないアイテムが残っている場合
                    <LinearGradient
                      colors={flashesGradation.colors}
                      start={flashesGradation.start}
                      end={flashesGradation.end}
                      style={styles.userImageGradation}>
                      <UserAvatar
                        image={u.image}
                        size="medium"
                        opacity={1}
                        onPress={() => {
                          navigateToFlashes({id: u.id});
                        }}
                      />
                    </LinearGradient>
                  ) : u.flashes.entities.length && u.flashes.alreadyViewed ? ( // アイテムは持っているが、全て閲覧されている場合
                    <View
                      style={[
                        styles.userImageGradation,
                        {backgroundColor: 'gray'},
                      ]}>
                      <UserAvatar
                        image={u.image}
                        size="medium"
                        opacity={1}
                        onPress={() => {
                          navigateToFlashes({
                            id: u.id,
                            isAllAlreadyViewed: true,
                          });
                        }}
                      />
                    </View>
                  ) : (
                    <UserAvatar image={u.image} size="medium" opacity={1} />
                  )}
                  <ListItem.Content>
                    <ListItem.Title>{u.name}</ListItem.Title>
                    <ListItem.Subtitle style={styles.subtitle}>
                      {u.message}
                    </ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.noUser}>
          <Text style={styles.noUserText}>この範囲にユーザーはいません</Text>
        </View>
      )}
    </View>
  );
};

const SEARCH_TAB_HEIGHT = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  displayOptionsContainer: {
    backgroundColor: 'white',
    height: SEARCH_TAB_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  searchInputContainer: {
    width: '90%',
    height: 30,
    backgroundColor: '#ebebeb',
    alignSelf: 'center',
  },
  userImageGradation: {
    height: 55,
    width: 55,
    borderRadius: 55,
    ...flashesGradation.baseStyle,
  },
  iosPicker: {
    color: '#2c3e50',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fill: {
    flex: 1,
  },
  scrollViewContent: {
    marginTop: SEARCH_TAB_HEIGHT,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 3,
  },
  noUser: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noUserText: {
    fontSize: 18,
    color: '#999999',
  },
});
