
export interface MediaSet {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  mediaCount: number;
}

export interface MediaItem {
  id: string;
  title: string;
  cloudinaryUrl: string;
  type: 'image' | 'video';
  setId: string;
  createdAt: Date;
  publicId: string; // Cloudinary public ID for management
  isPrivate: boolean; // New privacy field
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
}
