import { getCatColor } from '@/lib/categories'
import { ENV } from '@/lib/env'
import type { ExplorerPlace } from '@/lib/explorerRanking'
import type { Coords } from '@/lib/geolocation'

export interface ExplorerMapMarker {
  id: string
  name: string
  category: string
  lat: number
  lng: number
}

export function toExplorerMarkers(places: ExplorerPlace[]): ExplorerMapMarker[] {
  return places
    .filter(p => p.latitude != null && p.longitude != null)
    .map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      lat: p.latitude as number,
      lng: p.longitude as number,
    }))
}

export function buildExplorerMapHtml(
  markers: ExplorerMapMarker[],
  center: Coords,
  selectedId?: string | null,
  userPos?: Coords | null,
  zoom = 14,
): string {
  const apiKey = ENV.googleMapsKey
  const markersDataJS = `var __markers = {
${markers.map(m => `  ${JSON.stringify(m.id)}: ${JSON.stringify(m)}`).join(',\n')}
};`

  const pinsJS = markers.map(m => {
    const color = getCatColor(m.category)
    const selected = m.id === selectedId
    const scale = selected ? 14 : 9
    const stroke = selected ? 3 : 2
    return `(function() {
      var mk = new google.maps.Marker({
        position: { lat: ${m.lat}, lng: ${m.lng} },
        map: map,
        title: ${JSON.stringify(m.name)},
        zIndex: ${selected ? 999 : 1},
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: ${scale},
          fillColor: '${color}',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: ${stroke},
        }
      });
      mk.addListener('click', function() {
        var msg = JSON.stringify({ type: 'marker', id: ${JSON.stringify(m.id)} });
        if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
        else { window.parent.postMessage(msg, '*'); }
      });
    })();`
  }).join('\n')

  const userPinJS = userPos
    ? `new google.maps.Marker({
        position: { lat: ${userPos.lat}, lng: ${userPos.lng} },
        map: map,
        zIndex: 1000,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        }
      });`
    : ''

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%}</style>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"></script>
</head><body>
<div id="map"></div>
<script>
${markersDataJS}
var map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: ${center.lat}, lng: ${center.lng} },
  zoom: ${zoom},
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] }
  ]
});
${pinsJS}
${userPinJS}
map.addListener('idle', function() {
  var c = map.getCenter();
  var b = map.getBounds();
  if (!b) return;
  var ne = b.getNorthEast();
  var sw = b.getSouthWest();
  var msg = JSON.stringify({
    type: 'region',
    center: { lat: c.lat(), lng: c.lng() },
    bounds: {
      ne: { lat: ne.lat(), lng: ne.lng() },
      sw: { lat: sw.lat(), lng: sw.lng() }
    }
  });
  if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
  else { window.parent.postMessage(msg, '*'); }
});
</script></body></html>`
}
