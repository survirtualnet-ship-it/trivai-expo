import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { View } from 'react-native'

export type MapEmbedRef = {
  /** Pan map and highlight marker (web iframe). */
  focusPlace: (placeId: string) => void
}

interface Props {
  html: string
  mapKey?: string
  selectedPlaceId?: string | null
  onMessage?: (data: string) => void
}

export const MapEmbed = forwardRef<MapEmbedRef, Props>(function MapEmbed(
  { html, mapKey, selectedPlaceId, onMessage },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const postToMap = (payload: object) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), '*')
  }

  useImperativeHandle(ref, () => ({
    focusPlace: (placeId: string) => {
      postToMap({ type: 'select', id: placeId })
    },
  }))

  useEffect(() => {
    if (!onMessage) return
    const handler = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.startsWith('{')) onMessage(e.data)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onMessage])

  useEffect(() => {
    if (!selectedPlaceId) return
    postToMap({ type: 'select', id: selectedPlaceId })
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
})
