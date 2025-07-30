import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadToCloudinary } from '@/services/cloudinary';
import { createMediaItem } from '@/services/firestore';
import { MediaSet } from '@/types/gallery';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileImage, FileVideo, X } from 'lucide-react';

interface MediaUploadProps {
  sets: MediaSet[];
  onMediaUploaded: () => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ sets, onMediaUploaded }) => {
  const [selectedSetId, setSelectedSetId] = useState('');
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi']
    },
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedSetId || files.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a set and add files to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const successfulUploads: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}-${i}`;
        
        try {
          setUploadProgress(prev => ({ ...prev, [fileKey]: 20 }));
          
          // Upload to Cloudinary
          const cloudinaryResponse = await uploadToCloudinary(file);
          
          setUploadProgress(prev => ({ ...prev, [fileKey]: 70 }));
          
          // Save to Firestore
          const mediaTitle = title || file.name.split('.')[0];
          await createMediaItem({
            title: `${mediaTitle}${files.length > 1 ? ` (${i + 1})` : ''}`,
            cloudinaryUrl: cloudinaryResponse.secure_url,
            type: cloudinaryResponse.resource_type,
            setId: selectedSetId,
            publicId: cloudinaryResponse.public_id
          });
          
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          successfulUploads.push(file.name);
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: `Failed to upload ${file.name}`,
            description: "Please try again.",
            variant: "destructive",
          });
        }
      }

      if (successfulUploads.length > 0) {
        toast({
          title: "Upload successful!",
          description: `${successfulUploads.length} ${successfulUploads.length === 1 ? 'file' : 'files'} uploaded successfully.`,
        });
        
        // Reset form
        setFiles([]);
        setTitle('');
        setUploadProgress({});
        onMediaUploaded();
      }
      
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="gallery-card border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-primary" />
          <span>Upload Media</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Set Selection */}
        <div className="space-y-2">
          <Label htmlFor="setSelect">Select Set</Label>
          <Select value={selectedSetId} onValueChange={setSelectedSetId}>
            <SelectTrigger id="setSelect">
              <SelectValue placeholder="Choose a set for your media" />
            </SelectTrigger>
            <SelectContent>
              {sets.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name} ({set.mediaCount} items)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            placeholder="Media title (will use filename if empty)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
          />
        </div>

        {/* File Upload Area */}
        <div className="space-y-3">
          <Label>Files</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} disabled={isUploading} />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            {isDragActive ? (
              <p className="text-primary font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-foreground font-medium mb-1">
                  Click to select files or drag and drop
                </p>
                <p className="text-muted-foreground text-sm">
                  Images: JPEG, PNG, GIF, WebP • Videos: MP4, WebM, MOV, AVI
                </p>
              </div>
            )}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({files.length})</Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, index) => {
                const fileKey = `${file.name}-${index}`;
                const progress = uploadProgress[fileKey] || 0;
                const isVideo = file.type.startsWith('video/');
                
                return (
                  <motion.div
                    key={fileKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {isVideo ? (
                      <FileVideo className="w-5 h-5 text-accent flex-shrink-0" />
                    ) : (
                      <FileImage className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {isUploading && progress > 0 && (
                        <div className="w-full bg-border rounded-full h-1.5 mt-1">
                          <div 
                            className="gradient-warm h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleUpload}
            disabled={!selectedSetId || files.length === 0 || isUploading}
            className="w-full gradient-warm border-0 text-primary-foreground shadow-soft hover:shadow-medium"
          >
            {isUploading ? `Uploading... (${Object.keys(uploadProgress).length}/${files.length})` : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default MediaUpload;