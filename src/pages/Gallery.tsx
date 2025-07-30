import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaSets } from '@/services/firestore';
import { MediaSet } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SetSection from '@/components/gallery/SetSection';
import { useToast } from '@/hooks/use-toast';
import { Camera, Search, Settings, LogOut, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sets, setSets] = useState<MediaSet[]>([]);
  const [filteredSets, setFilteredSets] = useState<MediaSet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSets();
  }, []);

  useEffect(() => {
    // Filter sets based on search query
    if (searchQuery.trim()) {
      const filtered = sets.filter(set =>
        set.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSets(filtered);
    } else {
      setFilteredSets(sets);
    }
  }, [sets, searchQuery]);

  const loadSets = async () => {
    try {
      setIsLoading(true);
      const mediaSets = await getMediaSets();
      setSets(mediaSets);
    } catch (error) {
      console.error('Error loading sets:', error);
      toast({
        title: "Failed to load gallery",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigateToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen gallery-bg">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 gradient-warm rounded-xl flex items-center justify-center shadow-soft">
                <Camera className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Personal Gallery
                </h1>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Heart className="w-3 h-3 mr-1 text-accent" />
                  Your precious memories
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">
                  {sets.length} {sets.length === 1 ? 'collection' : 'collections'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToAdmin}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Bar */}
      {sets.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="container mx-auto px-4 py-6"
        >
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 focus:bg-card transition-all duration-200"
            />
          </div>
        </motion.section>
      )}

      {/* Main Gallery Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            // Loading state
            <div className="space-y-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-6 bg-muted animate-pulse rounded w-32" />
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="aspect-square bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredSets.length > 0 ? (
            // Gallery content
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredSets.map((set, index) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SetSection set={set} />
                </motion.div>
              ))}
            </motion.div>
          ) : searchQuery ? (
            // No search results
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Search className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No collections found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or{' '}
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:text-primary-glow underline"
                >
                  view all collections
                </button>
              </p>
            </motion.div>
          ) : (
            // Empty state
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 gradient-warm rounded-full flex items-center justify-center mx-auto mb-6 shadow-medium">
                <Camera className="w-12 h-12 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Your gallery awaits</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start building your personal collection of memories by creating sets and uploading your favorite photos and videos.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={navigateToAdmin}
                  className="gradient-warm border-0 text-primary-foreground shadow-soft hover:shadow-medium"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Admin Panel
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Gallery;