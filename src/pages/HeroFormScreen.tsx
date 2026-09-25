import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { Icon } from '../components/Icon';
import { ATTRIBUTES } from '../data/attributes';
import {
  createHero,
  emptyHeroInput,
  getHeroInput,
  updateHero,
  type HeroInput,
} from '../api/heroes';
import type { AbilityInput } from '../api/heroes';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NumericHeroKey =
  | 'health' | 'mana' | 'armor' | 'damageMin' | 'damageMax'
  | 'attackRange' | 'attackRate' | 'moveSpeed' | 'turnRate'
  | 'visionDay' | 'visionNight' | 'strBase' | 'strGain'
  | 'agiBase' | 'agiGain' | 'intBase' | 'intGain';

const statisticFields: Array<{ key: NumericHeroKey; label: string }> = [
  { key: 'health', label: 'Health' },
  { key: 'mana', label: 'Mana' },
  { key: 'armor', label: 'Armor' },
  { key: 'damageMin', label: 'Damage min' },
  { key: 'damageMax', label: 'Damage max' },
  { key: 'attackRange', label: 'Attack range' },
  { key: 'attackRate', label: 'Attack rate' },
  { key: 'moveSpeed', label: 'Move speed' },
  { key: 'turnRate', label: 'Turn rate' },
  { key: 'visionDay', label: 'Vision day' },
  { key: 'visionNight', label: 'Vision night' },
  { key: 'strBase', label: 'Strength base' },
  { key: 'strGain', label: 'Strength gain' },
  { key: 'agiBase', label: 'Agility base' },
  { key: 'agiGain', label: 'Agility gain' },
  { key: 'intBase', label: 'Intelligence base' },
  { key: 'intGain', label: 'Intelligence gain' },
];

