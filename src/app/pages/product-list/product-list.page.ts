import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';

import { finalize } from 'rxjs/operators';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductListItem } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ProductCardComponent],
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss']
})
export class ProductListPage implements OnInit {
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private router      = inject(Router);
  private toastCtrl = inject(ToastController);
  private cdr       = inject(ChangeDetectorRef);

  showCategorySheet = false;

  products   = signal<ProductListItem[]>([]);
  categories = signal<Category[]>([]);
  isLoading  = signal(true);
  hasMore    = signal(true);

  searchTerm    = '';
  selectedCat   = '';
  currentPage   = 1;
  readonly PAGE_SIZE = 20;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts(true);
  }

  loadCategories(): void {
    this.categorySvc.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });
  }

  loadProducts(reset = false): void {
    if (reset) {
      this.currentPage = 1;
      this.products.set([]);
      this.hasMore.set(true);
      this.isLoading.set(true);
    }

    this.productSvc.getProducts({
      page: this.currentPage,
      pageSize: this.PAGE_SIZE,
      categoryId: this.selectedCat || null,
      search: this.searchTerm || null,
    }).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: result => {
        const items = Array.isArray(result?.data) ? result.data : [];
        const totalPages = typeof result?.totalPages === 'number' ? result.totalPages : 1;
        this.products.update(prev => [...prev, ...items]);
        this.hasMore.set(this.currentPage < totalPages);
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Erro ao carregar produtos. Tente novamente.',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchTerm = value;
      this.loadProducts(true);
    }, 400);
  }

  selectedCategoryTitle(): string {
    if (!this.selectedCat) return 'TODOS';
    const c = this.categories().find(x => x.id === this.selectedCat);
    return (c?.name ?? 'TODOS').toUpperCase();
  }

  openCategoryMenu(): void {
    this.showCategorySheet = true;
  }

  closeCategorySheet(): void {
    this.showCategorySheet = false;
  }

  pickCategory(id: string): void {
    this.closeCategorySheet();
    this.selectCategory(id);
  }

  selectCategory(id: string): void {
    if (id === this.selectedCat) return;
    this.selectedCat = id;
    this.cdr.detectChanges();
    this.loadProducts(true);
  }

  loadMore(event: InfiniteScrollCustomEvent): void {
    this.currentPage++;
    this.productSvc.getProducts({
      page: this.currentPage,
      pageSize: this.PAGE_SIZE,
      categoryId: this.selectedCat || null,
      search: this.searchTerm || null,
    }).subscribe({
      next: result => {
        const items = Array.isArray(result?.data) ? result.data : [];
        const totalPages = typeof result?.totalPages === 'number' ? result.totalPages : 1;
        this.products.update(prev => [...prev, ...items]);
        this.hasMore.set(this.currentPage < totalPages);
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  trackById(index: number, item: ProductListItem): string {
    return item.id ?? `idx-${index}`;
  }

  goToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }
}
