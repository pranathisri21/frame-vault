import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MediaSet, MediaItem } from '@/types/gallery';
import { getMediaItemsBySet, deleteMediaSet, deleteMediaItem, updateMediaSet } from '@/services/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Folder, 
  Images, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronRight,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface AdminSetManagerProps {
  sets: MediaSet[];
  onSetsChanged: () => void;
}

const AdminSetManager: React.FC<AdminSetManagerProps> = ({ sets, onSetsChanged }) => {
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
  const [setMedia, setSetMedia] = useState<{ [setId: string]: MediaItem[] }>({});
  const [loadingMedia, setLoadingMedia] = useState<Set<string>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleSetExpansion = async (setId: string) => {
    const newExpanded = new Set(expandedSets);
    
    if (newExpanded.has(setId)) {
      newExpanded.delete(setId);
    } else {
      newExpanded.add(setId);
      
      // Load media items if not already loaded
      if (!setMedia[setId]) {
        setLoadingMedia(prev => new Set(prev).add(setId));
        try {
          const items = await getMediaItemsBySet(setId);
          setSetMedia(prev => ({ ...prev, [setId]: items }));
        } catch (error) {
          console.error('Error loading media items:', error);
          toast({
            title: "Failed to load media",
            description: "Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoadingMedia(prev => {
            const newSet = new Set(prev);
            newSet.delete(setId);
            return newSet;
          });
        }
      }
    }
    
    setExpandedSets(newExpanded);
  };

  const handleDeleteSet = async (set: MediaSet) => {
    if (!confirm(`Are you sure you want to delete "${set.name}" and all its media? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMediaSet(set.id);
      toast({
        title: "Set deleted",
        description: `"${set.name}" has been deleted successfully.`,
      });
      onSetsChanged();
      
      // Remove from local state
      setSetMedia(prev => {
        const newState = { ...prev };
        delete newState[set.id];
        return newState;
      });
      setExpandedSets(prev => {
        const newSet = new Set(prev);
        newSet.delete(set.id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({
        title: "Failed to delete set",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMediaItem = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      await deleteMediaItem(item.id);
      toast({
        title: "Media deleted",
        description: `"${item.title}" has been deleted.`,
      });
      
      // Update local state
      setSetMedia(prev => ({
        ...prev,
        [item.setId]: prev[item.setId]?.filter(media => media.id !== item.id) || []
      }));
      
      onSetsChanged(); // Refresh sets to update media count
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Failed to delete media",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      {sets.length === 0 ? (
        <Card className="gallery-card border-0 shadow-soft">
          <CardContent className="text-center py-12">
            <Folder className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No sets created yet. Create your first set above.</p>
          </CardContent>
        </Card>
      ) : (
        sets.map((set) => (
          <motion.div
            key={set.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className="gallery-card border-0 shadow-soft overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleSetExpansion(set.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {expandedSets.has(set.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className="w-8 h-8 gradient-warm rounded-lg flex items-center justify-center">
                        <Folder className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{set.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Images className="w-3 h-3 mr-1" />
                          {set.mediaCount} items
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {set.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSet(set);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedSets.has(set.id) && (
                <CardContent>
                  {loadingMedia.has(set.id) ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : setMedia[set.id]?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {setMedia[set.id].map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                            {item.type === 'image' ? (
                              <img
                                src={item.cloudinaryUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={item.cloudinaryUrl}
                                className="w-full h-full object-cover"
                                muted
                              />
                            )}
                            
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMediaItem(item)}
                                disabled={deletingItems.has(item.id)}
                                className="text-white hover:text-destructive hover:bg-white/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Media type indicator */}
                            <div className="absolute top-2 right-2">
                              {item.type === 'video' ? (
                                <Video className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {item.title}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Images className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No media in this set</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default AdminSetManager;