import { WebView } from 'react-native-webview'

interface Props {
  html: string
  onMessage?: (data: string) => void
}

export function MapEmbed({ html, onMessage }: Props) {
  return (
    <WebView
      source={{ html }}
      style={{ flex: 1 }}
      scrollEnabled={false}
      javaScriptEnabled
      onMessage={e => onMessage?.(e.nativeEvent.data)}
    />
  )
}
