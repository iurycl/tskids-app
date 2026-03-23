export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;
  stock: number;
  categoryId: string;
  categoryName: string;
  createdAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  stock: number;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
