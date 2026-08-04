import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenHeader from '@/components/ScreenHeader'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { LegalDocument } from '@/lib/legal'

type Props = {
  document: LegalDocument
}

export function LegalDocumentScreen({ document }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title={document.title} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.meta}>
          Versión {document.version} · Actualizado {document.lastUpdated}
        </Text>

        {document.sections.map(section => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Trivai actúa como plataforma. El contenido UGC pertenece a quien lo
            publica.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    padding: S.lg,
    paddingBottom: 80,
    gap: S.xl,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  section: {
    gap: S.md,
  },
  heading: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  paragraph: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg2,
    lineHeight: 24,
  },
  footer: {
    marginTop: S.md,
    padding: S.lg,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
  },
  footerText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    lineHeight: 20,
  },
})
