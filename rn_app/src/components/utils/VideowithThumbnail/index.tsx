import React, {ComponentProps, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage, {FastImageProps} from 'react-native-fast-image';
import Video from 'react-native-video';

import {getThumbnailUrl} from '~/helpers/video';

type Props = {
  video: ComponentProps<typeof Video> & {
    source: {uri: string};
  } & React.ClassAttributes<Video>; // refを渡したい時、ComponentProps<typeof Video>だけだとエラー出るのでrefの型明記
  thumbnail?: Omit<FastImageProps, 'source'>;
};

export const VideoWithThumbnail = React.memo(({video, thumbnail}: Props) => {
  const thumbnailUrl = useMemo(() => getThumbnailUrl(video.source.uri), [
    video.source.uri,
  ]);
  return (
    <View>
      <Video style={[styles.source, styles.video]} {...video} />
      <FastImage
        source={{uri: thumbnailUrl}}
        style={styles.source}
        {...thumbnail}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  source: {
    width: '100%',
    height: '100%',
  },
  video: {
    position: 'absolute',
    zIndex: 10,
  },
});
