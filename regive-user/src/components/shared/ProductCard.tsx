import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { formatVND } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

interface ProductCardProps {
  product: Product;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow }) => {
  const hasImage = product.images && product.images.length > 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Product Image / Visual */}
      <div className="relative h-48 w-full bg-slate-50 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-6">
            <Package className="w-12 h-12 stroke-[1.5] mb-2 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500">Sản phẩm quyên góp</span>
          </div>
        )}

        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge type="product" status={product.condition} />
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
          Còn {product.stockQuantity}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            {product.category || 'Vật phẩm'}
          </div>

          <Link href={`/marketplace/${product._id}`}>
            <h3 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium">Giá gây quỹ</span>
            <span className="text-lg font-extrabold text-emerald-700">
              {formatVND(product.price)}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/marketplace/${product._id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-50 text-gray-700 font-medium text-xs hover:bg-gray-100 transition-colors"
            >
              <span>Chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => onBuyNow ? onBuyNow(product) : window.location.href = `/marketplace/${product._id}`}
              disabled={product.stockQuantity <= 0}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mua ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
