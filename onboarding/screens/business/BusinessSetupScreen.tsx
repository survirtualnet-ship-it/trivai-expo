import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { CategoryChip } from '../../components/CategoryChip'
import { useOnboardingStore } from '../../store/onboardingStore'
import { BUSINESS_CATEGORIES } from '../types'
import { onboardingTheme as t } from '../../lib/theme'
import type { BusinessSetupProps } from '../types'

export function BusinessSetupScreen({ navigation }: BusinessSetupProps) {
  const businessData = useOnboardingStore(s => s.businessData)
  const setBusinessData = useOnboardingStore(s => s.setBusinessData)

  const [category, setCategory] = useState(businessData?.category ?? '')
  const [description, setDescription] = useState(businessData?.description ?? '')
  const [phone, setPhone] = useState(businessData?.phone ?? '')
  const [website, setWebsite] = useState(businessData?.website ?? '')
  const [whatsapp, setWhatsapp] = useState(businessData?.whatsapp ?? '')
  const [openingHours, setOpeningHours] = useState(businessData?.openingHours ?? '')

  const handleSave = () => {
    if (!businessData) return
    setBusinessData({
      ...businessData,
      category,
      description,
      phone,
      website,
      whatsapp,
      openingHours,
    })
    navigation.navigate('BusinessDone')
  }

  return (
    <OnboardingLayout
      title="Configura tu negocio"
      subtitle="Completa la información que verán los turistas."
      footer={
        <PrimaryButton
          label="Guardar y continuar"
          disabled={!category || !description.trim()}
          onPress={handleSave}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.chips}>
          {BUSINESS_CATEGORIES.map(cat => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

        <Field label="Descripción" value={description} onChangeText={setDescription} multiline />
        <Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Sitio web" value={website} onChangeText={setWebsite} autoCapitalize="none" />
        <Field label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
        <Field
          label="Horario"
          value={openingHours}
          onChangeText={setOpeningHours}
          placeholder="Lun–Vie 9:00–18:00"
        />
      </ScrollView>
    </OnboardingLayout>
  )
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  placeholder,
  autoCapitalize,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  multiline?: boolean
  keyboardType?: 'default' | 'phone-pad'
  placeholder?: string
  autoCapitalize?: 'none' | 'sentences'
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.textMuted}
        style={[styles.input, multiline && styles.inputMulti]}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: t.spacing.lg,
    paddingBottom: t.spacing.xxl,
  },
  label: {
    color: t.textSecondary,
    fontSize: t.font.caption,
    fontWeight: '600',
    marginBottom: t.spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
  },
  field: {
    gap: t.spacing.xs,
  },
  input: {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.lg,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 14,
    color: t.text,
    fontSize: t.font.body,
  },
  inputMulti: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
})
