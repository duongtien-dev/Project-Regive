'use client';

import React from 'react';
import Link from 'next/link';
import { Drawer, Button, Progress, Tag, Divider, Tooltip } from 'antd';
import {
  MapPin,
  Calendar,
  Heart,
  Package,
  HandHeart,
  ShieldCheck,
  ExternalLink,
  Users,
  Clock,
  Phone,
  Mail,
  Building,
  Sparkles,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { Campaign } from '@/types';
import { formatVND, formatDate, calculateProgress } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface CampaignQuickViewDrawerProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
  onOpenDonateMoney?: (campaign: Campaign) => void;
  onOpenVolunteer?: (campaign: Campaign) => void;
}

export const CampaignQuickViewDrawer: React.FC<CampaignQuickViewDrawerProps> = ({
  campaign,
  open,
  onClose,
  onOpenDonateMoney,
  onOpenVolunteer,
}) => {
  if (!campaign) return null;

  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);

  const now = new Date().getTime();
  const end = new Date(campaign.endDate).getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const daysLeftText = diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã kết thúc';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-p-s600 bg-p-s50 px-2.5 py-1 rounded-full">
              Xem nhanh chiến dịch
            </span>
            <StatusBadge type="campaign" status={campaign.status} />
          </div>
          <Link
            href={`/campaigns/${campaign._id}`}
            onClick={onClose}
            className="text-xs text-p-s700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Trang đầy đủ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      styles={{
        body: { padding: '0 0 80px 0' },
      }}
    >
      <div className="space-y-6">
        {/* Banner Cover */}
        <div
          className="relative h-56 w-full p-6 flex flex-col justify-end text-white bg-cover bg-center"
          style={{
            backgroundImage: campaign.bannerImage
              ? `linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%), url(${campaign.bannerImage})`
              : 'linear-gradient(to tr, #024870, #0aa3d6, #18c9ff)',
          }}
        >
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-p-s400" />
            {daysLeftText}
          </div>

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-p-s200">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-p-s300" />
                {campaign.location}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-p-s300" />
                {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-snug">{campaign.title}</h2>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Progress & Target Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">Tiến độ quyên góp:</span>
                <span className="text-2xl font-black text-p-s700">
                  {formatVND(campaign.raisedAmount)}
                </span>
                <span className="text-xs text-gray-400 ml-1.5">/ {formatVND(campaign.targetAmount)}</span>
              </div>
              <span className="text-sm font-extrabold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                {progress}%
              </span>
            </div>

            <Progress
              percent={progress}
              showInfo={false}
              strokeColor={{ '0%': '#024870', '100%': '#18c9ff' }}
            />

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span className="inline-flex items-center gap-1 text-p-s700 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-p-s600" />
                {campaign.donationCount || 0} lượt ủng hộ
              </span>
              <span className="inline-flex items-center gap-1 text-sky-700 font-semibold">
                <Users className="w-3.5 h-3.5" />
                {campaign.volunteerCount || 0} tình nguyện viên
              </span>
            </div>
          </div>

          {/* Goal & Short Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-p-s600" />
              <span>Mục tiêu chiến dịch</span>
            </h4>
            <p className="text-sm text-gray-800 font-medium bg-p-s50/60 p-4 rounded-xl border border-p-s100 leading-relaxed">
              {campaign.goal}
            </p>
          </div>

          {/* Description Snippet */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Giới thiệu chi tiết
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {campaign.shortDescription || campaign.description}
            </p>
          </div>

          {/* Target Physical Items Needed (if any) */}
          {campaign.targetItems && campaign.targetItems.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-sec-s600" />
                <span>Vật phẩm hiện vật đang kêu gọi ({campaign.targetItems.length})</span>
              </h4>
              <div className="space-y-2">
                {campaign.targetItems.map((item, idx) => {
                  const itemProgress = item.targetQty ? Math.min(100, Math.round((item.receivedQty / item.targetQty) * 100)) : 0;
                  return (
                    <div key={idx} className="p-3 bg-sec-s50/50 rounded-xl border border-sec-s100 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>{item.name}</span>
                        <span className="text-sec-s800">
                          {item.receivedQty} / {item.targetQty} {item.unit}
                        </span>
                      </div>
                      <Progress percent={itemProgress} size="small" strokeColor="#18c9ff" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Organizer & Contact Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Đơn vị tổ chức & Người liên hệ</span>
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1.5 text-gray-700">
              <p className="font-bold text-gray-900">{campaign.organization || 'Ban Điều Hành ReGive'}</p>
              {campaign.contactInfo?.representative && (
                <p><strong>Người đại diện:</strong> {campaign.contactInfo.representative}</p>
              )}
              {campaign.contactInfo?.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-p-s600" />
                  <strong>Điện thoại:</strong> {campaign.contactInfo.phone}
                </p>
              )}
              {campaign.contactInfo?.email && (
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-p-s600" />
                  <strong>Email:</strong> {campaign.contactInfo.email}
                </p>
              )}
            </div>
          </div>

          {/* Volunteer Conditions */}
          {campaign.volunteerConditions && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <HandHeart className="w-3.5 h-3.5 text-sky-600" />
                <span>Yêu cầu tình nguyện viên</span>
              </h4>
              <p className="text-xs text-sky-950 bg-sky-50/70 p-3.5 rounded-xl border border-sky-100 leading-relaxed">
                {campaign.volunteerConditions}
              </p>
            </div>
          )}

          {/* Recent Activity snippet */}
          {campaign.activities && campaign.activities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-p-s600" />
                <span>Hoạt động mới nhất ({campaign.activities.length})</span>
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between items-center font-bold text-gray-800">
                  <span>{campaign.activities[0].title}</span>
                  <span className="text-[10px] text-gray-400">
                    {campaign.activities[0].date ? formatDate(campaign.activities[0].date) : ''}
                  </span>
                </div>
                <p className="text-gray-600 line-clamp-2">{campaign.activities[0].content}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {campaign.tags && campaign.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {campaign.tags.map((tag, i) => (
                <Tag key={i} className="text-xs px-2.5 py-0.5 rounded-md border-0 bg-gray-100 text-gray-700">
                  #{tag}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 flex gap-2 z-20">
        <Button
          type="primary"
          icon={<Heart className="w-4 h-4 fill-white" />}
          onClick={() => {
            onClose();
            if (onOpenDonateMoney) onOpenDonateMoney(campaign);
          }}
          className="flex-1 h-11 rounded-xl bg-p-s600 hover:bg-p-s700 text-white font-bold text-xs shadow-md shadow-p-s600/20"
        >
          Ủng hộ tiền
        </Button>

        <Link href={`/campaigns/${campaign._id}/donate-product`} onClick={onClose} className="flex-1">
          <Button
            icon={<Package className="w-4 h-4 text-sec-s600" />}
            className="w-full h-11 rounded-xl border-sec-s200 text-sec-s800 font-bold text-xs bg-sec-s50 hover:bg-sec-s100"
          >
            Ủng hộ đồ
          </Button>
        </Link>

        <Button
          icon={<HandHeart className="w-4 h-4 text-sky-600" />}
          onClick={() => {
            onClose();
            if (onOpenVolunteer) onOpenVolunteer(campaign);
          }}
          className="flex-1 h-11 rounded-xl border-sky-200 text-sky-800 font-bold text-xs bg-sky-50 hover:bg-sky-100"
        >
          Tình nguyện
        </Button>
      </div>
    </Drawer>
  );
};
