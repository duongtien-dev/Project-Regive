'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Input, Select, Button, Alert } from 'antd';
import { Search, ShoppingBag, RefreshCw, Filter } from 'lucide-react';
import { marketplaceService } from '@/services/marketplaceService';
import { Product } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (conditionFilter !== 'all') params.condition = conditionFilter;
      const data = await marketplaceService.listMarketplace(params);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, conditionFilter]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <ShoppingBag className="w-4 h-4" />
          <span>Cửa hàng thiện nguyện tuần hoàn</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Chợ Vật Phẩm Gây Quỹ</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Mua sắm các vật phẩm tái sử dụng chất lượng cao. 100% doanh thu được chuyển thành kinh phí hỗ trợ các chiến dịch vì cộng đồng.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm vật phẩm theo tên hoặc mô tả..."
            prefix={<Search className="w-4 h-4 text-gray-400 mr-1" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            size="large"
            className="!rounded-xl"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            size="large"
            className="min-w-[150px]"
            options={[
              { label: 'Tất cả danh mục', value: 'all' },
              ...categories.map((c) => ({ label: c, value: c })),
            ]}
          />

          <Select
            value={conditionFilter}
            onChange={setConditionFilter}
            size="large"
            className="min-w-[150px]"
            options={[
              { label: 'Tất cả tình trạng', value: 'all' },
              { label: 'Mới 100%', value: 'new' },
              { label: 'Như mới (Like new)', value: 'like_new' },
              { label: 'Còn tốt (Good)', value: 'good' },
              { label: 'Chấp nhận được', value: 'fair' },
            ]}
          />

          <Select
            value={sortBy}
            onChange={setSortBy}
            size="large"
            className="min-w-[150px]"
            options={[
              { label: 'Mới nhất', value: 'newest' },
              { label: 'Giá tăng dần', value: 'priceAsc' },
              { label: 'Giá giảm dần', value: 'priceDesc' },
            ]}
          />

          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchProducts}
            size="large"
            className="rounded-xl"
            title="Làm mới"
          />
        </div>
      </div>

      {/* Error alert */}
      {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

      {/* Product Grid */}
      {loading ? (
        <CardSkeleton count={8} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Không tìm thấy sản phẩm phù hợp"
          description="Hiện tại không có sản phẩm nào khớp với bộ lọc của bạn."
          actionText="Đặt lại bộ lọc"
          onAction={() => {
            setSearchQuery('');
            setCategoryFilter('all');
            setConditionFilter('all');
            setSortBy('newest');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
