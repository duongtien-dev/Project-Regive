'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Progress, Tabs, Alert } from 'antd';
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
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/types';
import { formatVND, formatDate, calculateProgress } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DetailSkeleton } from '@/components/shared/LoadingSkeleton';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadCampaign() {
      try {
        setLoading(true);
        setError(null);
        const data = await campaignService.getById(id);
        setCampaign(data);
      } catch (err: any) {
        setError(err.message || 'Không tìm thấy chiến dịch');
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [id]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Main Grid: Left details & Story, Right donation card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cover & Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Banner */}
          <div className="relative h-64 sm:h-80 w-full rounded-3xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-sky-600 p-8 flex flex-col justify-end text-white overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-5 right-5 z-10">
              <StatusBadge type="campaign" status={campaign.status} />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  <span>{campaign.location}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-emerald-300" />
                  <span>
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {campaign.title}
              </h1>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <Tabs
              defaultActiveKey="story"
              items={[
                {
                  key: 'story',
                  label: 'Câu chuyện chiến dịch',
                  children: (
                    <div className="space-y-6 pt-2 text-gray-700 leading-relaxed">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Mục tiêu chiến dịch</h3>
                        <p className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-emerald-900 text-sm">
                          {campaign.goal}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Chi tiết kế hoạch</h3>
                        <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">
                          {campaign.description}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Được điều phối bởi Ban tổ chức ReGive</span>
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Chiến dịch đã được thẩm định</span>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'transparency',
                  label: 'Minh bạch & Tiếp nhận',
                  children: (
                    <div className="space-y-4 pt-2 text-sm text-gray-600">
                      <p>
                        Toàn bộ các khoản đóng góp tiền mặt và hiện vật cho chiến dịch này được ghi nhận trực tiếp trên hệ thống ReGive.
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          Tiền mặt: thanh toán qua cổng điện tử Sandbox và cộng trực tiếp vào tiến độ gây quỹ ngay sau khi thanh toán thành công.
                        </li>
                        <li>
                          Hiện vật: được nhân viên tiếp nhận, kiểm định phẩm chất và điều phối trực tiếp tới tay người thụ hưởng.
                        </li>
                        <li>
                          Tình nguyện viên: được đăng ký và nhận lịch phân công chính thức từ điều phối viên.
                        </li>
                      </ul>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Right Column: Donation & Actions Box (Sticky) */}
        <div className="lg:col-span-1 space-y-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg space-y-6">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                Tiến độ gây quỹ
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-emerald-700">
                  {formatVND(campaign.raisedAmount)}
                </span>
                <span className="text-sm font-bold text-gray-600">{progress}%</span>
              </div>

              <Progress
                percent={progress}
                showInfo={false}
                strokeColor={{
                  '0%': '#10b981',
                  '100%': '#059669',
                }}
                className="mt-2"
              />

              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>Mục tiêu: {formatVND(campaign.targetAmount)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Link href={`/campaigns/${campaign._id}/donate-money`} className="block">
                <Button
                  type="primary"
                  size="large"
                  icon={<Heart className="w-4 h-4 fill-white" />}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
                >
                  Ủng hộ tiền
                </Button>
              </Link>

              <Link href={`/campaigns/${campaign._id}/donate-product`} className="block">
                <Button
                  size="large"
                  icon={<Package className="w-4 h-4 text-teal-600" />}
                  className="w-full h-12 rounded-xl border border-teal-200 hover:border-teal-500 text-teal-800 font-bold text-sm bg-teal-50/50 hover:bg-teal-50"
                >
                  Ủng hộ hiện vật
                </Button>
              </Link>

              <Link href={`/campaigns/${campaign._id}/volunteer`} className="block">
                <Button
                  size="large"
                  icon={<HandHeart className="w-4 h-4 text-sky-600" />}
                  className="w-full h-12 rounded-xl border border-sky-200 hover:border-sky-500 text-sky-800 font-bold text-sm bg-sky-50/50 hover:bg-sky-50"
                >
                  Đăng ký tình nguyện
                </Button>
              </Link>
            </div>

            {/* Guarantee note */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2.5 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Giao dịch an toàn & minh bạch 100% qua ReGive Sandbox.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
