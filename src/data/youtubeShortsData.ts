export interface YouTubeShortItem {
  id: string;
  youtubeId: string;
  shortUrl: string;
  title: string;
  location: string;
  duration?: string;
  views?: string;
  customThumbnail?: string;
}

export const YOUTUBE_SHORTS_DATA: YouTubeShortItem[] = [
  {
    id: 'short-1',
    youtubeId: 'lFpL-9V_GgA',
    shortUrl: 'https://www.youtube.com/@ZAARATRAVELS',
    title: 'Taj Mahal Sunrise Experience with Zaara Travels',
    location: 'Agra, Uttar Pradesh',
    duration: '0:45',
    views: 'Zaara Travels Channel',
    customThumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'short-2',
    youtubeId: 'd621j38Wwms',
    shortUrl: 'https://www.youtube.com/@ZAARATRAVELS',
    title: 'Jaipur Amer Fort Royal Heritage Tour',
    location: 'Jaipur, Rajasthan',
    duration: '0:50',
    views: 'Zaara Travels Channel',
    customThumbnail: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'short-3',
    youtubeId: 'k6-7640Xf4A',
    shortUrl: 'https://www.youtube.com/@ZAARATRAVELS',
    title: 'Ranthambore Bengal Tiger Jungle Safari',
    location: 'Ranthambore, Rajasthan',
    duration: '0:58',
    views: 'Zaara Travels Channel',
    customThumbnail: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'short-4',
    youtubeId: 'bW2P2Z7N6J8',
    shortUrl: 'https://www.youtube.com/@ZAARATRAVELS',
    title: 'Varanasi Spiritual Ganga Aarti Evening Ghats',
    location: 'Varanasi, Uttar Pradesh',
    duration: '0:42',
    views: 'Zaara Travels Channel',
    customThumbnail: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'short-5',
    youtubeId: '712d2_J9dNo',
    shortUrl: 'https://www.youtube.com/@ZAARATRAVELS',
    title: 'Luxury AC Cab Golden Triangle Road Trip',
    location: 'Delhi • Agra • Jaipur',
    duration: '0:55',
    views: 'Zaara Travels Channel',
    customThumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  },
];

