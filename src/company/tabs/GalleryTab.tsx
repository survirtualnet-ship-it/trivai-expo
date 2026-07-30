import { ScrollView, StyleSheet } from 'react-native'
import { GalleryGrid } from '../components/GalleryGrid'
import { companyTheme as t } from '../theme'

type Props = {
  images: string[]
}

export function GalleryTab({ images }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GalleryGrid images={images} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
  },
})
