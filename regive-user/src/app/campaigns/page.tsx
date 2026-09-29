'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Input, Select, Button, Alert, Tag } from 'antd';
import {
  Search,
  Filter,
  RefreshCw,
  Heart,
  Plus,
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  Grid,
  List,
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/types';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CampaignQuickViewDrawer } from '@/components/campaigns/CampaignQuickViewDrawer';
import { QuickDonateModal } from '@/components/campaigns/QuickDonateModal';
import { QuickVolunteerModal } from '@/components/campaigns/QuickVolunteerModal';
import { CreateCampaignModal } from '@/components/campaigns/CreateCampaignModal';
import { formatVND } from '@/lib/format';
import { useAuthStore } from '@/store/useAuthStore';

const CAUSE_CATEGORIES = [
  { id: 'all', label: 'Tất cả chiến dịch', icon: '🌟' },
  { id: 'children', label: 'Trẻ em & Áo ấm', icon: '👶' },
  { id: 'disaster_relief', label: 'Cứu trợ bão lũ', icon: '🌧️' },
  { id: 'poverty_alleviation', label: 'Bữa cơm yêu thương', icon: '🍱' },
  { id: 'education', label: 'Tủ sách & Tri thức', icon: '📚' },
  { id: 'environment', label: 'Nước sạch nông thôn', icon: '💧' },
  { id: 'healthcare', label: 'Y tế & Nụ cười', icon: '🏥' },
];

export default function CampaignsPage() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals & Drawers state
  const [quickViewCampaign, setQuickViewCampaign] = useState<Campaign | null>(null);
  const [donateModalCampaign, setDonateModalCampaign] = useState<Campaign | null>(null);
  const [volunteerModalCampaign, setVolunteerModalCampaign] = useState<Campaign | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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

  // Aggregates
  const totalRaised = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  }, [campaigns]);

  // Filter and sort logic
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.goal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.location?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
        const matchesLocation = locationFilter === 'all' || c.location === locationFilter;
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

        return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.startDate || b.createdAt).getTime() - new Date(a.startDate || a.createdAt).getTime();
        }
        if (sortBy === 'progress') {
          const pA = a.targetAmount ? a.raisedAmount / a.targetAmount : 0;
          const pB = b.targetAmount ? b.raisedAmount / b.targetAmount : 0;
          return pB - pA;
        }
        if (sortBy === 'urgent') {
          // nearest end date
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        }
        if (sortBy === 'targetAsc') {
          return a.targetAmount - b.targetAmount;
        }
        return 0;
      });
  }, [campaigns, searchQuery, selectedCategory, locationFilter, statusFilter, sortBy]);

  const handleCreateSuccess = (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header with Action Button & Live Stats */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nền tảng thiện nguyện tuần hoàn ReGive</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Chiến Dịch Thiện Nguyện
            </h1>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              Khám phá và đồng hành cùng các hoạt động gây quỹ, quyên góp hiện vật và kêu gọi tình nguyện viên đang diễn ra trên khắp cả nước.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              type="primary"
              size="large"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 border-0"
            >
              + Đề xuất chiến dịch mới
            </Button>
          </div>
        </div>

        {/* Live Aggregates Strip */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-emerald-300 block mb-0.5">Chiến dịch đang gây quỹ:</span>
            <strong className="text-white text-lg font-black">{campaigns.length} dự án</strong>
          </div>
          <div>
            <span className="text-emerald-300 block mb-0.5">Tổng nguồn lực đóng góp:</span>
            <strong className="text-white text-lg font-black">{formatVND(totalRaised)}</strong>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-emerald-300 block mb-0.5">Quy trình kiểm định:</span>
            <strong className="text-white text-lg font-black">100% Minh bạch</strong>
          </div>
        </div>
      </div>

      {/* Cause Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CAUSE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Multifaceted Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="Tìm theo tên chiến dịch, mục tiêu, tổ chức hoặc địa phương..."
            prefix={<Search className="w-4 h-4 text-gray-400 mr-1" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            size="large"
            className="!rounded-xl"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
          <Select
            value={locationFilter}
            onChange={setLocationFilter}
            size="large"
            className="min-w-[140px]"
            options={[
              { label: 'Tất cả địa điểm', value: 'all' },
              ...locations.map((loc) => ({ label: loc, value: loc })),
            ]}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            size="large"
            className="min-w-[130px]"
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'Đang hoạt động', value: 'active' },
              { label: 'Đã hoàn thành', value: 'closed' },
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
              { label: 'Cần hỗ trợ gấp', value: 'urgent' },
              { label: 'Mục tiêu gây quỹ', value: 'targetAsc' },
            ]}
          />

          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchCampaigns}
            size="large"
            className="rounded-xl"
            title="Làm mới dữ liệu"
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
          description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc danh mục."
          actionText="Đặt lại bộ lọc"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setLocationFilter('all');
            setStatusFilter('all');
            setSortBy('newest');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              onQuickView={(camp) => setQuickViewCampaign(camp)}
              onQuickDonate={(camp) => setDonateModalCampaign(camp)}
            />
          ))}
        </div>
      )}

      {/* Drawer: Quick View Campaign */}
      <CampaignQuickViewDrawer
        campaign={quickViewCampaign}
        open={Boolean(quickViewCampaign)}
        onClose={() => setQuickViewCampaign(null)}
        onOpenDonateMoney={(camp) => setDonateModalCampaign(camp)}
        onOpenVolunteer={(camp) => setVolunteerModalCampaign(camp)}
      />

      {/* Modal: Quick Donate Money */}
      <QuickDonateModal
        campaign={donateModalCampaign}
        open={Boolean(donateModalCampaign)}
        onClose={() => setDonateModalCampaign(null)}
      />

      {/* Modal: Quick Volunteer Registration */}
      <QuickVolunteerModal
        campaign={volunteerModalCampaign}
        open={Boolean(volunteerModalCampaign)}
        onClose={() => setVolunteerModalCampaign(null)}
        onSuccess={() => fetchCampaigns()}
      />

      {/* Modal: Create / Propose Campaign */}
      <CreateCampaignModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
