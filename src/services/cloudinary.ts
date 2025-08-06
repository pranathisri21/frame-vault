import { CloudinaryUploadResponse } from '@/types/gallery';

const CLOUD_NAME = 'dv2kr09fy';
const UPLOAD_PRESET = 'PHOTO GALLERY';

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  console.log('🔄 Starting Cloudinary upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
  console.log('📊 Upload config - Cloud Name:', CLOUD_NAME, 'Upload Preset:', UPLOAD_PRESET);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Determine resource type based on file type
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  console.log('📁 Resource type determined:', resourceType);
  
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  console.log('🌐 Upload URL:', uploadUrl);
  
  try {
    console.log('⬆️ Making fetch request to Cloudinary...');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log('📥 Cloudinary response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary error response:', errorText);
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Cloudinary upload successful:', {
      public_id: data.public_id,
      secure_url: data.secure_url,
      resource_type: resourceType
    });
    
    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      resource_type: resourceType
    };
  } catch (error) {
    console.error('💥 Cloudinary upload error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to upload media to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  // Note: Deletion from Cloudinary requires server-side implementation with API secret
  // This is a placeholder for the deletion functionality
  console.log(`Would delete ${resourceType} with public_id: ${publicId}`);
};