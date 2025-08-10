import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMediaItemsBySet } from '@/services/firestore';
import { MediaSet, MediaItem } from '@/types/gallery';
import MediaCard from './MediaCard';
import MediaModal from './MediaModal';
import { Eye, EyeOff, Calendar, Image, Video } from 'lucide-react';

interface SetSectionProps {
  set: MediaSet;
}

const SetSection: React.FC<SetSectionProps> = ({ set }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    loadMediaItems();
  }, [set.id]);

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading media items for set:', set.name, 'ID:', set.id);
      
      // Only load public media items for the main gallery
      const items = await getMediaItemsBySet(set.id, false);
      console.log('📸 Loaded public media items:', items.length);
      
      setMediaItems(items);
    } catch (error) {
      console.error('💥 Error loading media items for set:', set.name, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  return (
    <motion.section className="space-y-6">
      {/* Set Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{set.name}</h2>
          <p className="text-sm text-muted-foreground">
            {set.mediaCount} {set.mediaCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {mediaItems.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onClick={() => handleMediaClick(media)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <EyeOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">No media in this set</p>
        </div>
      )}

      {/* Media Modal */}
      {selectedMedia && (
        <MediaModal media={selectedMedia} onClose={handleCloseModal} />
      )}
    </motion.section>
  );
};

export default SetSection;
