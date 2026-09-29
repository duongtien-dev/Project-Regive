'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Input, Select, Button, Alert } from 'antd';
import { Search, Filter, RefreshCw, Heart } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/types';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.listPublic();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Unique locations from data
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    campaigns.forEach((c) => {
      if (c.location) locSet.add(c.location);
    });
    return Array.from(locSet);
  }, [campaigns]);

  // Filter and sort logic
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.goal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.location?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = locationFilter === 'all' || c.location === locationFilter;
        return matchesSearch && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'progress') {
          const pA = a.targetAmount ? (a.raisedAmount / a.targetAmount) : 0;
          const pB = b.targetAmount ? (b.raisedAmount / b.targetAmount) : 0;
          return pB - pA;
        }
        if (sortBy === 'targetAsc') {
          return a.targetAmount - b.targetAmount;
        }
        return 0;
      });
  }, [campaigns, searchQuery, locationFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Heart className="w-4 h-4 fill-emerald-600" />
          <span>Chiến dịch vì cộng đồng</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Danh Sách Chiến Dịch Thiện Nguyện</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Khám phá các hoạt động gây quỹ, quyên góp hiện vật và kêu gọi tình nguyện viên đang diễn ra trên khắp cả nước.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="Tìm theo tên chiến dịch, mục tiêu hoặc địa điểm..."
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
            value={locationFilter}
            onChange={setLocationFilter}
            size="large"
            className="min-w-[150px]"
            options={[
              { label: 'Tất cả địa điểm', value: 'all' },
              ...locations.map((loc) => ({ label: loc, value: loc })),
            ]}
          />

          <Select
            value={sortBy}
            onChange={setSortBy}
            size="large"
            className="min-w-[160px]"
            options={[
              { label: 'Mới nhất', value: 'newest' },
              { label: 'Tiến độ cao nhất', value: 'progress' },
              { label: 'Mục tiêu gây quỹ', value: 'targetAsc' },
            ]}
          />

          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchCampaigns}
            size="large"
            className="rounded-xl"
            title="Làm mới"
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchCampaigns}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Campaigns Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          title="Không tìm thấy chiến dịch phù hợp"
          description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc."
          actionText="Đặt lại bộ lọc"
          onAction={() => {
            setSearchQuery('');
            setLocationFilter('all');
            setSortBy('newest');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => (
            <CampaignCard key={c._id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
