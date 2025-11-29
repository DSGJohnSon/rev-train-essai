'use client';

import Link from 'next/link';
import { Brain, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ModeSelector() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Mode Quiz */}
      <Card className="group hover:border-primary transition-colors">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mode Quiz</CardTitle>
          </div>
          <CardDescription className="text-base">
            Testez vos connaissances avec un nombre de questions défini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Choisissez le nombre de questions (1 à maximum disponible)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Sélectionnez ou bannissez des catégories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Obtenez votre score et sauvegardez-le</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Consultez les détails de vos réponses</span>
            </li>
          </ul>
          <Link href="/quiz/setup" className="block">
            <Button className="w-full gap-2 group-hover:gap-3 transition-all">
              Commencer un Quiz
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Mode Révision */}
      <Card className="group hover:border-primary transition-colors">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mode Révision</CardTitle>
          </div>
          <CardDescription className="text-base">
            Révisez jusqu'à maîtriser toutes les questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Sélectionnez les catégories à réviser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Répondez correctement 2 fois à chaque question</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Une erreur remet le compteur à zéro</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Terminez quand toutes les questions sont validées</span>
            </li>
          </ul>
          <Link href="/revision/setup" className="block">
            <Button className="w-full gap-2 group-hover:gap-3 transition-all">
              Commencer une Révision
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}