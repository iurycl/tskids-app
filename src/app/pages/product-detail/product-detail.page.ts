import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController, NavController } from '@ionic/angular';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss']
})
export class ProductDetailPage implements OnInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private navCtrl    = inject(NavController);
  private productSvc = inject(ProductService);
  private toastCtrl  = inject(ToastController);

  product   = signal<Product | null>(null);
  isLoading = signal(true);
  notFound  = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }
    this.loadProduct(id);
  }

  loadProduct(id: string): void {
    this.productSvc.getProductById(id).subscribe({
      next: p => {
        this.product.set(p);
        this.isLoading.set(false);
      },
      error: async (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          const toast = await this.toastCtrl.create({
            message: 'Erro ao carregar produto.',
            duration: 3000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  get stockLabel(): string {
    const s = this.product()?.stock ?? 0;
    if (s === 0)      return 'Sem estoque';
    if (s <= 5)       return `Últimas ${s} unidades`;
    if (s <= 20)      return `${s} unidades disponíveis`;
    return 'Em estoque';
  }

  get stockColor(): string {
    const s = this.product()?.stock ?? 0;
    if (s === 0)  return 'danger';
    if (s <= 5)   return 'warning';
    return 'success';
  }
}
