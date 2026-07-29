/** Google Maps custom style — minimal POIs, dark discovery UI */
export const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B0F1A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8B93A7' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0F1A' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1C2438' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#121826' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A2235' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252D42' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2A3450' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070A12' }] },
] as const
