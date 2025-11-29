'use client';

import { useState, useEffect } from 'react';
import { User, X, Edit2 } from 'lucide-react';
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
import { getPseudonym, setPseudonym, clearPseudonym } from '@/lib/local-storage';

interface PseudonymManagerProps {
  onPseudonymChange?: (pseudonym: string | null) => void;
}

export default function PseudonymManager({ onPseudonymChange }: PseudonymManagerProps) {
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
    }
  }, []);

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
    
    if (onPseudonymChange) {
      onPseudonymChange(trimmed);
    }
  };

  const handleClear = () => {
    clearPseudonym();
    setPseudonymState(null);
    setInputValue('');
    setIsDialogOpen(false);
    setError('');
    
    if (onPseudonymChange) {
      onPseudonymChange(null);
    }
  };

  const handleOpenDialog = () => {
    setInputValue(pseudonym || '');
    setError('');
    setIsDialogOpen(true);
  };

  if (!pseudonym) {
    return (
      <>
        <Button
          onClick={handleOpenDialog}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <User className="h-5 w-5" />
          Définir mon pseudonyme
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Définir votre pseudonyme</DialogTitle>
              <DialogDescription>
                Votre pseudonyme sera utilisé pour sauvegarder vos scores et sera mémorisé pour vos prochaines sessions.
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

  return (
    <>
      <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
        <User className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Bienvenue,</p>
          <p className="font-semibold">{pseudonym}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenDialog}
          className="gap-1"
        >
          <Edit2 className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier votre pseudonyme</DialogTitle>
            <DialogDescription>
              Vous pouvez modifier votre pseudonyme ou le supprimer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pseudonym-edit">Pseudonyme</Label>
              <Input
                id="pseudonym-edit"
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleClear}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Supprimer le pseudonyme
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}