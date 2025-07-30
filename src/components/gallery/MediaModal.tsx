import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface MediaModalProps {
  media: MediaItem | null;
  allMedia: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ media, allMedia, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (media && allMedia.length > 0) {
      const index = allMedia.findIndex(item => item.id === media.id);
      setCurrentIndex(index);
    }
  }, [media, allMedia]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allMedia.length]);

  const goToNext = () => {
    if (currentIndex < allMedia.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentMedia = allMedia[currentIndex];

  const handleVideoToggle = () => {
    const video = document.querySelector('#modal-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && currentMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation buttons */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={goToNext}
                  disabled={currentIndex === allMedia.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media content */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.cloudinaryUrl}
                  alt={currentMedia.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              ) : (
                <div className="relative">
                  <video
                    id="modal-video"
                    src={currentMedia.cloudinaryUrl}
                    className="w-full h-auto max-h-[80vh] object-contain"
                    controls
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />
                </div>
              )}
              
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-white text-xl font-semibold">{currentMedia.title}</h2>
                {allMedia.length > 1 && (
                  <p className="text-white/70 text-sm mt-1">
                    {currentIndex + 1} of {allMedia.length}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaModal;