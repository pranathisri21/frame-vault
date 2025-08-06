import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MediaSet, MediaItem } from '@/types/gallery';

// Collections
const SETS_COLLECTION = 'mediaSets';
const MEDIA_COLLECTION = 'mediaItems';

// Media Sets
export const createMediaSet = async (name: string): Promise<string> => {
  try {
    console.log('Creating media set with name:', name);
    console.log('Firebase DB instance:', db);
    
    const setData = {
      name,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      mediaCount: 0
    };
    
    console.log('Set data to be created:', setData);
    const docRef = await addDoc(collection(db, SETS_COLLECTION), setData);
    console.log('Set created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Detailed error creating set:', error);
    throw error;
  }
};

export const getMediaSets = async (): Promise<MediaSet[]> => {
  try {
    console.log('Fetching media sets from collection:', SETS_COLLECTION);
    const q = query(collection(db, SETS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('Found', querySnapshot.docs.length, 'sets');
    const sets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as MediaSet[];
    
    console.log('Processed sets:', sets);
    return sets;
  } catch (error) {
    console.error('Detailed error fetching sets:', error);
    throw error;
  }
};

export const updateMediaSet = async (setId: string, updates: Partial<MediaSet>): Promise<void> => {
  const setRef = doc(db, SETS_COLLECTION, setId);
  await updateDoc(setRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteMediaSet = async (setId: string): Promise<void> => {
  // First delete all media items in the set
  const mediaItems = await getMediaItemsBySet(setId);
  await Promise.all(mediaItems.map(item => deleteMediaItem(item.id)));
  
  // Then delete the set
  const setRef = doc(db, SETS_COLLECTION, setId);
  await deleteDoc(setRef);
};

// Media Items
export const createMediaItem = async (mediaData: Omit<MediaItem, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log('🔄 Creating media item with data:', mediaData);
    console.log('🗂️ Target collection:', MEDIA_COLLECTION);
    
    const itemData = {
      ...mediaData,
      createdAt: Timestamp.now()
    };
    
    console.log('📝 Final item data to save:', itemData);
    
    const docRef = await addDoc(collection(db, MEDIA_COLLECTION), itemData);
    console.log('✅ Media item created successfully with ID:', docRef.id);
    
    // Update media count in the set
    console.log('🔄 Updating media count for set:', mediaData.setId);
    const setMediaItems = await getMediaItemsBySet(mediaData.setId);
    console.log('📊 Current media count in set:', setMediaItems.length);
    
    await updateMediaSet(mediaData.setId, { 
      mediaCount: setMediaItems.length + 1 
    });
    console.log('✅ Media count updated successfully');
    
    return docRef.id;
  } catch (error) {
    console.error('💥 Error creating media item:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const getMediaItemsBySet = async (setId: string): Promise<MediaItem[]> => {
  const q = query(
    collection(db, MEDIA_COLLECTION), 
    where('setId', '==', setId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as MediaItem[];
};

export const getAllMediaItems = async (): Promise<MediaItem[]> => {
  const q = query(collection(db, MEDIA_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as MediaItem[];
};

export const updateMediaItem = async (itemId: string, updates: Partial<MediaItem>): Promise<void> => {
  const itemRef = doc(db, MEDIA_COLLECTION, itemId);
  await updateDoc(itemRef, updates);
};

export const deleteMediaItem = async (itemId: string): Promise<void> => {
  const itemRef = doc(db, MEDIA_COLLECTION, itemId);
  await deleteDoc(itemRef);
};