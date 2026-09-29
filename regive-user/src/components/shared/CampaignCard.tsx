import React from 'react';
import Link from 'next/link';
import { Progress } from 'antd';
import { MapPin, Calendar, ArrowRight, HeartHandshake } from 'lucide-react';
import { Campaign } from '@/types';
import { formatVND, formatDate, calculateProgress } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Visual Header / Cover */}
      <div className="relative h-48 w-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 flex items-center justify-center p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge type="campaign" status={campaign.status} />
        </div>
        <div className="text-center z-10 relative">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
            Chiến dịch vì cộng đồng
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center text-xs text-gray-500 gap-3 mb-2">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[140px]">{campaign.location}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(campaign.endDate)}</span>
          </span>
        </div>

        <Link href={`/campaigns/${campaign._id}`}>
          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {campaign.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
          {campaign.goal || campaign.description}
        </p>

        {/* Progress & Amount */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-baseline mb-1">
            <div>
              <span className="text-xs text-gray-500">Đã gây quỹ: </span>
              <span className="text-sm font-bold text-emerald-700">
                {formatVND(campaign.raisedAmount)}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-600">{progress}%</span>
          </div>

          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={{
              '0%': '#10b981',
              '100%': '#059669',
            }}
            size={['100%', 8]}
          />

          <div className="flex justify-between items-center text-xs text-gray-500 mt-1.5">
            <span>Mục tiêu: {formatVND(campaign.targetAmount)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 flex items-center justify-between">
          <Link
            href={`/campaigns/${campaign._id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-600 hover:text-white transition-all duration-200"
          >
            <span>Ủng hộ & Đồng hành</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
