import { ENV } from '@/lib/env'
import { MAP_LIGHT_STYLE } from '../mapDarkStyle'
import { MAP_CITY_CENTER } from '../data/mockPlaces'
import { mapTheme } from '../theme'
import type { MapPlace } from '../store/useMapStore'
import { placeLatitude, placeLongitude } from '../utils/placeHelpers'

function markerColor(place: MapPlace): string {
  if (place.type === 'event') return mapTheme.event
  if (place.isTrending) return mapTheme.trending
  if (place.isRecommended) return mapTheme.recommended
  return mapTheme.pinDefault
}

export function buildDiscoveryMapHtml(
  places: MapPlace[],
  selectedId: string | null,
  userPos?: { lat: number; lng: number } | null,
): string {
  const apiKey = ENV.googleMapsKey
  const center = userPos ?? MAP_CITY_CENTER
  const stylesJson = JSON.stringify([...MAP_LIGHT_STYLE])

  const markersDataJS = `var __markers = {
${places.map(p => `  ${JSON.stringify(p.id)}: ${JSON.stringify({ id: p.id, name: p.name, lat: placeLatitude(p), lng: placeLongitude(p), color: markerColor(p) })}`).join(',\n')}
};`

  const pinsJS = places.map(p => {
    const color = markerColor(p)
    const selected = p.id === selectedId
    const scale = selected ? 14 : 9
    const strokeWeight = selected ? 3 : 2
    return `(function() {
      var mk = new google.maps.Marker({
        position: { lat: ${placeLatitude(p)}, lng: ${placeLongitude(p)} },
        map: map,
        title: ${JSON.stringify(p.name)},
        zIndex: ${selected ? 999 : p.isTrending ? 50 : 1},
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: ${scale},
          fillColor: ${JSON.stringify(color)},
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: ${strokeWeight}
        }
      });
      window.__markerRefs[${JSON.stringify(p.id)}] = mk;
      mk.addListener('click', function() {
        window.selectMarker(${JSON.stringify(p.id)});
        var msg = JSON.stringify({ type: 'marker', id: ${JSON.stringify(p.id)} });
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
window.__markerRefs = {};
window.__selectedId = ${JSON.stringify(selectedId)};
${markersDataJS}
var map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: ${center.lat}, lng: ${center.lng} },
  zoom: 14,
  disableDefaultUI: true,
  gestureHandling: 'greedy',
  styles: ${stylesJson}
});
window.selectMarker = function(id) {
  window.__selectedId = id;
  for (var key in window.__markerRefs) {
    var meta = __markers[key];
    if (!meta) continue;
    var selected = key === id;
    window.__markerRefs[key].setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: selected ? 14 : 9,
      fillColor: meta.color,
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: selected ? 3 : 2
    });
    window.__markerRefs[key].setZIndex(selected ? 999 : 1);
  }
  var m = __markers[id];
  if (m) map.panTo({ lat: m.lat, lng: m.lng });
};
window.addEventListener('message', function(e) {
  try {
    var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (data && data.type === 'select' && data.id) window.selectMarker(data.id);
  } catch (err) {}
});
${pinsJS}
${userPinJS}
if (window.__selectedId) window.selectMarker(window.__selectedId);
window.panToPlace = function(id) {
  var m = __markers[id];
  if (!m) return;
  map.panTo({ lat: m.lat, lng: m.lng });
};
</script></body></html>`
}
