import React, {useMemo, useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  RefreshControl,
  Linking,
} from 'react-native';
import {
  TabView,
  TabBar,
  SceneRendererProps,
  NavigationState,
} from 'react-native-tab-view';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch} from 'react-redux';
import {SocialIcon} from 'react-native-elements';

import {AppDispatch} from '../../../stores/index';
import {Post} from '../../../stores/posts';
import {Posts} from './Posts';
import {refreshUserThunk} from '../../../apis/users/refreshUser';
import {normalStyles} from '~/constants/styles/normal';
import TikTok from '~/assets/tiktok_logo.svg';

type PostsRouteProps = {
  posts: Post[];
  containerHeight: number;
  profileContainerHeight: number;
  mostRecentlyScrolledView: 'Posts' | 'UserInformation' | null;
};

const PostsRoute = React.memo(
  ({
    posts,
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
          <Posts posts={posts} />
          <View />
        </View>
        <View style={{height: scrollableHeight}} />
      </>
    );
  },
);

type UserInformationProps = {
  containerHeight: number;
  profileContainerHeight: number;
  mostRecentlyScrolledView: 'Posts' | 'UserInformation' | null;
};

const UserInformationRoute = React.memo(
  ({
    containerHeight,
    profileContainerHeight,
    mostRecentlyScrolledView,
  }: UserInformationProps) => {
    const [contentsHeight, setContentsHeight] = useState(0);

    const paddingTopHeight = useMemo(
      () => profileContainerHeight + stickyTabHeight,
      [profileContainerHeight],
    );

    const scrollableHeight = useMemo(() => {
      switch (mostRecentlyScrolledView) {
        case 'UserInformation':
          return paddingTopHeight;
        case 'Posts':
          return containerHeight + profileContainerHeight - contentsHeight; // 上部に到達したTabまでスクロールできる高さを持たせる
      }
    }, [
      containerHeight,
      contentsHeight,
      mostRecentlyScrolledView,
      paddingTopHeight,
      profileContainerHeight,
    ]);

    const handleUrlPress = useCallback(async () => {
      const url = 'https://www.tiktok.com/@kageihina';
      //const url = 'https://twitter.com/';
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('インストールされていません');
      }
    }, []);

    return (
      <>
        <View
          style={{
            minHeight:
              containerHeight - (profileContainerHeight + stickyTabHeight),
          }}
          onLayout={(e) => setContentsHeight(e.nativeEvent.layout.height)}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              justifyContent: 'space-between',
              width: '75%',
              alignSelf: 'center',
            }}>
            <SocialIcon
              raised={false}
              type="instagram"
              onPress={handleUrlPress}
              style={[informationStyles.socialIcom, {backgroundColor: 'pink'}]}
            />
            <SocialIcon
              raised={false}
              type="twitter"
              onPress={() => console.log('ok')}
              style={informationStyles.socialIcom}
            />
            <SocialIcon
              raised={false}
              type="youtube"
              onPress={() => console.log('ok')}
              style={informationStyles.socialIcom}
            />
            <TikTok width={52} style={{marginLeft: 6}} />
          </View>
        </View>
        <View style={{height: scrollableHeight}} />
      </>
    );
  },
);

const informationStyles = StyleSheet.create({
  socialIcom: {
    width: 52,
    height: 52,
  },
});

type TabSceneProps = {
  children: Element;
  userId: string;
  contentsPaddingTop: number;
  scrollY: Animated.Value;
  tabViewRef: React.RefObject<ScrollView>;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  setMostRecentlyScrolledView: () => void;
};

const TabScene = React.memo(
  ({
    children,
    userId,
    contentsPaddingTop,
    scrollY,
    tabViewRef,
    onScrollEndDrag,
    onMomentumScrollEnd,
    setMostRecentlyScrolledView,
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

    return (
      <Animated.ScrollView
        ref={tabViewRef}
        scrollEventThrottle={1}
        style={{paddingTop: contentsPaddingTop + stickyTabHeight}}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: true,
            listener: () => {
              setMostRecentlyScrolledView();
            },
          },
        )}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {children}
      </Animated.ScrollView>
    );
  },
);

type Props = {
  userId: string;
  containerHeight: number;
  profileContainerHeight: number;
  posts: Post[];
  scrollY: Animated.Value;
  postsTabViewRef: React.RefObject<ScrollView>;
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
          postsTabViewRef.current.scrollTo({
            y: scrollValue.current,
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
            <TabScene
              userId={userId}
              tabViewRef={postsTabViewRef}
              contentsPaddingTop={profileContainerHeight}
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
              }}>
              <PostsRoute
                posts={posts}
                containerHeight={containerHeight}
                profileContainerHeight={profileContainerHeight}
                mostRecentlyScrolledView={mostRecentlyScrolledView}
              />
            </TabScene>
          );
        case 'UserInformation':
          return (
            <TabScene
              userId={userId}
              tabViewRef={userInformationTabViewRef}
              contentsPaddingTop={profileContainerHeight}
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
              }}>
              <UserInformationRoute
                containerHeight={containerHeight}
                profileContainerHeight={profileContainerHeight}
                mostRecentlyScrolledView={mostRecentlyScrolledView}
              />
            </TabScene>
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

const stickyTabHeight = 40.5;

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
