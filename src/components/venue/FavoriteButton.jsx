import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { User } from '@/api/entities';
import { Favorite } from '@/api/entities';
import { toast } from 'sonner';

export default function FavoriteButton({ entityType, entityId, className = "" }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const currentUser = await User.me();
      const favorites = await Favorite.filter({
        user_id: currentUser.id,
        entity_type: entityType,
        entity_id: entityId
      });
      setIsFavorited(favorites.length > 0);
    } catch (error) {
      // User not logged in or error - ignore
    }
  }, [entityType, entityId]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      
      if (isFavorited) {
        // Remove favorite
        const favorites = await Favorite.filter({
          user_id: currentUser.id,
          entity_type: entityType,
          entity_id: entityId
        });
        if (favorites.length > 0) {
          await Favorite.delete(favorites[0].id);
        }
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        // Add favorite
        await Favorite.create({
          user_id: currentUser.id,
          entity_type: entityType,
          entity_id: entityId
        });
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Please sign in to save favorites');
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${className} hover:bg-red-50`}
    >
      <Heart 
        className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
      />
    </Button>
  );
}