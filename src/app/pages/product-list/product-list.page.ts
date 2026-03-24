import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, InfiniteScrollCustomEvent, ToastController, ActionSheetController, NavController } from '@ionic/angular';
import type { ActionSheetButton } from '@ionic/angular';

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
  private navCtrl         = inject(NavController);
  private toastCtrl       = inject(ToastController);
  private actionSheetCtrl = inject(ActionSheetController);
  private cdr             = inject(ChangeDetectorRef);

  products   = signal<ProductListItem[]>([]);
  categories = signal<Category[]>([]);
  isLoading  = signal(true);
  hasMore    = signal(true);

  searchTerm    = '';
  selectedCat   = '';
  currentPage   = 1;
  readonly PAGE_SIZE = 20;
  readonly allCategoriesValue = '__all__';

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

  onSearch(event: CustomEvent): void {
    this.searchTerm = event.detail.value ?? '';
    this.loadProducts(true);
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

  async openCategoryMenu(): Promise<void> {
    const cats = this.categories();
    const buttons: ActionSheetButton[] = [
      {
        text: 'TODOS',
        cssClass: this.selectedCat === '' ? 'category-sheet-option-selected' : undefined,
        handler: () => this.selectCategory('')
      },
      ...cats.map(c => ({
        text: c.name.toUpperCase(),
        cssClass: this.selectedCat === c.id ? 'category-sheet-option-selected' : undefined,
        handler: () => this.selectCategory(c.id)
      })),
      { text: 'Fechar', role: 'cancel' }
    ];
    const sheet = await this.actionSheetCtrl.create({
      header: 'Categorias',
      cssClass: 'category-action-sheet',
      buttons
    });
    await sheet.present();
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
