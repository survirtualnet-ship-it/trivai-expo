import { memo, type ReactNode } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { T, S } from '@/lib/tokens'

type Props = {
  children: ReactNode
  /** Vertically center scroll content (auth screens) */
  centered?: boolean
  contentStyle?: StyleProp<ViewStyle>
  header?: ReactNode
}

export const ScreenContainer = memo(function ScreenContainer({
  children,
  centered = false,
  contentStyle,
  header,
}: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            {header}
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                centered && styles.centered,
                contentStyle,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: S.xl,
    paddingTop: S.md,
    paddingBottom: S.xxl,
    gap: S.lg,
  },
  centered: {
    justifyContent: 'center',
  },
})
