import { useEffect } from 'react'
import { View } from 'react-native'

interface Props {
  html: string
  onMessage?: (data: string) => void
}

export function MapEmbed({ html, onMessage }: Props) {
  useEffect(() => {
    if (!onMessage) return
    const handler = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.startsWith('{')) onMessage(e.data)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onMessage])

  const src = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
  return (
    <View style={{ flex: 1 }}>
      <iframe
        src={src}
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  )
}
