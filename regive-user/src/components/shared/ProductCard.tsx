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
    <div
      className="clay-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Product Image ── */}
      <div
        style={{
          position: 'relative',
          height: 190,
          width: '100%',
          background: hasImage ? 'transparent' : 'linear-gradient(135deg, var(--clay-green-soft) 0%, var(--clay-mint-soft) 100%)',
          overflow: 'hidden',
        }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.35s var(--ease-out)',
            }}
            className="group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Package
              className="w-14 h-14"
              style={{ color: 'var(--clay-green)', strokeWidth: 1.5 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--clay-navy-500)' }}>
              Sản phẩm quyên góp
            </span>
          </div>
        )}

        {/* Condition Badge */}
        {product.condition && (
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
            <StatusBadge type="product" status={product.condition} />
          </div>
        )}

        {/* Stock Badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            background: inStock ? 'rgba(15,23,42,.60)' : 'rgba(239,68,68,.80)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,.20)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
          }}
        >
          {inStock ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '18px 18px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {/* Category tag */}
          <span className="clay-badge clay-badge-green" style={{ fontSize: 11, marginBottom: 8 }}>
            {product.category || 'Vật phẩm'}
          </span>

          <Link href={`/marketplace/${product._id}`} style={{ textDecoration: 'none', display: 'block', marginTop: 6 }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--clay-navy)',
                lineHeight: 1.35,
                margin: '0 0 8px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'color 0.2s',
              }}
              className="hover:text-green-700"
            >
              {product.name}
            </h3>
          </Link>

          {/* Linked Campaign */}
          {product.campaign && typeof product.campaign === 'object' && product.campaign.title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 10,
                background: 'var(--clay-yellow-soft)',
                border: '1.5px solid rgba(251,191,36,.30)',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#92400E' }}>Quỹ:</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#78350F',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {product.campaign.title}
              </span>
            </div>
          )}

          {/* AI Verified Badge */}
          {product.latestAiAssessment?.suggestion && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--clay-mint-soft)',
                border: '1.5px solid rgba(52,211,153,.30)',
                fontSize: 11,
                fontWeight: 700,
                color: '#065F46',
                marginBottom: 6,
              }}
            >
              <Sparkles className="w-3 h-3" />
              AI Verified · {product.condition || 'Tốt'}
            </div>
          )}

          {product.description && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--clay-navy-500)',
                lineHeight: 1.6,
                margin: '4px 0 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}
            </p>
          )}
        </div>

        {/* ── Price + Actions ── */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingTop: 12,
              borderTop: '1.5px dashed rgba(34,197,94,.20)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--clay-navy-300)', fontWeight: 600 }}>Giá gây quỹ</span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--clay-green-deep)',
              }}
            >
              {formatVND(product.price)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href={`/marketplace/${product._id}`}
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <button
                className="clay-btn-outline"
                style={{ width: '100%', fontSize: 13, padding: '9px 12px' }}
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
              className="clay-btn-primary"
              style={{
                flex: 1,
                fontSize: 13,
                padding: '9px 12px',
                opacity: inStock ? 1 : 0.5,
                cursor: inStock ? 'pointer' : 'not-allowed',
              }}
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
