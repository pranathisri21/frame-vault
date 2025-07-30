import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaSets } from '@/services/firestore';
import { MediaSet } from '@/types/gallery';
import { Button } from '@/components/ui/button';
import CreateSetForm from '@/components/admin/CreateSetForm';
import MediaUpload from '@/components/admin/MediaUpload';
import AdminSetManager from '@/components/admin/AdminSetManager';
import { useToast } from '@/hooks/use-toast';
import { Settings, LogOut, Camera, Upload, FolderPlus } from 'lucide-react';

const Admin = () => {
  const { user, logout } = useAuth();
  const [sets, setSets] = useState<MediaSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      setIsLoading(true);
      const mediaSets = await getMediaSets();
      setSets(mediaSets);
    } catch (error) {
      console.error('Error loading sets:', error);
      toast({
        title: "Failed to load sets",
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
        description: "You've been signed out of the admin panel.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-warm rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your photo and video gallery
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateSetForm onSetCreated={loadSets} />
              {sets.length > 0 && (
                <MediaUpload sets={sets} onMediaUploaded={loadSets} />
              )}
            </div>
          </motion.section>

          {/* Sets Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Manage Sets
                </h2>
                <p className="text-muted-foreground mt-1">
                  {sets.length} {sets.length === 1 ? 'set' : 'sets'} created
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="gallery-card rounded-lg p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AdminSetManager sets={sets} onSetsChanged={loadSets} />
            )}
          </motion.section>

          {/* Instructions for new users */}
          {sets.length === 0 && !isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 gradient-warm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Welcome to Your Gallery Admin</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first set to organize your photos and videos.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create sets to organize media
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload photos and videos
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;