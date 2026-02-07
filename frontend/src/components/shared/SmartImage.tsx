import React, { useState, useEffect } from 'react';
import { getGooglePlacePhotos } from '@/api/functions';

export default function SmartImage({
  item,
  type = 'venue',
  className = "w-full h-48 object-cover",
  alt = "Image"
}) {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [attemptedSources, setAttemptedSources] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const tryLoadImage = async () => {
      if (!isMounted) return;

      // Get Street View URL immediately as fallback
      const address = type === 'venue' 
        ? `${item?.address || item?.name}, ${item?.city || ''}, ${item?.state || ''}`
        : `${item?.name}, ${item?.city || ''}, ${item?.state || ''}`;
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodeURIComponent(address)}&key=AIzaSyBXvk9uBP6Z_6rVP9YWr4FQ3z7vYYx5qY4`;

      // Try existing photos first
      const existingUrls = [
        type === 'venue' ? item?.hero_photo_url : item?.photo_url,
        item?.image_url,
        item?.photo_url,
        ...(item?.gallery_urls || []),
        ...(item?.photos || []),
        ...(item?.portfolio_photos || [])
      ].filter(url => url && typeof url === 'string' && url.startsWith('http'));

      if (existingUrls.length > 0 && isMounted) {
        setCurrentSrc(existingUrls[0]);
        setAttemptedSources([existingUrls[0], streetViewUrl]);
        return;
      }

      // Try Google Places
      if (item?.name && item?.city && isMounted) {
        try {
          const location = type === 'venue' 
            ? `${item.address || item.name}, ${item.city}, ${item.state || ''}`
            : `${item.name}, ${item.city}, ${item.state || ''}`;
          
          const result = await getGooglePlacePhotos({
            place_id: item.google_place_id || null,
            name: item.name,
            location: location
          });
          
          const photos = result?.data?.photos || (result as any)?.photos || [];
          
          if (photos.length > 0 && isMounted) {
            setCurrentSrc(photos[0]);
            setAttemptedSources([photos[0], streetViewUrl]);
            return;
          }
        } catch (error) {
          console.log(`Google photos unavailable for ${item?.name}`);
        }
      }

      // Use Street View
      if (isMounted) {
        setCurrentSrc(streetViewUrl);
        setAttemptedSources([streetViewUrl]);
      }
    };

    tryLoadImage();

    return () => {
      isMounted = false;
    };
  }, [item?.id, type]);

  const handleError = () => {
    const currentIndex = attemptedSources.indexOf(currentSrc);
    if (currentIndex < attemptedSources.length - 1) {
      setCurrentSrc(attemptedSources[currentIndex + 1]);
    } else {
      // All sources failed - show business name fallback
      setCurrentSrc(null);
    }
  };

  return (
    <div className={`${className} relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500`} style={{ minHeight: '192px' }}>
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt || item?.name || 'Image'}
          className={className}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-white text-2xl font-semibold mb-2">
              {item?.name || 'Business'}
            </div>
            {item?.city && (
              <div className="text-white/80 text-sm">
                {item.city}, {item.state}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}