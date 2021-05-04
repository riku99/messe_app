import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import fs from 'react-native-fs';

import {createFlashThunk} from '~/actions/flashes/createFlash';
import {creatingFlash} from '~/stores/otherSettings';
import {AppDispatch} from '~/stores/index';
import {displayShortMessage} from '~/helpers/shortMessages/displayShortMessage';

export const useCreateFlash = () => {
  const navigation = useNavigation();
  const dispatch: AppDispatch = useDispatch();

  return useCallback(
    async ({
      source,
      sourceType,
      uri,
    }: {
      source?: string;
      sourceType: 'image' | 'video';
      uri: string;
    }) => {
      dispatch(creatingFlash());
      navigation.goBack();
      const a = await fs.readFile(uri, 'base64');
      console.log(a.slice(0, 10));
      const length = uri.lastIndexOf('.'); // 拡張子の有無。なければ-1が返される
      const ext = length !== -1 ? uri.slice(length + 1) : null; // あれば拡張子('.'以降)を取得
      const result = await dispatch(
        createFlashThunk({
          source:
            sourceType === 'image' && source
              ? source
              : await fs.readFile(uri, 'base64'),
          sourceType,
          ext,
        }),
      );
      if (createFlashThunk.fulfilled.match(result)) {
        displayShortMessage('追加しました', 'success');
      }
      dispatch(creatingFlash());
    },
    [dispatch, navigation],
  );
};