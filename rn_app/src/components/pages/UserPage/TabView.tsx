import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import {
  TabView,
  TabBar,
  SceneRendererProps,
  NavigationState,
} from 'react-native-tab-view';
import MIcon from 'react-native-vector-icons/MaterialIcons';

import {Post} from '../../../redux/post';
import {Posts} from './Posts';

type PostsRouteProps = {
  posts: Post[];
  containerHeight: number;
  profileContainerHeight: number;
  defaultProfileContainerHeight: number;
  mostRecentlyScrolledView: 'Posts' | 'UserInformation' | null;
};

const PostsRoute = React.memo(
  ({
    posts,
    containerHeight,
    profileContainerHeight,
    defaultProfileContainerHeight,
    mostRecentlyScrolledView,
  }: PostsRouteProps) => {
    console.log('re-render');
    const [contentsHeight, setContentsHeight] = useState(0);
    const paddingTopHeight = useMemo(
      () => profileContainerHeight + stickyTabHeight,
      [profileContainerHeight],
    );

    const scrollableHeight = useMemo(() => {
      // profileの高さが最初と同じ、つまりintoroduceが拡張されていない場合
      if (profileContainerHeight === defaultProfileContainerHeight) {
        switch (mostRecentlyScrolledView) {
          case 'Posts':
            return paddingTopHeight;
          case 'UserInformation':
            return containerHeight + profileContainerHeight - contentsHeight; // 上部に到達したTabまでスクロールできる高さを持たせる
        }
      }

      // profileの高さが最初より高い、つまりintroduceが拡張されているがpaddingTopの分がContainerを超えていない場合
      if (
        profileContainerHeight > defaultProfileContainerHeight &&
        paddingTopHeight <= containerHeight
      ) {
        switch (mostRecentlyScrolledView) {
          case 'Posts':
            return paddingTopHeight;
          case 'UserInformation':
            return containerHeight + profileContainerHeight - contentsHeight;
        }
      }

      // paddingTopの値がContainerを超えている場合
      if (paddingTopHeight > containerHeight) {
        switch (mostRecentlyScrolledView) {
          case 'Posts':
            return (
              profileContainerHeight +
              stickyTabHeight +
              (paddingTopHeight - containerHeight)
            );
          case 'UserInformation':
            return (
              containerHeight +
              profileContainerHeight -
              contentsHeight +
              (paddingTopHeight - containerHeight)
            );
        }
      }
    }, [
      mostRecentlyScrolledView,
      containerHeight,
      profileContainerHeight,
      defaultProfileContainerHeight,
      paddingTopHeight,
      contentsHeight,
    ]);

    return (
      <>
        <View onLayout={(e) => setContentsHeight(e.nativeEvent.layout.height)}>
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
  defaultProfileContainerHeight: number;
  profileContainerHeight: number;
  mostRecentlyScrolledView: 'Posts' | 'UserInformation' | null;
};

const UserInformationRoute = React.memo(
  ({
    containerHeight,
    defaultProfileContainerHeight,
    profileContainerHeight,
    mostRecentlyScrolledView,
  }: UserInformationProps) => {
    const [contentsHeight, setContentsHeight] = useState(0);

    const paddingTopHeight = useMemo(
      () => profileContainerHeight + stickyTabHeight,
      [profileContainerHeight],
    );
    const scrollableHeight = useMemo(() => {
      // profileの高さが最初と同じ、つまりintoroduceが拡張されていない場合
      if (profileContainerHeight === defaultProfileContainerHeight) {
        switch (mostRecentlyScrolledView) {
          case 'UserInformation':
            return paddingTopHeight;
          case 'Posts':
            return containerHeight + profileContainerHeight - contentsHeight; // 上部に到達したTabまでスクロールできる高さを持たせる
        }
      }

      // profileの高さが最初より高い、つまりintroduceが拡張されているがpaddingTopの分がContainerを超えていない場合
      if (
        profileContainerHeight > defaultProfileContainerHeight &&
        paddingTopHeight <= containerHeight
      ) {
        switch (mostRecentlyScrolledView) {
          case 'UserInformation':
            return paddingTopHeight;
          case 'Posts':
            return containerHeight + profileContainerHeight - contentsHeight;
        }
      }

      // paddingTopの値がContainerを超えている場合
      if (paddingTopHeight > containerHeight) {
        switch (mostRecentlyScrolledView) {
          case 'UserInformation':
            return (
              profileContainerHeight +
              stickyTabHeight +
              (paddingTopHeight - containerHeight)
            );
          case 'Posts':
            return (
              containerHeight +
              profileContainerHeight -
              contentsHeight +
              (paddingTopHeight - containerHeight)
            );
        }
      }
    }, [
      mostRecentlyScrolledView,
      containerHeight,
      profileContainerHeight,
      defaultProfileContainerHeight,
      paddingTopHeight,
      contentsHeight,
    ]);

    return (
      <>
        <View
          style={{
            minHeight:
              containerHeight -
              (defaultProfileContainerHeight + stickyTabHeight),
            justifyContent: 'center',
          }}
          onLayout={(e) => setContentsHeight(e.nativeEvent.layout.height)}>
          <Text style={styles.comingSoon}>coming soon...</Text>
        </View>
        <View style={{height: scrollableHeight}} />
      </>
    );
  },
);

type TabSceneProps = {
  children: Element;
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
    contentsPaddingTop,
    scrollY,
    tabViewRef,
    onScrollEndDrag,
    onMomentumScrollEnd,
    setMostRecentlyScrolledView,
  }: TabSceneProps) => {
    return (
      <Animated.ScrollView
        ref={tabViewRef}
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
        onMomentumScrollEnd={onMomentumScrollEnd}>
        {children}
      </Animated.ScrollView>
    );
  },
);

type Props = {
  containerHeight: number;
  defaultProfileContainerHeight: number;
  profileContainerHeight: number;
  posts: Post[];
  scrollY: Animated.Value;
  postsTabViewRef: React.RefObject<ScrollView>;
  userInformationTabViewRef: React.RefObject<ScrollView>;
};

export const UserTabView = React.memo(
  ({
    containerHeight,
    profileContainerHeight,
    defaultProfileContainerHeight,
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
                defaultProfileContainerHeight={defaultProfileContainerHeight}
                mostRecentlyScrolledView={mostRecentlyScrolledView}
              />
            </TabScene>
          );
        case 'UserInformation':
          return (
            <TabScene
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
                defaultProfileContainerHeight={defaultProfileContainerHeight}
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
            indicatorStyle={{backgroundColor: '#4ba5fa'}}
            style={{backgroundColor: 'white'}}
            renderLabel={() => null}
            renderIcon={({route, focused}) => {
              return route.key === 'Posts' ? (
                <MIcon
                  name="apps"
                  size={25}
                  color={focused ? '#4ba5fa' : 'lightgray'}
                />
              ) : (
                <MIcon
                  name="wysiwyg"
                  size={25}
                  color={focused ? '#4ba5fa' : 'lightgray'}
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
  comingSoon: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#a6c6f7',
    marginTop: 40,
    marginBottom: 40,
    alignSelf: 'center',
  },
});
