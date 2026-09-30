'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Progress, Tabs, Alert, Modal, message, Tooltip, Avatar, Tag } from 'antd';
import {
  MapPin,
  Calendar,
  Heart,
  Package,
  HandHeart,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Users,
  Clock,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Camera,
  Layers,
  Settings,
  Plus,
  Building,
  Phone,
  Mail,
  Info,
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/types';
import { formatVND, formatDate, calculateProgress } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DetailSkeleton } from '@/components/shared/LoadingSkeleton';
import { QuickDonateModal } from '@/components/campaigns/QuickDonateModal';
import { QuickVolunteerModal } from '@/components/campaigns/QuickVolunteerModal';
import { AddActivityModal } from '@/components/campaigns/AddActivityModal';
import { EditCampaignModal } from '@/components/campaigns/EditCampaignModal';
import { useAuthStore } from '@/store/useAuthStore';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [donationCount, setDonationCount] = useState<number>(0);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteerCount, setVolunteerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchCampaignData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [cData, dData, vData] = await Promise.all([
        campaignService.getById(id),
        campaignService.getCampaignDonations(id, 30).catch(() => ({ donations: [], total: 0 })),
        campaignService.getVolunteers(id).catch(() => ({ volunteers: [], total: 0 })),
      ]);
      setCampaign(cData);
      setDonations(dData.donations || []);
      setDonationCount(dData.total || 0);
      setVolunteers(vData.volunteers || []);
      setVolunteerCount(vData.total || 0);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết chiến dịch!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Alert
          message="Không tìm thấy chiến dịch"
          description={error || 'Chiến dịch không tồn tại hoặc đã bị gỡ bỏ.'}
          type="error"
          showIcon
          className="mb-6"
        />
        <Button onClick={() => router.push('/campaigns')} icon={<ArrowLeft className="w-4 h-4" />}>
          Về danh sách chiến dịch
        </Button>
      </div>
    );
  }

  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);

  const now = new Date().getTime();
  const end = new Date(campaign.endDate).getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const daysLeftText = diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã kết thúc thời gian';

  const isCreator =
    user &&
    ((typeof campaign.createdBy === 'object' && campaign.createdBy?._id === user.id) ||
      campaign.createdBy === user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back and Action Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
        <div className="flex items-center gap-2">
          {isCreator && (
            <Button
              icon={<Settings className="w-4 h-4" />}
              onClick={() => setEditModalOpen(true)}
              className="rounded-xl border-gray-200 text-gray-700 hover:text-emerald-600"
            >
              Quản lý chiến dịch
            </Button>
          )}
          <Button
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => setShareModalOpen(true)}
            className="rounded-xl border-gray-200 hover:text-emerald-600 hover:border-emerald-600"
          >
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cover, Story, Target Items, Timeline, Donors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Banner */}
          <div
            className="relative h-72 sm:h-96 w-full rounded-3xl p-8 flex flex-col justify-end text-white overflow-hidden shadow-lg bg-cover bg-center"
            style={{
              backgroundImage: campaign.bannerImage
                ? `linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.1) 100%), url(${campaign.bannerImage})`
                : 'linear-gradient(to tr, #047857, #0d9488, #0284c7)',
            }}
          >
            <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
              <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {daysLeftText}
              </span>
              <StatusBadge type="campaign" status={campaign.status} />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-100">
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Building className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{campaign.organization || 'Ban Điều Hành ReGive'}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{campaign.location}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {campaign.title}
              </h1>

              {campaign.shortDescription && (
                <p className="text-xs sm:text-sm text-emerald-100/90 line-clamp-2 leading-relaxed">
                  {campaign.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Target Physical Items Needed (if available) */}
          {campaign.targetItems && campaign.targetItems.length > 0 && (
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-teal-950 flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal-700" />
                  <span>Vật phẩm hiện vật đang kêu gọi ({campaign.targetItems.length})</span>
                </h3>
                <Link href={`/campaigns/${campaign._id}/donate-product`}>
                  <Button
                    type="primary"
                    size="small"
                    className="bg-teal-700 hover:bg-teal-800 rounded-xl text-xs font-bold"
                  >
                    Ủng hộ đồ ngay
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {campaign.targetItems.map((item, idx) => {
                  const itemProgress = item.targetQty
                    ? Math.min(100, Math.round((item.receivedQty / item.targetQty) * 100))
                    : 0;
                  return (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-teal-100 space-y-1.5 shadow-xs">
                      <div className="flex justify-between items-baseline font-bold text-xs text-gray-800">
                        <span>{item.name}</span>
                        <span className="text-teal-700 font-mono">
                          {item.receivedQty} / {item.targetQty} {item.unit}
                        </span>
                      </div>
                      <Progress percent={itemProgress} size="small" strokeColor="#0d9488" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <Tabs
              defaultActiveKey="story"
              size="large"
              items={[
                {
                  key: 'story',
                  label: 'Câu chuyện & Kế hoạch',
                  children: (
                    <div className="space-y-6 pt-4 text-gray-700 leading-relaxed">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>Mục tiêu trọng tâm của chiến dịch</span>
                        </h3>
                        <p className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-emerald-950 font-medium text-sm leading-relaxed">
                          {campaign.goal}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Chi tiết kế hoạch triển khai</h3>
                        <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                          {campaign.description}
                        </div>
                      </div>

                      {/* Volunteer Requirements */}
                      {campaign.volunteerConditions && (
                        <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-sky-950 space-y-1.5">
                          <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
                            <HandHeart className="w-4 h-4 text-sky-600" />
                            <span>Điều kiện & Yêu cầu đối với Tình nguyện viên:</span>
                          </h4>
                          <p className="leading-relaxed">{campaign.volunteerConditions}</p>
                          <div className="pt-2">
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => setVolunteerModalOpen(true)}
                              className="bg-sky-600 hover:bg-sky-700 rounded-lg text-xs font-bold"
                            >
                              Đăng ký tham gia ngay
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Organizer & Contact info */}
                      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-600">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-emerald-600" />
                            <span>Đơn vị tổ chức: {campaign.organization || 'Ban Điều Hành ReGive'}</span>
                          </p>
                          {campaign.contactInfo?.representative && (
                            <p>Đại diện: {campaign.contactInfo.representative} {campaign.contactInfo.phone ? `(${campaign.contactInfo.phone})` : ''}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Chiến dịch đã được thẩm định & phê duyệt</span>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'activities',
                  label: `Nhật ký thực địa (${campaign.activities?.length || 0})`,
                  children: (
                    <div className="space-y-6 pt-4">
                      {isCreator && (
                        <div className="flex justify-end">
                          <Button
                            type="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setActivityModalOpen(true)}
                            className="bg-emerald-600 rounded-xl font-bold text-xs"
                          >
                            + Đăng cập nhật thực địa
                          </Button>
                        </div>
                      )}

                      {!campaign.activities || campaign.activities.length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Chưa có nhật ký hoạt động nào được cập nhật.</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Các tình nguyện viên và điều phối viên sẽ cập nhật hình ảnh sau mỗi chuyến đi thực địa.
                          </p>
                        </div>
                      ) : (
                        <div className="relative border-l-2 border-emerald-200 ml-4 pl-6 space-y-8">
                          {campaign.activities.map((act, idx) => (
                            <div key={idx} className="relative group">
                              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-xs" />
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h4 className="font-bold text-gray-900 text-base">{act.title}</h4>
                                  <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                                    {act.date ? formatDate(act.date) : 'Vừa cập nhật'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{act.content}</p>
                                {act.image && (
                                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 max-w-lg">
                                    <img
                                      src={act.image}
                                      alt={act.title}
                                      className="w-full h-56 object-cover hover:scale-105 transition-all duration-300"
                                    />
                                  </div>
                                )}
                                <div className="text-xs text-emerald-800 font-semibold pt-1">
                                  Bởi: {act.author || 'Ban điều phối ReGive'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'donors',
                  label: `Bảng vàng đóng góp (${donationCount})`,
                  children: (
                    <div className="space-y-4 pt-4">
                      {donations.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-rose-300" />
                          <p className="text-sm">Hãy là người đầu tiên ủng hộ cho chiến dịch này!</p>
                          <Button
                            type="primary"
                            onClick={() => setDonateModalOpen(true)}
                            className="mt-3 bg-emerald-600 rounded-xl"
                          >
                            Ủng hộ ngay
                          </Button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {donations.map((d, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                                  {d.donorName ? d.donorName.charAt(0) : 'U'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-bold text-gray-900 text-sm">{d.donorName}</h5>
                                    {d.isAnonymous && (
                                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        Ẩn danh
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {d.createdAt ? formatDate(d.createdAt) : 'Gần đây'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-emerald-700 text-sm block">
                                  {d.type === 'money'
                                    ? formatVND(d.amount)
                                    : `${d.productInfo?.quantity || 1} x ${d.productInfo?.name || 'Vật phẩm'}`}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {d.type === 'money' ? 'Ủng hộ tiền' : 'Ủng hộ hiện vật'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'volunteers',
                  label: `Đội ngũ tình nguyện (${volunteerCount})`,
                  children: (
                    <div className="space-y-4 pt-4">
                      {volunteers.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-sky-300" />
                          <p className="text-sm">Chưa có tình nguyện viên nào đăng ký.</p>
                          <Button
                            type="primary"
                            onClick={() => setVolunteerModalOpen(true)}
                            className="mt-3 bg-sky-600 rounded-xl"
                          >
                            Trở thành tình nguyện viên đầu tiên
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {volunteers.map((v, idx) => (
                            <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                              <div>
                                <h5 className="font-bold text-gray-900">{v.userName}</h5>
                                <p className="text-gray-500 mt-0.5">Kỹ năng: {v.skills || 'Đa năng'}</p>
                              </div>
                              <Tag color="cyan" className="rounded-full text-[10px] border-0 capitalize">
                                {v.status}
                              </Tag>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'transparency',
                  label: 'Quy trình minh bạch',
                  children: (
                    <div className="space-y-4 pt-4 text-sm text-gray-600">
                      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-teal-900">
                        <h4 className="font-bold text-sm mb-1">Cam kết minh bạch của ReGive</h4>
                        <p className="text-xs leading-relaxed">
                          Mọi khoản đóng góp qua ReGive đều được số hóa, gắn mã giao dịch và lưu trữ trên cơ sở dữ liệu hệ thống. Người dùng có thể tra cứu lịch sử đóng góp bất kỳ lúc nào tại mục Cá nhân.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <h5 className="font-bold text-gray-900 text-xs mb-1">1. Đóng góp trực tuyến</h5>
                          <p className="text-xs text-gray-500">
                            Tiền ủng hộ được ghi nhận tự động vào tiến độ chiến dịch ngay khi thanh toán thành công.
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <h5 className="font-bold text-gray-900 text-xs mb-1">2. Kiểm định hiện vật</h5>
                          <p className="text-xs text-gray-500">
                            Vật phẩm được tình nguyện viên tiếp nhận, làm sạch và đóng gói theo tiêu chuẩn an toàn.
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <h5 className="font-bold text-gray-900 text-xs mb-1">3. Trao tặng tận tay</h5>
                          <p className="text-xs text-gray-500">
                            Hoàn tất chuyến xe thiện nguyện, nhật ký thực địa cùng hình ảnh trao quà được công khai.
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Right Column: Sticky Donation Card */}
        <div className="lg:col-span-1 space-y-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Tiến độ gây quỹ
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {donationCount} lượt ủng hộ
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-700">
                  {formatVND(campaign.raisedAmount)}
                </span>
                <span className="text-sm font-bold text-gray-600">{progress}%</span>
              </div>

              <Progress
                percent={progress}
                showInfo={false}
                strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                className="mt-2"
              />

              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>Mục tiêu: {formatVND(campaign.targetAmount)}</span>
                <span className="text-sky-700 font-semibold">{volunteerCount} TNV</span>
              </div>
            </div>

            {/* CTAs with direct modals */}
            <div className="space-y-3 pt-2">
              <Button
                type="primary"
                size="large"
                icon={<Heart className="w-4 h-4 fill-white" />}
                onClick={() => setDonateModalOpen(true)}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25"
              >
                Ủng hộ tiền nhanh
              </Button>

              <Link href={`/campaigns/${campaign._id}/donate-product`} className="block">
                <Button
                  size="large"
                  icon={<Package className="w-4 h-4 text-teal-600" />}
                  className="w-full h-12 rounded-xl border border-teal-200 hover:border-teal-500 text-teal-800 font-bold text-sm bg-teal-50/50 hover:bg-teal-50"
                >
                  Ủng hộ hiện vật
                </Button>
              </Link>

              <Button
                size="large"
                icon={<HandHeart className="w-4 h-4 text-sky-600" />}
                onClick={() => setVolunteerModalOpen(true)}
                className="w-full h-12 rounded-xl border border-sky-200 hover:border-sky-500 text-sky-800 font-bold text-sm bg-sky-50/50 hover:bg-sky-50"
              >
                Đăng ký tình nguyện viên
              </Button>
            </div>

            {/* Guarantee note */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2.5 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Giao dịch an toàn & minh bạch 100% qua ReGive Sandbox.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        title="Chia sẻ chiến dịch thiện nguyện"
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Hãy lan tỏa thông điệp của chiến dịch này đến bạn bè và người thân để cùng chung tay giúp đỡ những hoàn cảnh khó khăn:
          </p>

          <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-700 truncate flex-1 font-mono">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </span>
            <Button
              type="primary"
              size="small"
              icon={<Copy className="w-3.5 h-3.5" />}
              onClick={handleCopyLink}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs"
            >
              Sao chép
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Donate Modal */}
      <QuickDonateModal
        campaign={campaign}
        open={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
      />

      {/* Quick Volunteer Modal */}
      <QuickVolunteerModal
        campaign={campaign}
        open={volunteerModalOpen}
        onClose={() => setVolunteerModalOpen(false)}
        onSuccess={() => fetchCampaignData()}
      />

      {/* Add Field Activity Modal */}
      <AddActivityModal
        campaign={campaign}
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        onSuccess={(updated) => setCampaign(updated)}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={campaign}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={(updated) => setCampaign(updated)}
      />
    </div>
  );
}
