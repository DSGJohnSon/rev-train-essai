'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPseudonym, setPseudonym } from '@/lib/local-storage';

interface SaveScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pseudonym: string) => Promise<void>;
}

export default function SaveScoreDialog({
  isOpen,
  onClose,
  onSave,
}: SaveScoreDialogProps) {
  const [pseudonym, setPseudonymValue] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Charger le pseudonyme sauvegardé
  useEffect(() => {
    if (isOpen) {
      const saved = getPseudonym();
      if (saved) {
        setPseudonymValue(saved);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Validation
    const trimmed = pseudonym.trim();

    if (!trimmed) {
      setError('Le pseudonyme ne peut pas être vide');
      return;
    }

    if (trimmed.length < 2) {
      setError('Le pseudonyme doit contenir au moins 2 caractères');
      return;
    }

    if (trimmed.length > 50) {
      setError('Le pseudonyme ne peut pas dépasser 50 caractères');
      return;
    }

    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
      setError(
        'Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'
      );
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Sauvegarder le pseudonyme dans localStorage
      setPseudonym(trimmed);

      // Appeler la fonction de sauvegarde du parent
      await onSave(trimmed);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sauvegarder votre score</DialogTitle>
          <DialogDescription>
            Entrez votre pseudonyme pour enregistrer votre performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pseudonym">Pseudonyme</Label>
            <Input
              id="pseudonym"
              placeholder="Entrez votre pseudonyme"
              value={pseudonym}
              onChange={(e) => {
                setPseudonymValue(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) {
                  handleSave();
                }
              }}
              maxLength={50}
              disabled={isSaving}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}