import { useState, useEffect } from 'react';

interface LocationData {
  lat: number;
  lon: number;
  region: string;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setLocation({ lat: 0, lon: 0, region: 'Unknown' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          region: determineRegion(position.coords.latitude, position.coords.longitude),
        };
        setLocation(locationData);
        setLoading(false);
      },
      (err) => {
        console.warn('Location access denied:', err.message);
        setError(err.message);
        setLocation({ lat: 0, lon: 0, region: 'Unknown' });
        setLoading(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
      }
    );
  }, []);

  return { location, loading, error };
}

function determineRegion(lat: number, lon: number): string {
  if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) {
    return 'India';
  } else if (lat >= 25 && lat <= 49 && lon >= -125 && lon <= -66) {
    return 'USA';
  } else if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 40) {
    return 'Europe';
  } else if (lat >= -35 && lat <= -10 && lon >= -75 && lon <= -35) {
    return 'South America';
  } else if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 52) {
    return 'Africa';
  }
  return 'Unknown';
}

export function getDefaultLanguage(region: string): string {
  const languageMap: Record<string, string> = {
    India: 'en',
    USA: 'en',
    Europe: 'en',
    'South America': 'en',
    Africa: 'en',
    Unknown: 'en',
  };
  return languageMap[region] || 'en';
}
