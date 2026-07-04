/**
 * Imágenes por defecto de categoría.
 * Coloca PNG en assets/categories/ y descomenta el require correspondiente.
 */
import type { ImageSourcePropType } from 'react-native'
import { normalizeCategory, type Category } from './categories'

export const CAT_IMAGE_FILES: Record<Category, string> = {
  Gastronomía:     'gastronomia.png',
  Entretenimiento: 'entretenimiento.png',
  Parques:         'parques.png',
  Otros:           'otros.png',
}

export const CAT_IMAGE: Record<Category, ImageSourcePropType> = {
  Gastronomía:     require('../assets/categories/gastronomia.png'),
  Entretenimiento: require('../assets/categories/entretenimiento.png'),
  Parques:         require('../assets/categories/parques.png'),
  Otros:           require('../assets/categories/otros.png'),
}

export function getCatImage(cat: string): ImageSourcePropType | null {
  const key = normalizeCategory(cat)
  return CAT_IMAGE[key]
}
