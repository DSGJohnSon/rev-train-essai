import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;
const TARGET_SIZE_KB = 20;
const INITIAL_QUALITY = 80;

interface OptimizeImageOptions {
  buffer: Buffer;
  folder: 'questions' | 'answers';
  originalName: string;
}

interface OptimizeImageResult {
  path: string;
  url: string;
  size: number;
}

/**
 * Optimise une image et la sauvegarde dans le dossier spécifié
 * - Conversion en WebP
 * - Resize max 1200x800
 * - Compression jusqu'à 20KB max
 */
export async function optimizeImage({
  buffer,
  folder,
  originalName,
}: OptimizeImageOptions): Promise<OptimizeImageResult> {
  try {
    // Créer le dossier de destination s'il n'existe pas
    const folderPath = path.join(UPLOAD_DIR, folder);
    await fs.mkdir(folderPath, { recursive: true });

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const ext = '.webp';
    const filename = `${timestamp}-${randomString}${ext}`;
    const filepath = path.join(folderPath, filename);

    // Obtenir les métadonnées de l'image
    const metadata = await sharp(buffer).metadata();

    // Calculer les nouvelles dimensions en conservant le ratio
    let width = metadata.width || MAX_WIDTH;
    let height = metadata.height || MAX_HEIGHT;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Fonction pour optimiser avec une qualité donnée
    const optimizeWithQuality = async (quality: number): Promise<Buffer> => {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
    };

    // Optimiser l'image
    let quality = INITIAL_QUALITY;
    let optimizedBuffer = await optimizeWithQuality(quality);
    let sizeKB = optimizedBuffer.length / 1024;

    // Réduire la qualité si l'image est trop lourde
    while (sizeKB > TARGET_SIZE_KB && quality > 20) {
      quality -= 5;
      optimizedBuffer = await optimizeWithQuality(quality);
      sizeKB = optimizedBuffer.length / 1024;
    }

    // Sauvegarder l'image optimisée
    await fs.writeFile(filepath, optimizedBuffer);

    // Retourner le chemin relatif pour l'URL
    const url = `/uploads/${folder}/${filename}`;

    console.log(
      `✅ Image optimized: ${originalName} -> ${filename} (${sizeKB.toFixed(2)}KB, quality: ${quality})`
    );

    return {
      path: filepath,
      url,
      size: optimizedBuffer.length,
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Erreur lors de l\'optimisation de l\'image');
  }
}

/**
 * Supprime une image du système de fichiers
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extraire le chemin depuis l'URL
    const filepath = path.join(process.cwd(), 'public', url);
    
    // Vérifier si le fichier existe
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      console.log(`✅ Image deleted: ${url}`);
    } catch (error) {
      // Le fichier n'existe pas, on ignore l'erreur
      console.log(`ℹ️  Image not found: ${url}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // On ne throw pas d'erreur pour ne pas bloquer la suppression de l'entité
  }
}

/**
 * Valide qu'un fichier est une image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Taille maximum : 5MB.',
    };
  }

  return { valid: true };
}