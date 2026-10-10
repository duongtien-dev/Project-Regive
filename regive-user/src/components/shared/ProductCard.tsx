import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatVND } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

interface ProductCardProps {
  product: Product;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow }) => {
  const hasImage = product.images && product.images.length > 0;
  const inStock = product.stockQuantity > 0;

  return (
    <div className="clay-card flex flex-col h-full overflow-hidden">
      {/* ── Product Image ── */}
      <div
        className={`relative h-48 w-full overflow-hidden ${
          hasImage ? 'bg-transparent' : 'bg-gradient-to-br from-p-s100 to-p-s200'
        }`}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2.5">
            <Package className="w-14 h-14 text-p-s500 stroke-[1.5]" />
            <span className="text-xs font-semibold text-n-s600">
              Sản phẩm quyên góp
            </span>
          </div>
        )}

        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge type="product" status={product.condition} />
          </div>
        )}

        {/* Stock Badge */}
        <div
          className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 text-white text-[11px] font-bold ${
            inStock ? 'bg-n-s900/60' : 'bg-red-500/80'
          }`}
        >
          {inStock ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category tag */}
          <span className="clay-badge clay-badge-green text-[11px] mb-2 inline-flex">
            {product.category || 'Vật phẩm'}
          </span>

          <Link href={`/marketplace/${product._id}`} className="no-underline block mt-1.5">
            <h3 className="text-base font-bold text-n-s900 leading-snug mb-2 line-clamp-2 hover:text-p-s700 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Linked Campaign */}
          {product.campaign && typeof product.campaign === 'object' && product.campaign.title && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-w-s50 border border-w-s300/30 mb-1.5">
              <span className="text-[11px] font-extrabold text-w-s800">Quỹ:</span>
              <span className="text-[11px] font-semibold text-w-s900 truncate">
                {product.campaign.title}
              </span>
            </div>
          )}

          {/* AI Verified Badge */}
          {product.latestAiAssessment?.suggestion && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-p-s50 border border-p-s300/40 text-[11px] font-bold text-p-s800 mb-1.5">
              <Sparkles className="w-3 h-3 text-p-s600" />
              AI Verified · {product.condition || 'Tốt'}
            </div>
          )}

          {product.description && (
            <p className="text-xs text-n-s600 leading-relaxed mt-1 line-clamp-2 m-0">
              {product.description}
            </p>
          )}
        </div>

        {/* ── Price + Actions ── */}
        <div>
          <div className="flex items-center justify-between mb-3 pt-3 border-t-2 border-dashed border-p-s500/20">
            <span className="text-xs text-n-s400 font-semibold">Giá gây quỹ</span>
            <span className="text-lg font-bold text-p-s600">
              {formatVND(product.price)}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/marketplace/${product._id}`}
              className="flex-1 no-underline"
            >
              <button
                className="clay-btn-outline w-full text-xs sm:text-sm py-2 px-3 justify-center"
              >
                Chi tiết
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>

            <button
              onClick={() =>
                onBuyNow ? onBuyNow(product) : (window.location.href = `/marketplace/${product._id}`)
              }
              disabled={!inStock}
              className={`clay-btn-primary flex-1 text-xs sm:text-sm py-2 px-3 justify-center ${
                !inStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
