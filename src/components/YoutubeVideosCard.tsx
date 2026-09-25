import React from 'react';
import {
  View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { Icon } from './Icon';
import { formatRelativeTime, type YoutubeVideo } from '../api/youtube';

interface Props {
  videos: YoutubeVideo[];
  loading: boolean;
}

function VideoCard({ video }: { video: YoutubeVideo }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(video.videoUrl)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.thumbWrap}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} />
        <View style={styles.playBadge}>
          <Icon name="play" size={14} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {video.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {video.channelTitle} · {formatRelativeTime(video.publishedAt)}
      </Text>
    </Pressable>
  );
}

export function YoutubeVideosCard({ videos, loading }: Props) {
  if (loading) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator color="#E2543B" size="small" />
      </View>
    );
  }

  if (videos.length === 0) return null;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>DOTA 2 VIDEOS</Text>
        <Text style={styles.source}>via YouTube</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    color: '#F5F6F7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  source: {
    color: '#6E7681',
    fontSize: 10,
    fontStyle: 'italic',
  },
  row: {
    gap: 12,
  },
  card: {
    width: 200,
  },
  cardPressed: {
    opacity: 0.7,
  },
  thumbWrap: {
    width: 200,
    height: 112,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F5F6F7',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 8,
  },
  meta: {
    color: '#8B949E',
    fontSize: 11,
    marginTop: 3,
  },
});