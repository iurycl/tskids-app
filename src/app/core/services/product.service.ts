import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, Product, ProductListItem } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  getProducts(params: {
    page?: number;
    pageSize?: number;
    categoryId?: string | null;
    search?: string | null;
  }): Observable<PagedResult<ProductListItem>> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 1)
      .set('pageSize', params.pageSize ?? 20);

    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.search)     httpParams = httpParams.set('search', params.search);

    return this.http.get<PagedResult<ProductListItem>>(this.base, { params: httpParams });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }
}
