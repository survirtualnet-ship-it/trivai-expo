import { useEffect, useRef } from 'react'
import { View } from 'react-native'

interface Props {
  html: string
  mapKey?: string
  selectedPlaceId?: string | null
  onMessage?: (data: string) => void
}

export function MapEmbed({ html, mapKey, selectedPlaceId, onMessage }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!onMessage) return
    const handler = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.startsWith('{')) onMessage(e.data)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onMessage])

  useEffect(() => {
    if (!selectedPlaceId || !iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ type: 'select', id: selectedPlaceId }),
      '*',
    )
  }, [selectedPlaceId, mapKey])

  const src = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
  return (
    <View style={{ flex: 1 }}>
      <iframe
        key={mapKey}
        ref={iframeRef}
        src={src}
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  )
}