export default function HeroFormScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const route =
    useRoute<RouteProp<RootStackParamList, 'HeroEdit' | 'HeroCreate'>>();
  const isCreate = route.name === 'HeroCreate';
  const heroId = route.name === 'HeroEdit' ? route.params?.heroId : undefined;

  const [value, setValue] = useState<HeroInput | null>(
    isCreate ? { ...emptyHeroInput, abilities: [] } : null,
  );

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);
  const [openDropdown, setOpenDropdown] = useState<'attribute' | 'attackType' | null>(null);

  useEffect(() => {
    if (isCreate) return;

    if (!heroId) return;

    getHeroInput(heroId)
      .then((hero) => {
        setValue(hero);
        setSelectedImage(
          hero.imageUrl || null,
        );
      })
      .catch(() =>
        setError(
          'Could not load this hero.',
        ),
      );
  }, [heroId, isCreate]);

  const set = <K extends keyof HeroInput>(
    key: K,
    next: HeroInput[K],
  ) => {
    setValue((current) =>
      current
        ? {
            ...current,
            [key]: next,
          }
        : current,
    );
  };

  const pickImage = async () => {
    setError(null);

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow photo library access to choose a hero image.',
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

    if (result.canceled) {
      return;
    }

    const imageUri =
      result.assets[0]?.uri;

    if (!imageUri) {
      return;
    }

    setSelectedImage(imageUri);

    /*
     * For now, store the local URI in imageUrl.
     * This allows the image to be previewed immediately.
     *
     * For production, replace this with your
     * backend image-upload function.
     */
    set('imageUrl', imageUri);
  };

  const removeImage = () => {
    setSelectedImage(null);
    set('imageUrl', '');
  };

  const save = async () => {
    if (!value || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isCreate) {
        await createHero(value);
      } else {
        if (!heroId) {
          setError('Hero id is missing.');
          setSaving(false);
          return;
        }
        await updateHero(heroId, value);
      }

      navigation.goBack();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Save failed. Check your connection and try again.',
      );

      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + 12,
          },
        ]}
      >
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Icon
            name="chevron-left"
            size={20}
            color="#F5F6F7"
          />
        </Pressable>

        <Text style={styles.heading}>{isCreate ? 'Add Hero' : 'Edit Hero'}</Text>
      </View>

      {!value && !error && (
        <Text style={styles.message}>
          Loading hero...
        </Text>
      )}

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      {value && (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={false}
        >
          <Field
            label="Name"
            value={value.name}
            onChangeText={(text) =>
              set('name', text)
            }
          />

          <Dropdown
            label="Attribute"
            value={ATTRIBUTES.find((item) => item.id === value.attribute)?.label ?? value.attribute}
            options={ATTRIBUTES.map((item) => ({ label: item.label, value: item.id }))}
            open={openDropdown === 'attribute'}
            onOpen={() => setOpenDropdown('attribute')}
            onClose={() => setOpenDropdown(null)}
            onSelect={(next) => {
              set('attribute', next as HeroInput['attribute']);
              setOpenDropdown(null);
            }}
          />

          <Dropdown
            label="Attack type"
            value={value.attackType === 'melee' ? 'Melee' : 'Ranged'}
            options={[{ label: 'Melee', value: 'melee' }, { label: 'Ranged', value: 'ranged' }]}
            open={openDropdown === 'attackType'}
            onOpen={() => setOpenDropdown('attackType')}
            onClose={() => setOpenDropdown(null)}
            onSelect={(next) => {
              set('attackType', next as HeroInput['attackType']);
              setOpenDropdown(null);
            }}
          />

          <Field
            label="Roles"
            value={value.roles.join(', ')}
            onChangeText={(text) =>
              set(
                'roles',
                text
                  .split(',')
                  .map((role) =>
                    role.trim(),
                  )
                  .filter(Boolean),
              )
            }
          />

          {/* HERO IMAGE */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Hero Artwork
            </Text>

            <View
              style={styles.imageContainer}
            >
              {selectedImage ? (
                <Image
                  source={{
                    uri: selectedImage,
                  }}
                  style={styles.previewImage}
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }
                >
                  <Icon
                    name="image"
                    size={32}
                    color="#6E7681"
                  />

                  <Text
                    style={
                      styles.placeholderText
                    }
                  >
                    No artwork selected
                  </Text>
                </View>
              )}
            </View>

            <View
              style={styles.imageActions}
            >
              <Pressable
                onPress={pickImage}
                style={
                  styles.changeImageButton
                }
              >
                <Icon
                  name="image"
                  size={16}
                  color="#F5F6F7"
                />

                <Text
                  style={
                    styles.changeImageLabel
                  }
                >
                  {selectedImage
                    ? 'Change Image'
                    : 'Choose Image'}
                </Text>
              </Pressable>

              {selectedImage && (
                <Pressable
                  onPress={removeImage}
                  style={
                    styles.removeImageButton
                  }
                >
                  <Icon
                    name="delete"
                    size={16}
                    color="#E2543B"
                  />

                  <Text
                    style={
                      styles.removeImageLabel
                    }
                  >
                    Remove
                  </Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.imageHint}>
              Photos selected from this device preview immediately. Permanent display on other devices requires server upload support.
            </Text>
          </View>

          <Field
            label="Description"
            value={value.description}
            onChangeText={(text) =>
              set(
                'description',
                text,
              )
            }
            multiline
          />

          <View style={styles.statisticsSection}>
            <Text style={styles.sectionLabel}>Statistics</Text>
            <View style={styles.statisticsGrid}>
              {statisticFields.map((field) => (
                <View key={field.key} style={styles.statisticCell}>
                  <NumberField
                    label={field.label}
                    value={value[field.key]}
                    onChange={(next) => set(field.key, next)}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.abilitySection}>
            <View style={styles.abilityHeader}>
              <Text style={styles.sectionLabel}>Abilities</Text>
              <Pressable
                onPress={() => set('abilities', [...value.abilities, { name: '', icon: '', description: '' }])}
                style={styles.addAbilityButton}
              >
                <Icon name="plus" size={15} color="#F5F6F7" />
                <Text style={styles.addAbilityLabel}>Add</Text>
              </Pressable>
            </View>

            {value.abilities.map((ability, index) => (
              <AbilityEditor
                key={`${index}-${ability.name}`}
                ability={ability}
                onChange={(next) => {
                  const abilities = [...value.abilities];
                  abilities[index] = next;
                  set('abilities', abilities);
                }}
                onRemove={() => set('abilities', value.abilities.filter((_, itemIndex) => itemIndex !== index))}
              />
            ))}
          </View>

          <Pressable
            onPress={save}
            disabled={saving}
            style={[
              styles.saveButton,
              saving &&
                styles.disabled,
            ]}
          >
            <Text
              style={styles.saveLabel}
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string,
  ) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        multiline={multiline}
        style={[
          styles.input,
          multiline &&
            styles.multiline,
        ]}
        placeholderTextColor="#6E7681"
      />
    </View>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={String(value)}
        onChangeText={(text) => {
          const parsed = Number(text);
          onChange(text === '' || !Number.isFinite(parsed) ? 0 : parsed);
        }}
        keyboardType="decimal-pad"
        style={styles.input}
        selectTextOnFocus
      />
    </View>
  );
}

function Dropdown({
  label,
  value,
  options,
  open,
  onOpen,
  onClose,
  onSelect,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={onOpen} style={styles.dropdownButton} accessibilityRole="button">
        <Text style={styles.dropdownValue}>{value}</Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#8B949E" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.modalBackdrop} onPress={onClose}>
          <View style={styles.dropdownMenu}>
            {options.map((option) => (
              <Pressable key={option.value} onPress={() => onSelect(option.value)} style={styles.dropdownOption}>
                <Text style={styles.dropdownOptionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function AbilityEditor({
  ability,
  onChange,
  onRemove,
}: {
  ability: AbilityInput;
  onChange: (ability: AbilityInput) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.abilityCard}>
      <View style={styles.abilityCardHeader}>
        <Text style={styles.abilityNumber}>Ability</Text>
        <Pressable onPress={onRemove} accessibilityLabel="Remove ability" style={styles.removeAbilityButton}>
          <Icon name="delete-outline" size={17} color="#E2543B" />
        </Pressable>
      </View>
      <TextInput value={ability.name} onChangeText={(name) => onChange({ ...ability, name })} placeholder="Ability name" placeholderTextColor="#6E7681" style={styles.input} />
      <TextInput value={ability.icon ?? ''} onChangeText={(icon) => onChange({ ...ability, icon })} placeholder="Ability image URL (optional)" placeholderTextColor="#6E7681" style={styles.input} autoCapitalize="none" />
      <TextInput value={ability.description} onChangeText={(description) => onChange({ ...ability, description })} placeholder="Description" placeholderTextColor="#6E7681" style={[styles.input, styles.multilineSmall]} multiline />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D1117',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161B22',
  },

  heading: {
    color: '#F5F6F7',
    fontSize: 19,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },

  field: {
    gap: 6,
  },

  label: {
    color: '#8B949E',
    fontSize: 11,
    textTransform: 'uppercase',
  },

  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363D',
    backgroundColor: '#161B22',
    color: '#F5F6F7',
    paddingHorizontal: 14,
    fontSize: 14,
  },

  dropdownButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363D',
    backgroundColor: '#161B22',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownValue: { color: '#F5F6F7', fontSize: 14 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#00000099' },
  dropdownMenu: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#484F58', backgroundColor: '#161B22' },
  dropdownOption: { paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#30363D' },
  dropdownOptionLabel: { color: '#F5F6F7', fontSize: 15 },

  abilitySection: { gap: 12 },
  statisticsSection: { gap: 12 },
  statisticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statisticCell: { width: '48%' },
  abilityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { color: '#F5F6F7', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  addAbilityButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, borderWidth: 1, borderColor: '#484F58', paddingHorizontal: 12, paddingVertical: 8 },
  addAbilityLabel: { color: '#F5F6F7', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  abilityCard: { gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22' },
  abilityCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  abilityNumber: { color: '#8B949E', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  removeAbilityButton: { padding: 4 },
  multilineSmall: { minHeight: 82, paddingTop: 12, textAlignVertical: 'top' },

  multiline: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  imageContainer: {
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#30363D',
    backgroundColor: '#161B22',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  placeholderText: {
    color: '#6E7681',
    fontSize: 12,
    textTransform: 'uppercase',
  },

  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  imageHint: {
    color: '#6E7681',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },

  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
  },

  changeImageLabel: {
    color: '#F5F6F7',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    minHeight: 40,
  },

  removeImageLabel: {
    color: '#E2543B',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  saveButton: {
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#E2543B',
    paddingVertical: 13,
    marginTop: 8,
  },

  saveLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  message: {
    color: '#8B949E',
    padding: 20,
  },

  error: {
    color: '#E2543B',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  disabled: {
    opacity: 0.5,
  },
});