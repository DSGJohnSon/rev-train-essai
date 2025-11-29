'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RotateCcw, Clock, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react';
import { QuestionHistory } from '@/types/question';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface HistoryViewerProps {
  history: QuestionHistory[];
  currentVersion: number;
  onRestore: (version: number) => Promise<void>;
}

export function HistoryViewer({ history, currentVersion, onRestore }: HistoryViewerProps) {
  const [restoreVersion, setRestoreVersion] = useState<number | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (restoreVersion === null) return;

    setIsRestoring(true);
    try {
      await onRestore(restoreVersion);
      setRestoreVersion(null);
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'Création';
      case 'updated':
        return 'Modification';
      case 'deleted':
        return 'Suppression';
      default:
        return 'Changement';
    }
  };

  const getChangeTypeBadgeClass = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'updated':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'deleted':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (history.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-12 text-center">
          <p className="text-slate-400">Aucun historique disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {history.map((entry, index) => {
          const isCurrentVersion = entry.version === currentVersion;
          const snapshot = entry.snapshot as any;

          return (
            <Card
              key={entry._id}
              className={`border-slate-800 ${
                isCurrentVersion ? 'ring-2 ring-primary bg-slate-900/70' : 'bg-slate-900/50'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                      {getChangeTypeIcon(entry.changeType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        Version {entry.version}
                        {isCurrentVersion && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            Actuelle
                          </Badge>
                        )}
                        {entry.restoredFrom && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            Restaurée depuis v{entry.restoredFrom}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={getChangeTypeBadgeClass(entry.changeType)}
                        >
                          {getChangeTypeLabel(entry.changeType)}
                        </Badge>
                        <span className="text-sm text-slate-400">
                          {format(new Date(entry.changedAt), "dd MMMM yyyy 'à' HH:mm", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isCurrentVersion && entry.changeType !== 'deleted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreVersion(entry.version)}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restaurer
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">Titre : </span>
                    <span className="text-white">{snapshot.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Nombre de réponses : </span>
                    <span className="text-white">{snapshot.answers?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Réponses correctes : </span>
                    <span className="text-white">
                      {snapshot.correctAnswers?.join(', ') || 'N/A'}
                    </span>
                  </div>
                  {snapshot.illustration && (
                    <div>
                      <span className="text-slate-400">Illustration : </span>
                      <span className="text-green-400">Oui</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de confirmation de restauration */}
      <AlertDialog open={restoreVersion !== null} onOpenChange={() => setRestoreVersion(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la restauration
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Êtes-vous sûr de vouloir restaurer la version {restoreVersion} ? Cela créera une
              nouvelle version avec le contenu de la version sélectionnée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={isRestoring}
              className="bg-primary hover:bg-primary/90"
            >
              {isRestoring ? 'Restauration...' : 'Restaurer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}