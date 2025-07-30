import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createMediaSet } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { FolderPlus } from 'lucide-react';

interface CreateSetFormProps {
  onSetCreated: () => void;
}

const CreateSetForm: React.FC<CreateSetFormProps> = ({ onSetCreated }) => {
  const [setName, setSetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setName.trim()) return;

    setIsLoading(true);
    try {
      console.log('Attempting to create set:', setName.trim());
      const setId = await createMediaSet(setName.trim());
      console.log('Set created with ID:', setId);
      toast({
        title: "Set created successfully!",
        description: `"${setName}" is ready for media uploads.`,
      });
      setSetName('');
      onSetCreated();
    } catch (error: any) {
      console.error('Error creating set:', error);
      const errorMessage = error?.message || error?.code || 'Unknown error occurred';
      toast({
        title: "Failed to create set",
        description: `Error: ${errorMessage}. Check console for details.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="gallery-card border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderPlus className="w-5 h-5 text-primary" />
          <span>Create New Set</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <Label htmlFor="setName" className="sr-only">Set Name</Label>
            <Input
              id="setName"
              placeholder="Enter set name (e.g., Summer Vacation 2024)"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              disabled={isLoading}
              className="transition-all duration-200 focus:shadow-soft"
            />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={!setName.trim() || isLoading}
              className="gradient-warm border-0 text-primary-foreground shadow-soft hover:shadow-medium"
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateSetForm;