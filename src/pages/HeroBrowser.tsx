import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import {
  AttributeFilter,
  type AttributeFilterValue,
} from '../components/AttributeFilter';
import { BackgroundTexture } from '../components/BackgroundTexture';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { HeroGrid } from '../components/HeroGrid';
import { HeroGridSkeleton } from '../components/LoadingSkeleton';
import { HeroSearch } from '../components/HeroSearch';
import { YoutubeVideosCard } from '../components/YoutubeVideosCard';
import { RoleFilter } from '../components/RoleFilter';
import { useHeroes } from '../hooks/userHeroes';
import { useYoutubeVideos } from '../hooks/useYoutubeVideos';
import type { Hero } from '../types/hero';
import type { RootStackParamList } from '../navigation/AppNavigator';

const EASE = [0.23, 1, 0.32, 1] as const;

export function HeroBrowser() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView>(null);

  const {
    heroes,
    isLoading,
    isRefreshing,
    error,
    reload,
    refresh,
  } = useHeroes();

  const { videos: youtubeVideos, loading: youtubeLoading } = useYoutubeVideos('Dota 2');

  const [attribute, setAttribute] =
    useState<AttributeFilterValue>('all');

  const [role, setRole] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const counts = useMemo(() => {
    const result: Partial<Record<AttributeFilterValue, number>> = {
      all: heroes.length,
    };

    for (const hero of heroes) {
      result[hero.attribute] =
        (result[hero.attribute] ?? 0) + 1;
    }

    return result;
  }, [heroes]);

  const roles = useMemo(() => {
    const tally = new Map<string, number>();

    for (const hero of heroes) {
      for (const entry of hero.roles) {
        tally.set(
          entry,
          (tally.get(entry) ?? 0) + 1,
        );
      }
    }

    return [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [heroes]);

  const visibleHeroes = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return heroes.filter((hero) => {
      if (
        attribute !== 'all' &&
        hero.attribute !== attribute
      ) {
        return false;
      }

      if (role && !hero.roles.includes(role)) {
        return false;
      }

      if (
        needle &&
        !hero.name.toLowerCase().includes(needle)
      ) {
        return false;
      }

      return true;
    });
  }, [attribute, heroes, query, role]);

  const openHero = useCallback(
    (hero: Hero) =>
      navigation.navigate('HeroDetail', {
        heroId: hero.id,
      }),
    [navigation],
  );

  const clearFilters = () => {
    setAttribute('all');
    setRole(null);
    setQuery('');
  };

  const handleAttributeChange = (next: AttributeFilterValue) => {
    setAttribute(next);

    if (next === 'all') {
      setRole(null);
      setQuery('');
    }

    void refresh();
  };

  const handleRoleChange = (next: string | null) => {
    setRole(next);
    void refresh();
  };

  const toggleSearch = () => {
    setIsSearchOpen((open) => {
      if (open) {
        setQuery('');
      }

      return !open;
    });
  };

  return (
    <View style={styles.screen}>
      <BackgroundTexture />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Image
              source={require('../../assets/dota-header.png')}
              style={styles.titleLogo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Choose your hero</Text>
          </View>

          <Pressable
            onPress={toggleSearch}
            accessibilityLabel={
              isSearchOpen
                ? 'Close search'
                : 'Search heroes'
            }
            style={styles.searchButton}
          >
            {isSearchOpen ? (
              <Icon
                name="close"
                size={18}
                color="#F5F6F7"
              />
            ) : (
              <Icon
                name="magnify"
                size={18}
                color="#F5F6F7"
              />
            )}
          </Pressable>
        </View>

        {isSearchOpen && (
          <View style={styles.searchInner}>
            <HeroSearch
              value={query}
              onChange={setQuery}
              autoFocus
            />
          </View>
        )}
      </View>

      <View style={styles.filters}>
        <AttributeFilter
          value={attribute}
          onChange={handleAttributeChange}
          counts={counts}
        />

        {!isLoading && !error && (
          <RoleFilter
            roles={roles}
            value={role}
            onChange={handleRoleChange}
          />
        )}
      </View>

      <View style={styles.separator} />

      <View style={styles.status}>
        <Text style={styles.statusText}>
          {isLoading
            ? 'Loading roster'
            : `${visibleHeroes.length} ${
                visibleHeroes.length === 1
                  ? 'hero'
                  : 'heroes'
              }`}
        </Text>

        {isRefreshing && (
          <View style={styles.refreshing}>
            <Icon
              name="loading"
              size={14}
              color="#8B949E"
            />
            <Text style={styles.statusText}>
              Refreshing
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#E2543B"
            colors={['#E2543B']}
          />
        }
      >
        <View style={styles.youtubeSection}>
          <YoutubeVideosCard videos={youtubeVideos} loading={youtubeLoading} />
        </View>

        {isLoading && <HeroGridSkeleton />}

        {!isLoading && error && (
          <ErrorState onRetry={reload} />
        )}

        {!isLoading &&
          !error &&
          visibleHeroes.length === 0 &&
          heroes.length === 0 && (
            <EmptyState
              title="Roster is empty"
              message="The API returned no heroes. Verify the endpoint returns a hero collection."
              actionLabel="Reload"
              onAction={reload}
            />
          )}

        {!isLoading &&
          !error &&
          visibleHeroes.length === 0 &&
          heroes.length > 0 && (
            <EmptyState
              title="No heroes found"
              message={
                query.trim()
                  ? `Nothing matches “${query.trim()}”. Try another name or clear your filters.`
                  : 'No heroes match the current filters.'
              }
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}

        {!isLoading &&
          !error &&
          visibleHeroes.length > 0 && (
            <HeroGrid
              heroes={visibleHeroes}
              onSelect={openHero}
            />
          )}
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.addPulse,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
          },
          { bottom: insets.bottom + 22 },
        ]}
      />
      <Pressable
        onPress={() => navigation.navigate('HeroCreate')}
        accessibilityLabel="Add hero"
        style={[styles.addButton, { bottom: insets.bottom + 22 }]}
      >
        <Icon name="plus" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D1117',
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  titleLogo: {
    width: 168,
    height: 40,
  },

  subtitle: {
    color: '#8B949E',
    fontSize: 13,
    marginTop: 6,
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#30363D',
    backgroundColor: '#161B22',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2543B',
    borderWidth: 1,
    borderColor: '#FF9A86',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },

  addPulse: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E2543B',
  },

  searchInner: {
    marginTop: 14,
  },

  filters: {
    gap: 10,
    paddingBottom: 16,
  },

  separator: {
    height: 1,
    backgroundColor: '#30363D',
  },

  status: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusText: {
    color: '#6E7681',
    fontSize: 11,
    textTransform: 'uppercase',
  },

  refreshing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  youtubeSection: {
    marginBottom: 20,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

export default HeroBrowser;