import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  type ScrollViewProps,
} from 'react-native';

interface KeyboardScrollContextValue {
  scrollToInput: (nodeHandle: number | null) => void;
}

const KeyboardScrollContext = createContext<KeyboardScrollContextValue | null>(null);

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children?: ReactNode;
  extraScrollHeight?: number;
}

export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  extraScrollHeight = 120,
  keyboardDismissMode,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: KeyboardAwareScrollViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToInput = useCallback(
    (nodeHandle: number | null) => {
      if (nodeHandle === null) {
        return;
      }

      setTimeout(
        () => {
          scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard?.(
            nodeHandle,
            extraScrollHeight,
            true,
          );
        },
        Platform.OS === 'android' ? 220 : 80,
      );
    },
    [extraScrollHeight],
  );

  const contextValue = useMemo(() => ({ scrollToInput }), [scrollToInput]);

  return (
    <KeyboardScrollContext.Provider value={contextValue}>
      <ScrollView
        ref={scrollViewRef}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode={
          keyboardDismissMode ?? (Platform.OS === 'ios' ? 'interactive' : 'on-drag')
        }
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
        contentContainerStyle={[
          contentContainerStyle,
          keyboardHeight > 0
            ? { paddingBottom: keyboardHeight + extraScrollHeight }
            : undefined,
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardScrollContext.Provider>
  );
}

export function useKeyboardScrollIntoView() {
  return useContext(KeyboardScrollContext)?.scrollToInput;
}
