import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native'
import { Plus } from 'lucide-react-native'
import { ProductCard } from '../components/ProductCard'
import { FLATLIST_PERF } from '../constants/listPerf'
import { companyTheme as t } from '../theme'
import type { Product } from '../types'

type Props = {
  products: Product[]
  editMode: boolean
  onAdd: (product: Omit<Product, 'id' | 'companyId'>) => void
  onUpdate: (id: string, patch: Partial<Product>) => void
  onDelete: (id: string) => void
}

const EMPTY_FORM = {
  name: '',
  price: '',
  description: '',
  category: 'Menú',
  image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=640&q=80',
  isFeatured: false,
}

const keyExtractor = (item: Product) => item.id

export function ProductsTab({ products, editMode, onAdd, onUpdate, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const openCreate = useCallback(() => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category,
      image: product.image,
      isFeatured: product.isFeatured,
    })
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    const price = Number(form.price)
    if (!form.name.trim() || Number.isNaN(price)) {
      Alert.alert('Producto', 'Nombre y precio son obligatorios.')
      return
    }
    const payload = {
      name: form.name.trim(),
      price,
      description: form.description.trim(),
      category: form.category.trim() || 'General',
      image: form.image.trim(),
      isFeatured: form.isFeatured,
    }
    if (editingId) onUpdate(editingId, payload)
    else onAdd(payload)
    setModalOpen(false)
  }, [editingId, form, onAdd, onUpdate])

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <View style={styles.itemWrap}>
        <ProductCard
          product={item}
          fullWidth
          editMode={editMode}
          onPress={editMode ? () => openEdit(item) : undefined}
          onDelete={
            editMode
              ? () =>
                  Alert.alert('Eliminar', `¿Eliminar "${item.name}"?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(item.id) },
                  ])
              : undefined
          }
        />
      </View>
    ),
    [editMode, onDelete, openEdit],
  )

  const listEmpty = useMemo(
    () => <Text style={styles.empty}>No hay productos publicados.</Text>,
    [],
  )

  return (
    <View style={styles.root}>
      {editMode ? (
        <Pressable onPress={openCreate} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addLabel}>Agregar producto</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={listEmpty}
        {...FLATLIST_PERF}
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </Text>
            {(['name', 'price', 'category', 'description', 'image'] as const).map(field => (
              <TextInput
                key={field}
                value={form[field]}
                onChangeText={text => setForm(prev => ({ ...prev, [field]: text }))}
                placeholder={field}
                placeholderTextColor={t.textMuted}
                keyboardType={field === 'price' ? 'numeric' : 'default'}
                multiline={field === 'description'}
                style={[styles.input, field === 'description' && styles.inputMulti]}
              />
            ))}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Destacado</Text>
              <Switch
                value={form.isFeatured}
                onValueChange={v => setForm(prev => ({ ...prev, isFeatured: v }))}
                trackColor={{ true: t.accent, false: t.border }}
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalOpen(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    backgroundColor: t.accent,
    margin: t.spacing.lg,
    marginBottom: 0,
    borderRadius: t.radius.full,
    paddingVertical: 12,
  },
  addLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: t.spacing.lg, paddingBottom: t.spacing.xxxl },
  row: { justifyContent: 'space-between', marginBottom: t.spacing.md },
  itemWrap: { width: '48%' },
  empty: { color: t.textMuted, textAlign: 'center', marginTop: t.spacing.xxl },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: t.surface,
    borderTopLeftRadius: t.radius.xl,
    borderTopRightRadius: t.radius.xl,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
    maxHeight: '85%',
  },
  modalTitle: {
    color: t.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: t.spacing.sm,
  },
  input: {
    backgroundColor: t.surfaceMuted,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.md,
    color: t.text,
    fontSize: 15,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: t.spacing.sm,
  },
  switchLabel: { color: t.text, fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.md,
    marginTop: t.spacing.md,
  },
  cancelBtn: { padding: t.spacing.md },
  cancelText: { color: t.textMuted, fontWeight: '600' },
  saveBtn: {
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingHorizontal: t.spacing.xl,
    paddingVertical: 12,
  },
  saveText: { color: '#fff', fontWeight: '700' },
})
