'use client';

import React from 'react';
import Link from 'next/link';
import { Progress, Button, Tooltip } from 'antd';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Heart,
  Eye,
  Building,
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

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Visual Header / Cover Image */}
      <div
        className="relative h-52 w-full bg-cover bg-center flex flex-col justify-between p-4 overflow-hidden"
        style={{
          backgroundImage: campaign.bannerImage
            ? `linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 60%, rgba(0,0,0,0.1) 100%), url(${campaign.bannerImage})`
            : 'linear-gradient(to tr, #059669, #0d9488, #0284c7)',
        }}
      >
        <div className="flex items-center justify-between z-10">
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-300" />
            {daysLeftText}
          </span>
          <StatusBadge type="campaign" status={campaign.status} />
        </div>

        {/* Quick View trigger on hover */}
        {onQuickView && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 pointer-events-none group-hover:pointer-events-auto">
            <Button
              type="primary"
              size="small"
              icon={<Eye className="w-3.5 h-3.5" />}
              onClick={() => onQuickView(campaign)}
              className="bg-white/90 text-gray-900 hover:bg-white font-bold rounded-xl h-9 px-3.5 border-0 shadow-md"
            >
              Xem nhanh
            </Button>
          </div>
        )}

        <div className="relative z-10 text-white">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-emerald-100 mb-1">
            {campaign.organization || 'ReGive'}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-emerald-100">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-300" />
              <span className="truncate max-w-[130px]">{campaign.location}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-300" />
              <span>{formatDate(campaign.endDate)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link href={`/campaigns/${campaign._id}`}>
            <h3 className="font-black text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {campaign.title}
            </h3>
          </Link>

          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
            {campaign.shortDescription || campaign.goal || campaign.description}
          </p>
        </div>

        {/* Progress & Target Section */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[11px] text-gray-400 block">Đã gây quỹ:</span>
              <span className="text-sm font-black text-emerald-700">
                {formatVND(campaign.raisedAmount)}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
              {progress}%
            </span>
          </div>

          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
            size={['100%', 7]}
          />

          <div className="flex justify-between items-center text-[11px] text-gray-400">
            <span>Mục tiêu: {formatVND(campaign.targetAmount)}</span>
            {campaign.donationCount ? (
              <span className="text-emerald-700 font-semibold">{campaign.donationCount} lượt ủng hộ</span>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          {onQuickDonate ? (
            <Button
              type="primary"
              size="small"
              icon={<Heart className="w-3.5 h-3.5 fill-white" />}
              onClick={() => onQuickDonate(campaign)}
              className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              Ủng hộ nhanh
            </Button>
          ) : (
            <Link href={`/campaigns/${campaign._id}/donate-money`} className="flex-1">
              <Button
                type="primary"
                size="small"
                icon={<Heart className="w-3.5 h-3.5 fill-white" />}
                className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Ủng hộ tiền
              </Button>
            </Link>
          )}

          <Link href={`/campaigns/${campaign._id}`} className="shrink-0">
            <Button
              size="small"
              className="h-9 px-3 rounded-xl border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-600 text-xs font-semibold"
            >
              Chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
