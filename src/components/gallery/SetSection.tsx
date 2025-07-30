import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MediaSet, MediaItem } from '@/types/gallery';
import { getMediaItemsBySet } from '@/services/firestore';
import MediaCard from './MediaCard';
import MediaModal from './MediaModal';
import { Folder, Images } from 'lucide-react';

interface SetSectionProps {
  set: MediaSet;
}

const SetSection: React.FC<SetSectionProps> = ({ set }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMediaItems();
  }, [set.id]);

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      const items = await getMediaItemsBySet(set.id);
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const previewItems = isExpanded ? mediaItems : mediaItems.slice(0, 6);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        {/* Set Header */}
        <motion.div
          className="flex items-center justify-between mb-6 cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-warm rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {set.name}
              </h2>
              <p className="text-muted-foreground text-sm flex items-center space-x-1">
                <Images className="w-4 h-4" />
                <span>{set.mediaCount} {set.mediaCount === 1 ? 'item' : 'items'}</span>
              </p>
            </div>
          </div>
          
          {mediaItems.length > 6 && (
            <motion.button
              className="text-primary hover:text-primary-glow transition-colors font-medium text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? 'Show Less' : `Show All (${mediaItems.length})`}
            </motion.button>
          )}
        </motion.div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : mediaItems.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            {previewItems.map((media, index) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                layout
              >
                <MediaCard
                  media={media}
                  onClick={() => handleMediaClick(media)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Images className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No media in this set yet</p>
          </motion.div>
        )}
      </motion.section>

      {/* Media Modal */}
      <MediaModal
        media={selectedMedia}
        allMedia={mediaItems}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default SetSection;