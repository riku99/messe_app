import React, {useMemo, useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  RefreshControl,
  FlatList,
  ListRenderItem,
} from 'react-native';
import {
  TabView,
  TabBar,
  SceneRendererProps,
  NavigationState,
} from 'react-native-tab-view';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../stores/index';
import {Post} from '../../../stores/posts';
import {refreshUserThunk} from '../../../apis/users/refreshUser';
import {normalStyles} from '~/constants/styles/normal';
import {
  UserInformationRouteInTabView,
  SnsLinkData,
} from './UserInformationInTabView';
import {TabViewPost} from './Posts';
import {ScrollViewTabScene} from './ScrollViewTabScene';

type PostsRouteProps = {
  //posts: Post[];
  containerHeight: number;
  profileContainerHeight: number;
  mostRecentlyScrolledView: 'Posts' | 'UserInformation' | null;
};

const PostsRoute = React.memo(
  ({
    containerHeight,
    profileContainerHeight,
    mostRecentlyScrolledView,
  }: PostsRouteProps) => {
    const [contentsHeight, setContentsHeight] = useState(0);
    const paddingTopHeight = useMemo(
      () => profileContainerHeight + stickyTabHeight,
      [profileContainerHeight],
    );

    const scrollableHeight = useMemo(() => {
      switch (mostRecentlyScrolledView) {
        case 'Posts':
          return paddingTopHeight;
        case 'UserInformation':
          return containerHeight + profileContainerHeight - contentsHeight; // 上部に到達したTabまでスクロールできる高さを持たせる
      }
    }, [
      containerHeight,
      contentsHeight,
      mostRecentlyScrolledView,
      paddingTopHeight,
      profileContainerHeight,
    ]);

    return (
      <>
        <View
          onLayout={(e) => {
            setContentsHeight(e.nativeEvent.layout.height);
          }}>
          <View />
        </View>
        <View style={{height: scrollableHeight}} />
      </>
    );
  },
);

type TabSceneProps = {
  renderItem?: ListRenderItem<Post>;
  renderData?: Post[];
  userId: string;
  scrollY: Animated.Value;
  tabViewRef: React.RefObject<FlatList>;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  setMostRecentlyScrolledView: () => void;
  profileContainerHeight: number;
  mostRecentlyScrolledView: 'Posts' | 'UserInformation' | null;
};

const FlatListTabScene = React.memo(
  ({
    userId,
    scrollY,
    tabViewRef,
    onScrollEndDrag,
    onMomentumScrollEnd,
    setMostRecentlyScrolledView,
    renderData,
    renderItem,
    profileContainerHeight,
    mostRecentlyScrolledView,
  }: TabSceneProps) => {
    const dispatch: AppDispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await dispatch(
        refreshUserThunk({
          userId,
        }),
      );
      setRefreshing(false);
    }, [dispatch, userId]);

    const paddingTopHeight = useMemo(
      () => profileContainerHeight + stickyTabHeight,
      [profileContainerHeight],
    );

    return (
      <Animated.FlatList
        ref={tabViewRef}
        data={renderData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={3}
        horizontal={false}
        scrollEventThrottle={16}
        contentContainerStyle={{paddingTop: paddingTopHeight}}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: true,
          },
        )}
        onScrollEndDrag={onScrollEndDrag}
        onScrollBeginDrag={setMostRecentlyScrolledView}
        onMomentumScrollEnd={onMomentumScrollEnd}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  },
);

type Props = {
  userId: string;
  containerHeight: number;
  profileContainerHeight: number;
  posts: Post[];
  scrollY: Animated.Value;
  postsTabViewRef: React.RefObject<FlatList>;
  userInformationTabViewRef: React.RefObject<ScrollView>;
  snsLinkData: SnsLinkData;
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
    snsLinkData,
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

    const [mostRecentlyScrolledView, setMostRecentlyScrolledView] = useState<
      'Posts' | 'UserInformation' | null
    >(null);

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
              profileContainerHeight={profileContainerHeight}
              mostRecentlyScrolledView={mostRecentlyScrolledView}
              setMostRecentlyScrolledView={() => {
                if (
                  tabRoute[tabIndex].key === 'Posts' &&
                  mostRecentlyScrolledView !== 'Posts'
                ) {
                  setMostRecentlyScrolledView('Posts');
                } else if (
                  tabRoute[tabIndex].key === 'UserInformation' &&
                  mostRecentlyScrolledView !== 'UserInformation'
                ) {
                  setMostRecentlyScrolledView('UserInformation');
                }
              }}
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
              setMostRecentlyScrolledView={() => {
                if (
                  tabRoute[tabIndex].key === 'Posts' &&
                  mostRecentlyScrolledView !== 'Posts'
                ) {
                  setMostRecentlyScrolledView('Posts');
                } else if (
                  tabRoute[tabIndex].key === 'UserInformation' &&
                  mostRecentlyScrolledView !== 'UserInformation'
                ) {
                  setMostRecentlyScrolledView('UserInformation');
                }
              }}
              profileContainerHeight={profileContainerHeight}>
              <UserInformationRouteInTabView
                containerHeight={containerHeight}
                profileContainerHeight={profileContainerHeight}
                mostRecentlyScrolledView={mostRecentlyScrolledView}
                snsLinkData={snsLinkData}
              />
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
