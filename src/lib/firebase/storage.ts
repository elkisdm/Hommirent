import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

// Upload a single file
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileId = uuidv4();
  const fileRef = ref(storage, `${path}/${fileId}-${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

// Upload multiple files
export const uploadMultipleFiles = async (files: FileList, path: string): Promise<string[]> => {
  const uploadPromises = Array.from(files).map(file => uploadFile(file, path));
  return Promise.all(uploadPromises);
};

// Delete a file by its download URL
export const deleteFileByUrl = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error: any) {
    // Handle specific errors, e.g., if the file doesn't exist
    if (error.code === 'storage/object-not-found') {
      console.warn('File not found for deletion, may have already been deleted:', fileUrl);
    } else {
      console.error('Error deleting file:', error);
      throw error; // Re-throw other errors
    }
  }
};

// Helper to get file path from URL (might need adjustment based on your storage structure)
// This is a simplified example and might not be robust for all URL formats.
// export const getPathFromUrl = (url: string): string | null => {
//   try {
//     const urlObject = new URL(url);
//     // Firebase Storage URLs usually look like:
//     // https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/PATH_TO_FILE?alt=media&token=TOKEN
//     // We need to extract PATH_TO_FILE
//     const regex = /o\/(.+)\?alt=media/;
//     const match = urlObject.pathname.match(regex);
//     if (match && match[1]) {
//       return decodeURIComponent(match[1]);
//     }
//     return null;
//   } catch (error) {
//     console.error("Invalid URL for getPathFromUrl:", url, error);
//     return null;
//   }
// };

// Ensure uuid is installed: npm install uuid
// and @types/uuid for TypeScript: npm install --save-dev @types/uuid
// (uuid is a common library for generating unique IDs)
// Alternatively, use crypto.randomUUID() if your environment supports it and you prefer no external deps.
