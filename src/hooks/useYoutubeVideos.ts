import { useEffect, useState } from 'react';
import { searchYoutubeVideos, type YoutubeVideo } from '../api/youtube';

export function useYoutubeVideos(query = 'Dota 2') {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    searchYoutubeVideos(query).then((result) => {
      if (mounted) {
        setVideos(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [query]);

  return { videos, loading };
}