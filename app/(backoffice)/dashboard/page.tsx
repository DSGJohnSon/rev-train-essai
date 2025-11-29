'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/backoffice/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsSkeleton, CardSkeleton } from '@/components/shared/loading-skeleton';
import { FileQuestion, FolderTree, Tags, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

interface Stats {
  totalQuestions: number;
  totalCategories: number;
  totalCategoryTypes: number;
  recentQuestions: Array<{
    _id: string;
    title: string;
    createdAt: string;
  }>;
  questionsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    count: number;
  }>;
  questionsByCategoryType: Array<{
    _id: string;
    typeName: string;
    count: number;
  }>;
  answerTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  questionsOverTime: Array<{
    date: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          toast.error(data.error || 'Erreur lors du chargement des statistiques');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            <StatsSkeleton />
            <div className="grid gap-4 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-12 text-center">
              <p className="text-slate-400">Erreur lors du chargement des statistiques</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const cards = [
    {
      title: 'Questions',
      value: stats.totalQuestions,
      description: 'Questions créées',
      icon: FileQuestion,
      color: 'text-blue-500',
      href: '/questions',
    },
    {
      title: 'Catégories',
      value: stats.totalCategories,
      description: 'Catégories actives',
      icon: FolderTree,
      color: 'text-green-500',
      href: '/categories',
    },
    {
      title: 'Types',
      value: stats.totalCategoryTypes,
      description: 'Types de catégories',
      icon: Tags,
      color: 'text-purple-500',
      href: '/category-types',
    },
    {
      title: 'Moyenne',
      value: stats.totalCategories > 0 
        ? Math.round(stats.totalQuestions / stats.totalCategories) 
        : 0,
      description: 'Questions par catégorie',
      icon: TrendingUp,
      color: 'text-orange-500',
      href: '/questions',
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Link key={card.title} href={card.href}>
                <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">
                      {card.title}
                    </CardTitle>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                    <p className="text-xs text-slate-400">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Graphiques */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Répartition par catégorie */}
            {stats.questionsByCategory.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Répartition par catégorie</CardTitle>
                  <CardDescription className="text-slate-400">
                    Distribution des questions par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.questionsByCategory}
                        dataKey="count"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {stats.questionsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: '#fff' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Répartition par type */}
            {stats.questionsByCategoryType.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Répartition par type</CardTitle>
                  <CardDescription className="text-slate-400">
                    Distribution des questions par type de catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.questionsByCategoryType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="typeName" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Évolution temporelle */}
          {stats.questionsOverTime.length > 0 && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Évolution des créations</CardTitle>
                <CardDescription className="text-slate-400">
                  Questions créées au cours des 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.questionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      labelFormatter={(value) =>
                        format(new Date(value), 'dd MMMM yyyy', { locale: fr })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Questions récentes et actions rapides */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Questions récentes */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Questions récentes</CardTitle>
                <CardDescription className="text-slate-400">
                  Les 5 dernières questions créées
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentQuestions.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Aucune question créée
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentQuestions.map((question) => (
                      <Link
                        key={question._id}
                        href={`/questions/${question._id}`}
                        className="block group"
                      >
                        <div className="flex items-start justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                              {question.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {format(new Date(question.createdAt), 'dd MMMM yyyy', {
                                locale: fr,
                              })}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Actions rapides</CardTitle>
                <CardDescription className="text-slate-400">
                  Accès rapide aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/questions/new" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une nouvelle question
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/categories/new" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une nouvelle catégorie
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/category-types/new" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un nouveau type
                  </Link>
                </Button>
                <div className="pt-3 border-t border-slate-800">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/questions" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Voir toutes les questions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message de bienvenue */}
          {stats.totalQuestions === 0 && (
            <Card className="border-slate-800 bg-gradient-to-br from-primary/10 to-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  🎉 Bienvenue dans Revision Ferroviaire !
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Votre backoffice est prêt ! Commencez par créer vos premières questions pour votre révision d'examen.
                </p>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/questions/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer ma première question
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    <Link href="/categories">
                      Gérer les catégories
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}