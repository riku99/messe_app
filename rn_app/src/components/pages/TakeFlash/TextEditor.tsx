import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  Text,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {Button} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  setTextEditMode: (v: boolean) => void;
};

export const TextEditor = ({setTextEditMode}: Props) => {
  const inputRef = useRef<null | TextInput>(null);

  const [text, setText] = useState('');
  const textClone = useRef('');
  const [fontSize, setFontSize] = useState(30);

  const defaultMarginTop = useRef<null | number>(null);
  const [inputMarginTop, setInputMarginTop] = useState(0);

  const [inputHeight, setInputHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  const [onSlide, setOnSlide] = useState(false);

  const keyBoardWillShow = useCallback(
    (e: KeyboardEvent) => {
      const top = (height - e.endCoordinates.height) / 2;
      if (!maxHeight) {
        setMaxHeight(height - (100 + e.endCoordinates.height));
      }
      if (!inputMarginTop) {
        setInputMarginTop(top);
      }
      if (!defaultMarginTop.current) {
        defaultMarginTop.current = top;
      }
    },
    [inputMarginTop, maxHeight],
  );

  useLayoutEffect(() => {
    Keyboard.addListener('keyboardWillShow', keyBoardWillShow);

    return () => Keyboard.removeListener('keyboardWillShow', keyBoardWillShow);
  }, [inputMarginTop, keyBoardWillShow]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    console.log('change');
    setInputHeight(e.nativeEvent.contentSize.height);
    if (e.nativeEvent.contentSize.height > inputHeight) {
      // heightが高くなった = margontopが少なくなる。 どれくらい少なくなるかというと、増加したheight分
      const diff = e.nativeEvent.contentSize.height - inputHeight; // heightの増加分
      const nextMarginTop = inputMarginTop - diff; // 変化するmarigの値
      // 変化の結果が safeAreaのtop + 上部にあるボタン群 の高さ以下にならない場合のみmarginTopの値を更新。100はとりあえずの値。あとで変える。
      if (nextMarginTop >= 100) {
        setInputMarginTop(nextMarginTop);
      }
    } else {
      const diff = inputHeight - e.nativeEvent.contentSize.height;
      const nextMarginTop = inputMarginTop + diff;
      // marginTopが最初の位置よりは下にならないようにする
      if (nextMarginTop <= defaultMarginTop.current!) {
        setInputMarginTop(nextMarginTop);
      }
    }
  };

  const {top} = useSafeAreaInsets();

  // TextInputのfontSizeとかスタイルに関するプロパティがローマ字以外だと動的に設定できないというバグがある
  // issue見ても解決されていないっぽいので、それらに対応するためにややこしめなことしている
  return (
    <View style={styles.container}>
      <TextInput
        onLayout={(e) => {
          const {height} = e.nativeEvent.layout;
          console.log('それまでの高さ' + inputHeight);
          console.log('イベントが起こったことによる高さ' + height);
          if (height !== inputHeight) {
            console.log('change');
            setInputHeight(height);
            if (height > inputHeight) {
              // heightが高くなった = margontopが少なくなる。 どれくらい少なくなるかというと、増加したheight分
              const diff = height - inputHeight; // heightの増加分
              const nextMarginTop = inputMarginTop - diff; // 変化するmarigの値
              // 変化の結果が safeAreaのtop + 上部にあるボタン群 の高さ以下にならない場合のみmarginTopの値を更新。100はとりあえずの値。あとで変える。
              if (nextMarginTop >= 100) {
                setInputMarginTop(nextMarginTop);
              }
            } else {
              const diff = inputHeight - height;
              const nextMarginTop = inputMarginTop + diff;
              // marginTopが最初の位置よりは下にならないようにする
              if (nextMarginTop <= defaultMarginTop.current!) {
                setInputMarginTop(nextMarginTop);
              }
            }
          }
        }}
        ref={inputRef}
        multiline={true}
        style={[
          styles.input,
          {
            //marginTop: inputMarginTop,
            position: 'absolute',
            top: inputMarginTop,
            maxHeight,
            fontSize,
            color: !onSlide ? 'white' : 'transparent',
            //backgroundColor: 'red',
          },
        ]}
        value={text}
        selectionColor={!onSlide ? undefined : 'transparent'}
        onChangeText={(t) => {
          setText(t);
          textClone.current = t;
        }}
      />

      {onSlide && (
        <Text
          onLayout={(e) =>
            console.log('Textのheight' + e.nativeEvent.layout.height)
          }
          style={[
            styles.input,
            styles.slideText,
            {
              top: inputMarginTop,
              maxHeight,
              fontSize,
              //backgroundColor: 'gray',
            },
          ]}>
          {text}
        </Text>
      )}

      <View style={styles.sliderContainer}>
        <Slider
          style={{width: 200, height: 20}}
          value={35}
          minimumValue={10}
          maximumValue={50}
          maximumTrackTintColor="#FFFFFF"
          onSlidingStart={() => {
            setText((t) => t + ' ');
            setTimeout(() => {
              setOnSlide(true);
              setText(textClone.current);
            }, 1);
          }}
          onValueChange={(v) => {
            setFontSize(v);
          }}
          onSlidingComplete={(v) => {
            setText((t) => t + ' ');
            setTimeout(() => {
              setFontSize(v);
              setText(textClone.current);
            }, 1);
            setOnSlide(false);
          }}
        />
      </View>
      <View style={[styles.topButtonContaienr, {top}]}>
        <Button
          title="完了"
          titleStyle={{fontSize: 22, fontWeight: '500'}}
          buttonStyle={{backgroundColor: 'transparent'}}
          style={{alignSelf: 'flex-end'}}
          onPress={() => setTextEditMode(false)}
        />
      </View>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  input: {
    maxWidth: width,
    borderColor: 'transparent',
    borderWidth: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sliderContainer: {
    transform: [{rotate: '-90deg'}],
    position: 'absolute',
    top: '45%',
    left: -70,
  },
  topButtonContaienr: {
    position: 'absolute',
    width: '95%',
  },
  slideText: {
    position: 'absolute',
    color: 'white',
  },
});
