'use client';

import { useState, useEffect } from 'react';
import { User, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPseudonym, setPseudonym } from '@/lib/local-storage';

interface PseudonymHeaderProps {
  autoOpen?: boolean;
}

export default function PseudonymHeader({ autoOpen = false }: PseudonymHeaderProps) {
  const [pseudonym, setPseudonymState] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Charger le pseudonyme au montage
  useEffect(() => {
    const saved = getPseudonym();
    setPseudonymState(saved);
    if (saved) {
      setInputValue(saved);
    } else if (autoOpen) {
      // Ouvrir automatiquement si pas de pseudonyme et autoOpen est true
      setIsDialogOpen(true);
    }
  }, [autoOpen]);

  const handleSave = () => {
    // Validation
    const trimmed = inputValue.trim();
    
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
      setError('Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, tirets et underscores');
      return;
    }

    // Sauvegarder
    setPseudonym(trimmed);
    setPseudonymState(trimmed);
    setIsDialogOpen(false);
    setError('');
  };

  const handleOpenDialog = () => {
    setInputValue(pseudonym || '');
    setError('');
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenDialog}
        className="gap-2"
        title={pseudonym ? `Pseudonyme: ${pseudonym}` : 'Définir un pseudonyme'}
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline max-w-[120px] truncate">
          {pseudonym || 'Pseudonyme'}
        </span>
        {pseudonym && <Edit2 className="h-3 w-3 hidden md:inline" />}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pseudonym ? 'Modifier votre pseudonyme' : 'Définir votre pseudonyme'}
            </DialogTitle>
            <DialogDescription>
              {pseudonym 
                ? 'Vous pouvez modifier votre pseudonyme.'
                : 'Votre pseudonyme sera utilisé pour sauvegarder vos scores et sera mémorisé pour vos prochaines sessions.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pseudonym">Pseudonyme</Label>
              <Input
                id="pseudonym"
                placeholder="Entrez votre pseudonyme"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
                maxLength={50}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}