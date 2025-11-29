'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from './image-upload';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Answer, AnswerId, AnswerType } from '@/types/question';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ANSWER_IDS: AnswerId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

interface AnswerBuilderProps {
  value: Answer[];
  onChange: (answers: Answer[]) => void;
  disabled?: boolean;
}

export function AnswerBuilder({ value, onChange, disabled = false }: AnswerBuilderProps) {
  const answers = value;

  const addAnswer = () => {
    if (answers.length >= 6) {
      return;
    }

    const nextId = ANSWER_IDS[answers.length];
    const newAnswer: Answer = {
      id: nextId,
      type: 'text',
      text: '',
      isCorrect: false,
    };

    onChange([...answers, newAnswer]);
  };

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) {
      return;
    }

    const newAnswers = answers.filter((_, i) => i !== index);
    // Réassigner les IDs
    const reindexed = newAnswers.map((answer, i) => ({
      ...answer,
      id: ANSWER_IDS[i],
    }));
    onChange(reindexed);
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    onChange(newAnswers);
  };

  const updateAnswerType = (index: number, type: AnswerType) => {
    const newAnswers = [...answers];
    const answer = { ...newAnswers[index], type };

    // Nettoyer les champs non utilisés selon le type
    if (type === 'text') {
      delete answer.image;
    } else if (type === 'image') {
      delete answer.text;
    }

    newAnswers[index] = answer;
    onChange(newAnswers);
  };

  // Validation
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = answers.length - correctCount;
  const hasValidation = correctCount >= 1 && incorrectCount >= 1;

  return (
    <div className="space-y-4">
      {/* Validation warning */}
      {!hasValidation && answers.length >= 2 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            {correctCount === 0 && 'Au moins une réponse correcte est requise.'}
            {incorrectCount === 0 && 'Au moins une réponse incorrecte est requise.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des réponses */}
      <div className="space-y-4">
        {answers.map((answer, index) => (
          <Card key={answer.id} className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {answer.id}
                  </span>
                  Réponse {answer.id}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`correct-${answer.id}`}
                      checked={answer.isCorrect}
                      onCheckedChange={(checked) =>
                        updateAnswer(index, 'isCorrect', checked === true)
                      }
                      disabled={disabled}
                      className="border-slate-600"
                    />
                    <Label
                      htmlFor={`correct-${answer.id}`}
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      Correcte
                    </Label>
                  </div>
                  {answers.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnswer(index)}
                      disabled={disabled}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type de réponse */}
              <div className="space-y-2">
                <Label className="text-slate-200">Type de réponse</Label>
                <Select
                  value={answer.type}
                  onValueChange={(value) => updateAnswerType(index, value as AnswerType)}
                  disabled={disabled}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="text" className="text-white hover:bg-slate-800">
                      Texte uniquement
                    </SelectItem>
                    <SelectItem value="image" className="text-white hover:bg-slate-800">
                      Image uniquement
                    </SelectItem>
                    <SelectItem value="text-image" className="text-white hover:bg-slate-800">
                      Texte + Image
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Champ texte (si type text ou text-image) */}
              {(answer.type === 'text' || answer.type === 'text-image') && (
                <div className="space-y-2">
                  <Label htmlFor={`text-${answer.id}`} className="text-slate-200">
                    Texte de la réponse
                  </Label>
                  <Textarea
                    id={`text-${answer.id}`}
                    placeholder="Entrez le texte de la réponse..."
                    value={answer.text || ''}
                    onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                    disabled={disabled}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary min-h-[80px]"
                  />
                </div>
              )}

              {/* Champ image (si type image ou text-image) */}
              {(answer.type === 'image' || answer.type === 'text-image') && (
                <div className="space-y-2">
                  <Label className="text-slate-200">Image de la réponse</Label>
                  <ImageUpload
                    value={answer.image}
                    onChange={(url) => updateAnswer(index, 'image', url)}
                    onRemove={() => updateAnswer(index, 'image', undefined)}
                    folder="answers"
                    disabled={disabled}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bouton ajouter réponse */}
      {answers.length < 6 && (
        <Button
          type="button"
          variant="outline"
          onClick={addAnswer}
          disabled={disabled}
          className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une réponse ({answers.length}/6)
        </Button>
      )}

      {/* Info validation */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Règles de validation :</strong>
          <br />
          • Minimum 2 réponses, maximum 6
          <br />
          • Au moins 1 réponse correcte
          <br />
          • Au moins 1 réponse incorrecte
          <br />• Actuellement : {correctCount} correcte(s), {incorrectCount} incorrecte(s)
        </p>
      </div>
    </div>
  );
}