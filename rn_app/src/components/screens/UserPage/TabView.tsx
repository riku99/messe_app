import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  TabView,
  TabBar,
  SceneRendererProps,
  NavigationState,
} from 'react-native-tab-view';
import MIcon from 'react-native-vector-icons/MaterialIcons';

import {Post} from '../../../stores/posts';
import {normalStyles} from '~/constants/styles';
import {UserInformationRouteInTabView} from './UserInformationInTabView';
import {TabViewPost} from './Posts';
import {FlatListTabScene, ScrollViewTabScene} from './TabScene';

type Props = {
  userId: string;
  containerHeight: number;
  profileContainerHeight: number;
  posts: Post[];
  scrollY: Animated.Value;
  postsTabViewRef: React.RefObject<FlatList>;
  userInformationTabViewRef: React.RefObject<ScrollView>;
};

export const UserTabView = React.memo(
  ({
    userId,
    containerHeight,
    profileContainerHeight,
    posts,
    scrollY,
    postsTabViewRef,
    userInformationTabViewRef,
  }: Props) => {
    const [tabIndex, setTabIndex] = useState(0);
    const tabRoute: [
      {key: 'Posts'; title: 'Posts'},
      {key: 'UserInformation'; title: 'UserInformation'},
    ] = useMemo(
      () => [
        {key: 'Posts', title: 'Posts'},
        {key: 'UserInformation', title: 'UserInformation'},
      ],
      [],
    );

    const scrollValue = useRef(0);

    // TabViewをどれだけスクロールしたかを記述
    useEffect(() => {
      scrollY.addListener(({value}) => {
        scrollValue.current = value;
      });
      return () => {
        scrollY.removeAllListeners();
      };
    }, [scrollY, tabIndex, tabRoute]);

    // 片方のTabViewがスクロールされた場合、もう片方もそのoffsetに合わせる
    const syncScrollOffset = () => {
      const currentRouteTabKey = tabRoute[tabIndex].key;
      if (currentRouteTabKey === 'Posts') {
        if (userInformationTabViewRef.current) {
          userInformationTabViewRef.current.scrollTo({
            y: scrollValue.current,
            animated: false,
          });
        }
      } else if (currentRouteTabKey === 'UserInformation') {
        if (postsTabViewRef.current) {
          postsTabViewRef.current.scrollToOffset({
            offset: scrollValue.current,
            animated: false,
          });
        }
      }
    };

    const paddingTopHeight = useMemo(
      () => profileContainerHeight + stickyTabHeight,
      [profileContainerHeight],
    );

    const tabViewContainerMinHeight = useMemo(
      () => containerHeight + paddingTopHeight - stickyTabHeight,
      [containerHeight, paddingTopHeight],
    );

    const renderScene = ({
      route,
    }: SceneRendererProps & {
      route: {key: string; title: string};
    }) => {
      switch (route.key) {
        case 'Posts':
          return (
            <FlatListTabScene
              userId={userId}
              renderData={posts}
              renderItem={({item, index}) => (
                <TabViewPost post={item} index={index} />
              )}
              tabViewRef={postsTabViewRef}
              scrollY={scrollY}
              onScrollEndDrag={syncScrollOffset}
              onMomentumScrollEnd={syncScrollOffset}
              paddingTopHeight={paddingTopHeight}
              tabViewContainerMinHeight={tabViewContainerMinHeight}
            />
          );
        case 'UserInformation':
          return (
            <ScrollViewTabScene
              userId={userId}
              tabViewRef={userInformationTabViewRef}
              scrollY={scrollY}
              onScrollEndDrag={syncScrollOffset}
              onMomentumScrollEnd={syncScrollOffset}
              paddingTopHeight={paddingTopHeight}
              tabViewContainerMinHeight={tabViewContainerMinHeight}>
              <UserInformationRouteInTabView />
            </ScrollViewTabScene>
          );
      }
    };

    const renderTabBar = (
      props: SceneRendererProps & {
        navigationState: NavigationState<{
          key: string;
          title: string;
        }>;
      },
    ) => {
      const y = scrollY.interpolate({
        inputRange: [0, profileContainerHeight],
        outputRange: [profileContainerHeight, 0],
        extrapolateRight: 'clamp',
      });
      return (
        <Animated.View
          style={[styles.tabBarContainer, {transform: [{translateY: y}]}]}>
          <TabBar
            {...props}
            indicatorStyle={{backgroundColor: '#ff6e7f'}}
            style={{backgroundColor: 'white'}}
            renderLabel={() => null}
            renderIcon={({route, focused}) => {
              return route.key === 'Posts' ? (
                <MIcon
                  name="apps"
                  size={25}
                  color={focused ? normalStyles.mainColor : 'lightgray'}
                />
              ) : (
                <MIcon
                  name="wysiwyg"
                  size={25}
                  color={focused ? normalStyles.mainColor : 'lightgray'}
                />
              );
            }}
          />
        </Animated.View>
      );
    };

    return (
      <View style={styles.container}>
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{
            index: tabIndex,
            routes: tabRoute,
          }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          initialLayout={{width}}
        />
      </View>
    );
  },
);

const {width} = Dimensions.get('window');

export const stickyTabHeight = 40.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
  },
});
