import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';

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
  private toastCtrl   = inject(ToastController);

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
    }).subscribe({
      next: result => {
        this.products.update(prev => [...prev, ...result.data]);
        this.hasMore.set(this.currentPage < result.totalPages);
        this.isLoading.set(false);
      },
      error: async () => {
        this.isLoading.set(false);
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

  onCategoryChange(catId: string): void {
    this.selectedCat = catId === this.selectedCat ? '' : catId;
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
        this.products.update(prev => [...prev, ...result.data]);
        this.hasMore.set(this.currentPage < result.totalPages);
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  goToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }
}
