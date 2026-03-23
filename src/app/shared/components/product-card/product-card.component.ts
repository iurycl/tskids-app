import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProductListItem } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe],
  template: `
    <div class="product-card" (click)="cardClick.emit(product.id)">

      <!-- Imagem com badge de estoque (estilo Tuning Shop) -->
      <div class="card-image-wrap">
        <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" />

        <!-- Badge laranja (igual ao "Vendedor"/"Comprador" do site original) -->
        <span *ngIf="product.stock === 0"            class="ts-badge danger">SEM ESTOQUE</span>
        <span *ngIf="product.stock > 0 && product.stock <= 5" class="ts-badge warning">ÚLTIMAS UNIDADES</span>
      </div>

      <!-- Info -->
      <div class="card-body">
        <span class="brand-label">{{ product.brand | uppercase }}</span>
        <p class="product-name">{{ product.name }}</p>
        <div class="bottom-row">
          <span class="price">{{ product.price | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          <span class="cat-tag">{{ product.categoryName }}</span>
        </div>
      </div>

      <!-- Faixa laranja inferior "VER PRODUTO" (hover) -->
      <div class="card-cta">VER PRODUTO →</div>

    </div>
  `,
  styles: [`
    /* Card raiz — sem arredondamento excessivo (estilo do site original) */
    .product-card {
      background: #fff;
      border-radius: 6px;
      border: 1px solid #e8e8e8;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.15s;
      display: flex;
      flex-direction: column;
    }
    .product-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
      transform: translateY(-3px);
    }
    .product-card:hover .card-cta { opacity: 1; }

    /* Imagem */
    .card-image-wrap {
      position: relative;
      width: 100%;
      height: 190px;
      overflow: hidden;
      background: #f5f5f5;
    }
    .card-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    .product-card:hover .card-image-wrap img { transform: scale(1.04); }

    /* Badges estilo Tuning Shop (laranja arredondado, sem borda) */
    .ts-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      font-family: 'Barlow Condensed', 'Barlow', sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 3px 8px;
      border-radius: 3px;
      color: #fff;
    }
    .ts-badge.danger  { background: #CC0000; }
    .ts-badge.warning { background: #FF5500; }

    /* Corpo do card */
    .card-body {
      padding: 10px 12px 8px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .brand-label {
      font-size: 10px;
      font-weight: 700;
      color: #999;
      letter-spacing: 0.8px;
    }

    .product-name {
      margin: 0;
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #1A1A1A;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
      flex-wrap: wrap;
      gap: 4px;
    }

    /* Preço — laranja, bold, Barlow Condensed (estilo do site) */
    .price {
      font-family: 'Barlow Condensed', 'Barlow', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #FF5500;
      letter-spacing: -0.3px;
    }

    /* Tag de categoria discreta */
    .cat-tag {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #fff;
      background: #1A3A6B;
      padding: 2px 7px;
      border-radius: 3px;
    }

    /* CTA laranja que aparece no hover */
    .card-cta {
      background: #FF5500;
      color: #fff;
      font-family: 'Barlow Condensed', 'Barlow', sans-serif;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-align: center;
      padding: 8px;
      opacity: 0;
      transition: opacity 0.2s;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListItem;
  @Output() cardClick = new EventEmitter<string>();
}
