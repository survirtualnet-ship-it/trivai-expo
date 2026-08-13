import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { MapPin } from 'lucide-react-native'
import { EditableField } from '../components/EditableField'
import { ProductCardCompact } from '../components/ProductCard'
import { companyTheme as t } from '../theme'
import type { Company, Product } from '../types'

type Props = {
  company: Company
  draft: Partial<Company> | null
  editMode: boolean
  featuredProducts: Product[]
  onUpdateDraft: (patch: Partial<Company>) => void
}

export function HomeTab({
  company,
  draft,
  editMode,
  featuredProducts,
  onUpdateDraft,
}: Props) {
  const data = editMode && draft ? { ...company, ...draft } : company

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <EditableField
        label="Nombre"
        value={data.name}
        editable={false}
        locked
      />
      <EditableField
        label="Categoría"
        value={data.category}
        editable={false}
        locked
      />
      <EditableField
        label="Descripción"
        value={data.description}
        editable={editMode}
        multiline
        onChangeText={text => onUpdateDraft({ description: text })}
      />

      <Text style={styles.sectionTitle}>Contacto</Text>
      <EditableField
        label="Teléfono"
        value={data.phone}
        editable={editMode}
        keyboardType="phone-pad"
        onChangeText={text => onUpdateDraft({ phone: text })}
      />
      <EditableField
        label="WhatsApp"
        value={data.whatsapp}
        editable={editMode}
        keyboardType="phone-pad"
        onChangeText={text => onUpdateDraft({ whatsapp: text })}
      />
      <EditableField
        label="Sitio web"
        value={data.website}
        editable={editMode}
        keyboardType="url"
        onChangeText={text => onUpdateDraft({ website: text })}
      />
      <EditableField label="Email" value={data.email} locked />

      <Text style={styles.sectionTitle}>Ubicación</Text>
      <View style={styles.locationBox}>
        <MapPin size={16} color={t.accent} />
        <Text style={styles.locationText}>{data.location.address}</Text>
      </View>
      <Text style={styles.lockHint}>La ubicación no se puede editar desde aquí.</Text>

      {featuredProducts.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { marginTop: t.spacing.lg }]}>
            Productos destacados
          </Text>
          {featuredProducts.map(product => (
            <ProductCardCompact key={product.id} product={product} />
          ))}
        </>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
  },
  sectionTitle: {
    color: t.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: t.spacing.md,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
    backgroundColor: t.surfaceMuted,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
  },
  locationText: {
    flex: 1,
    color: t.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  lockHint: {
    color: t.textMuted,
    fontSize: 11,
    marginTop: t.spacing.sm,
    marginBottom: t.spacing.lg,
  },
})
