import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { AbilityCard } from '../components/AbilityCard';
import { ErrorState } from '../components/ErrorState';
import { HeroDetailSkeleton } from '../components/LoadingSkeleton';
import { HeroStats } from '../components/HeroStats';
import { getAttributeMeta } from '../data/attributes';
import { deleteHero } from '../api/heroes';
import { useHeroDetail } from '../hooks/userHeroDetail';
import type { RootStackParamList } from '../navigation/AppNavigator';

const EASE = [0.23, 1, 0.32, 1] as const;

function SectionTitle({ children, meta }: { children: React.ReactNode; meta?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{children}</Text>
      {meta && <Text style={styles.meta}>{meta}</Text>}
    </View>
  );
}

export function HeroDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'HeroDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { hero, isLoading, error, reload } = useHeroDetail(route.params?.heroId);
  const [imageFailed, setImageFailed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const goBack = () => navigation.goBack();

  const handleDelete = () => {
    if (!hero || deleting) return;

    Alert.alert('Delete hero?', `Delete ${hero.name}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);

          try {
            await deleteHero(hero.id);
            navigation.popToTop();
          } catch {
            setDeleting(false);
            Alert.alert(
              'Delete failed',
              'The hero could not be deleted. Try again.',
            );
          }
        },
      },
    ]);
  };

  const attribute = hero ? getAttributeMeta(hero.attribute) : null;
  const showImage = Boolean(hero?.imageUrl) && !imageFailed;

  return (
    <View style={styles.screen}>
      <View style={[styles.toolbar, { top: insets.top + 8 }]}>
        <Pressable
          onPress={goBack}
          accessibilityLabel="Back to hero list"
          style={styles.actionButton}
        >
          <Icon name="chevron-left" size={20} color="#F5F6F7" />
        </Pressable>

        {hero && (
          <View style={styles.actionGroup}>
            <Pressable
              onPress={() =>
                navigation.navigate('HeroEdit', { heroId: hero.id })
              }
              accessibilityLabel="Edit hero"
              style={styles.actionButton}
            >
              <Icon name="pencil" size={17} color="#F5F6F7" />
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              accessibilityLabel="Delete hero"
              style={[
                styles.actionButton,
                styles.deleteButton,
                deleting && styles.disabledButton,
              ]}
            >
              <Icon name="delete" size={17} color="#E2543B" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading && <HeroDetailSkeleton />}

        {!isLoading && error && (
          <View style={styles.errorContainer}>
            <ErrorState
              title="Unable to load hero."
              message="This hero could not be fetched from the API."
              onRetry={reload}
            />
          </View>
        )}

        {!isLoading && !error && hero && attribute && (
          <View>
            <View style={styles.heroImageContainer}>
              {showImage ? (
                <Image
                  source={{ uri: hero.imageUrl as string }}
                  accessibilityLabel={`${hero.name} artwork`}
                  onError={() => setImageFailed(true)}
                  style={styles.heroImage}
                />
              ) : (
                <View style={styles.artUnavailable}>
                  <Icon name="head-question" size={32} color="#6E7681" />
                  <Text style={styles.mutedLabel}>Artwork unavailable</Text>
                </View>
              )}

              <View style={styles.heroCaption}>
                <View style={styles.badgeRow}>
                  <Text
                    style={[styles.badge, { color: attribute.color }]}
                  >
                    {attribute.label}
                  </Text>

                  <Text style={styles.attackType}>
                    {hero.attackType}
                  </Text>
                </View>

                <Text style={styles.heroName}>{hero.name}</Text>
              </View>
            </View>

            <View style={styles.body}>
              {hero.roles.length > 0 && (
                <View>
                  <Text style={styles.hiddenHeading}>Roles</Text>

                  <View style={styles.roles}>
                    {hero.roles.map((role) => (
                      <Text key={role} style={styles.role}>
                        {role}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {hero.description && (
                <View>
                  <SectionTitle>
                    <Text>Lore</Text>
                  </SectionTitle>

                  <Text style={styles.description}>
                    {hero.description}
                  </Text>
                </View>
              )}

              <View>
                <SectionTitle>
                  <Text>Statistics</Text>
                </SectionTitle>

                <HeroStats stats={hero.stats} />
              </View>

              <View>
                <SectionTitle
                  meta={
                    hero.abilities.length > 0
                      ? `${hero.abilities.length}`
                      : undefined
                  }
                >
                  <Text>Abilities</Text>
                </SectionTitle>

                {hero.abilities.length > 0 ? (
                  <View style={styles.abilityList}>
                    {hero.abilities.map((ability) => (
                      <View key={ability.id}>
                        <AbilityCard ability={ability} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyAbilities}>
                    Ability data isn’t available from the API for this hero.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D1117',
  },

  scrollContent: {
    paddingBottom: 32,
  },

  toolbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000099',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
  },

  deleteButton: {
    borderColor: '#9B493C',
  },

  disabledButton: {
    opacity: 0.5,
  },

  errorContainer: {
    paddingTop: 96,
  },

  heroImageContainer: {
    height: 330,
    backgroundColor: '#161B22',
    marginTop: 24,
  },

  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  artUnavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  mutedLabel: {
    color: '#6E7681',
    fontSize: 12,
    textTransform: 'uppercase',
  },

  heroCaption: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  badge: {
    backgroundColor: '#00000066',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  attackType: {
    color: '#8B949E',
    borderColor: '#30363D',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    fontSize: 11,
    textTransform: 'uppercase',
  },

  heroName: {
    color: '#F5F6F7',
    fontSize: 36,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 10,
  },

  body: {
    padding: 20,
    gap: 28,
  },

  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionHeading: {
    color: '#F5F6F7',
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  meta: {
    color: '#6E7681',
    fontSize: 11,
  },

  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  role: {
    color: '#8B949E',
    backgroundColor: '#FFFFFF0D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
  },

  description: {
    color: '#8B949E',
    fontSize: 14,
    lineHeight: 24,
  },

  emptyAbilities: {
    color: '#8B949E',
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 10,
    fontSize: 13,
  },

  hiddenHeading: {
    display: 'none',
  },

  abilityList: {
    gap: 8,
  },
});

export default HeroDetailScreen;