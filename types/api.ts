// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les statistiques
export interface DashboardStats {
  totalQuestions: number;
  totalCategories: number;
  totalCategoryTypes: number;
  questionsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  questionsByCategoryType: Array<{
    typeName: string;
    count: number;
  }>;
  recentQuestions: Array<{
    _id: string;
    title: string;
    createdAt: Date;
  }>;
}