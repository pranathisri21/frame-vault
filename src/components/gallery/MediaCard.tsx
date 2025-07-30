import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MediaItem } from '@/types/gallery';
import { Play, Pause } from 'lucide-react';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleVideoToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = e.target as HTMLVideoElement;
    if (isVideoPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="gallery-item gallery-card rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        {media.type === 'image' ? (
          <img
            src={media.cloudinaryUrl}
            alt={media.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={media.cloudinaryUrl}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoadedData={() => setIsLoaded(true)}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onClick={handleVideoToggle}
              muted
              loop
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-black/50 rounded-full p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={handleVideoToggle}
              >
                {isVideoPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </motion.button>
            </div>
          </div>
        )}
        
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 gallery-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-medium text-sm truncate">{media.title}</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;