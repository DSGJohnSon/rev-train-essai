export interface CategoryType {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  categoryType: string | CategoryType;
  createdAt: Date;
  updatedAt: Date;
}