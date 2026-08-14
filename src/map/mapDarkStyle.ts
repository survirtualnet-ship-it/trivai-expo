/** Google Maps custom style — minimal POIs, light Trivai UI */
export const MAP_LIGHT_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
] as const

/** @deprecated Use MAP_LIGHT_STYLE — dark mode removed from Trivai */
export const MAP_DARK_STYLE = MAP_LIGHT_STYLE
