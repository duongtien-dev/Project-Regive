'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Heart,
  Eye,
  Clock,
  Users,
} from 'lucide-react';
import { Campaign } from '@/types';
import { formatVND, formatDate, calculateProgress } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

interface CampaignCardProps {
  campaign: Campaign;
  onQuickView?: (campaign: Campaign) => void;
  onQuickDonate?: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onQuickView,
  onQuickDonate,
}) => {
  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);

  const now = new Date().getTime();
  const end = new Date(campaign.endDate).getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const daysLeftText = diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã kết thúc';
  const isUrgent = diffDays > 0 && diffDays <= 7;

  return (
    <div className="clay-card flex flex-col h-full overflow-hidden cursor-default group">
      {/* ── Cover Image ── */}
      <div
        className="relative h-52 w-full bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: campaign.bannerImage
            ? `linear-gradient(to top, rgba(15,23,42,.80) 0%, rgba(15,23,42,.20) 55%, rgba(15,23,42,.05) 100%), url(${campaign.bannerImage})`
            : 'linear-gradient(135deg, #024870 0%, #0aa3d6 50%, #18c9ff 100%)',
        }}
      >
        {/* Top badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-n-s900/60 backdrop-blur-md border border-white/20 text-[11px] font-bold ${
              isUrgent ? 'text-red-300' : 'text-p-s200'
            }`}
          >
            <Clock className="w-3 h-3" />
            {daysLeftText}
          </span>
          <StatusBadge type="campaign" status={campaign.status} />
        </div>

        {/* Quick View overlay */}
        {onQuickView && (
          <div className="absolute inset-0 bg-n-s900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => onQuickView(campaign)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border-0 text-n-s900 text-xs font-bold cursor-pointer shadow-md hover:scale-105 transition-transform"
            >
              <Eye className="w-4 h-4" />
              Xem nhanh
            </button>
          </div>
        )}

        {/* Bottom: org + location */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/25 text-p-s200 text-[10px] font-bold tracking-wider uppercase mb-1.5">
            {campaign.organization || 'ReGive'}
          </span>
          <div className="flex items-center gap-2 text-p-s100 text-xs font-medium">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-p-s300 shrink-0" />
              <span className="max-w-[120px] truncate">
                {campaign.location}
              </span>
            </span>
            <span className="opacity-50">•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-p-s300 shrink-0" />
              {formatDate(campaign.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <Link href={`/campaigns/${campaign._id}`} className="no-underline block">
            <h3 className="text-base sm:text-lg font-bold text-n-s900 leading-snug mb-2 line-clamp-2 hover:text-p-s700 transition-colors">
              {campaign.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-n-s600 leading-relaxed m-0 line-clamp-2">
            {campaign.shortDescription || campaign.goal || campaign.description}
          </p>
        </div>

        {/* ── Progress ── */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <span className="block text-[11px] text-n-s400 font-semibold">Đã gây quỹ</span>
              <span className="text-base font-black text-p-s600">
                {formatVND(campaign.raisedAmount)}
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                progress >= 100
                  ? 'bg-p-s100 text-p-s700 border-p-s300'
                  : 'bg-n-s50 text-n-s600 border-n-s200'
              }`}
            >
              {progress}%
            </span>
          </div>

          {/* Clay progress bar */}
          <div className="clay-progress-track">
            <div className="clay-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>

          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[11px] text-n-s400 font-medium">
              Mục tiêu: {formatVND(campaign.targetAmount)}
            </span>
            {campaign.donationCount ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-p-s600 font-bold">
                <Users className="w-3 h-3" />
                {campaign.donationCount} lượt
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-2">
          {onQuickDonate ? (
            <button
              onClick={() => onQuickDonate(campaign)}
              className="clay-btn-primary flex-1 text-xs sm:text-sm py-2 px-3 gap-1.5 justify-center"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Ủng hộ nhanh
            </button>
          ) : (
            <Link href={`/campaigns/${campaign._id}/donate-money`} className="flex-1 no-underline">
              <button
                className="clay-btn-primary w-full text-xs sm:text-sm py-2 px-3 gap-1.5 justify-center"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Ủng hộ tiền
              </button>
            </Link>
          )}

          <Link href={`/campaigns/${campaign._id}`} className="no-underline shrink-0">
            <button
              className="clay-btn-outline py-2 px-3 text-xs sm:text-sm justify-center"
            >
              Chi tiết
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
