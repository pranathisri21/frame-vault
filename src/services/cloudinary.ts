import { CloudinaryUploadResponse } from '@/types/gallery';

const CLOUD_NAME = 'dv2kr09fy';
const UPLOAD_PRESET = 'PHOTO GALLERY';

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Determine resource type based on file type
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      resource_type: resourceType
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload media to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  // Note: Deletion from Cloudinary requires server-side implementation with API secret
  // This is a placeholder for the deletion functionality
  console.log(`Would delete ${resourceType} with public_id: ${publicId}`);
};