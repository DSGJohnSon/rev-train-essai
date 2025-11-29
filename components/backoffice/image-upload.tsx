'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  folder?: 'questions' | 'answers';
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = 'questions',
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validation côté client
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux. Taille maximum : 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.data.url);
        const sizeKB = (data.data.size / 1024).toFixed(2);
        toast.success(`Image uploadée avec succès (${sizeKB}KB)`);
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        // Preview de l'image
        <Card className="relative overflow-hidden border-slate-800 bg-slate-900/50">
          <div className="relative aspect-video w-full">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Supprimer l'image</span>
          </Button>
        </Card>
      ) : (
        // Zone d'upload
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative rounded-lg border-2 border-dashed transition-colors
            ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 bg-slate-900/50'
            }
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2 p-8">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-slate-400">Optimisation en cours...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-slate-800 p-3">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {isDragging ? 'Déposez l\'image ici' : 'Cliquez ou glissez une image'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    JPG, PNG, WebP ou GIF (max 5MB)
                  </p>
                  <p className="text-xs text-slate-500">
                    L'image sera optimisée en WebP (&lt; 20KB)
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}