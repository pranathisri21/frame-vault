
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMediaItemsBySet, updateMediaItem, deleteMediaItem } from '@/services/firestore';
import { MediaSet, MediaItem } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Lock, Globe, Trash2, Eye, Video, Image } from 'lucide-react';

interface AdminMediaViewProps {
  set: MediaSet;
  onMediaChanged: () => void;
}

const AdminMediaView: React.FC<AdminMediaViewProps> = ({ set, onMediaChanged }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMediaItems();
  }, [set.id]);

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      // Include both public and private media for admin view
      const items = await getMediaItemsBySet(set.id, true);
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyToggle = async (mediaId: string, currentPrivacy: boolean) => {
    try {
      await updateMediaItem(mediaId, { isPrivate: !currentPrivacy });
      await loadMediaItems();
      onMediaChanged();
      
      toast({
        title: "Privacy updated",
        description: `Media is now ${!currentPrivacy ? 'private' : 'public'}`,
      });
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast({
        title: "Failed to update privacy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (mediaId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteMediaItem(mediaId);
      await loadMediaItems();
      onMediaChanged();
      
      toast({
        title: "Media deleted",
        description: `"${title}" has been removed`,
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Failed to delete media",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg animate-pulse">
            <div className="w-16 h-16 bg-muted rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No media items in this set yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mediaItems.map((media) => (
        <motion.div
          key={media.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 p-4 gallery-card rounded-lg"
        >
          {/* Media Thumbnail */}
          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
            {media.type === 'image' ? (
              <img
                src={media.cloudinaryUrl}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Media Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium truncate">{media.title}</h4>
              <Badge variant={media.isPrivate ? "destructive" : "default"} className="text-xs">
                {media.isPrivate ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {media.type === 'image' ? 'Image' : 'Video'} • {media.createdAt.toLocaleDateString()}
            </p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {media.isPrivate ? 'Private' : 'Public'}
            </span>
            <Switch
              checked={!media.isPrivate}
              onCheckedChange={() => handlePrivacyToggle(media.id, media.isPrivate)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(media.cloudinaryUrl, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(media.id, media.title)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminMediaView;
