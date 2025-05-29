'use client';

import { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { XCircle, UploadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ImageUploadProps {
  onFilesChange: (files: FileList | null) => void; // Or specific URL handling
  existingImageUrls?: string[];
  onRemoveExistingImage?: (url: string) => void; // Callback to handle removal of existing images
  maxFiles?: number;
  maxFileSizeMB?: number;
}

export function ImageUpload({ 
  onFilesChange, 
  existingImageUrls = [],
  onRemoveExistingImage,
  maxFiles = 5,
  maxFileSizeMB = 5
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // This component does not handle the actual upload logic, just file selection & preview
  // The parent component will handle uploading with `uploadMultipleFiles` from `lib/firebase/storage.ts`

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
      if (selectedFiles.length + files.length + existingImageUrls.length > maxFiles) {
        setError(`No puedes seleccionar más de ${maxFiles} imágenes en total.`);
        return;
      }

      const newFilesArray: File[] = Array.from(files);
      const validNewFiles: File[] = [];
      const newPreviewUrls: string[] = [];

      for (const file of newFilesArray) {
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          setError(`El archivo ${file.name} es demasiado grande (máx. ${maxFileSizeMB}MB).`);
          continue; // Skip this file
        }
        validNewFiles.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }
      
      const updatedSelectedFiles = [...selectedFiles, ...validNewFiles];
      setSelectedFiles(updatedSelectedFiles);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

      // Create a new FileList for the parent
      const dataTransfer = new DataTransfer();
      updatedSelectedFiles.forEach(file => dataTransfer.items.add(file));
      onFilesChange(dataTransfer.files.length > 0 ? dataTransfer.files : null);
    }
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);

    const dataTransfer = new DataTransfer();
    updatedFiles.forEach(file => dataTransfer.items.add(file));
    onFilesChange(dataTransfer.files.length > 0 ? dataTransfer.files : null);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-muted transition-colors">
          <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Haz clic para subir o arrastra imágenes</p>
          <p className="text-xs text-muted-foreground">(Máx. {maxFiles} imágenes, {maxFileSizeMB}MB por imagen)</p>
        </div>
      </Label>
      <Input 
        id="image-upload" 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      
      {(existingImageUrls.length > 0 || previewUrls.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {existingImageUrls.map((url, index) => (
            <div key={`existing-${index}`} className="relative group aspect-square">
              <Image src={url} alt={`Imagen existente ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
              {onRemoveExistingImage && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveExistingImage(url)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {previewUrls.map((url, index) => (
            <div key={`new-${index}`} className="relative group aspect-square">
              <Image src={url} alt={`Nueva imagen ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeNewImage(index)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
