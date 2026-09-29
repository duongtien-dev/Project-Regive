'use client';

import React from 'react';
import Link from 'next/link';
import { Tooltip } from 'antd';
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
    <div
      className="clay-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* ── Cover Image ── */}
      <div
        style={{
          position: 'relative',
          height: 200,
          width: '100%',
          backgroundImage: campaign.bannerImage
            ? `linear-gradient(to top, rgba(15,23,42,.80) 0%, rgba(15,23,42,.20) 55%, rgba(15,23,42,.05) 100%), url(${campaign.bannerImage})`
            : 'linear-gradient(135deg, #22C55E 0%, #34D399 50%, #60A5FA 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Top badges */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(15,23,42,.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,.20)',
              color: isUrgent ? '#FCA5A5' : '#A7F3D0',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
            }}
          >
            <Clock className="w-3 h-3" />
            {daysLeftText}
          </span>
          <StatusBadge type="campaign" status={campaign.status} />
        </div>

        {/* Quick View overlay */}
        {onQuickView && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15,23,42,.40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.25s ease',
              zIndex: 10,
            }}
            className="group-hover-overlay"
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}
          >
            <button
              onClick={() => onQuickView(campaign)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,.92)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                color: 'var(--clay-navy)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-clay-md)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Eye className="w-4 h-4" />
              Xem nhanh
            </button>
          </div>
        )}

        {/* Bottom: org + location */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            right: 14,
            zIndex: 10,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 8,
              background: 'rgba(255,255,255,.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.25)',
              color: '#A7F3D0',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 5,
            }}
          >
            {campaign.organization || 'ReGive'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A7F3D0', fontSize: 11 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <MapPin className="w-3 h-3 text-emerald-300" />
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {campaign.location}
              </span>
            </span>
            <span style={{ opacity: .5 }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Calendar className="w-3 h-3 text-emerald-300" />
              {formatDate(campaign.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Link href={`/campaigns/${campaign._id}`} style={{ textDecoration: 'none' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 17,
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
              {campaign.title}
            </h3>
          </Link>

          <p
            style={{
              fontSize: 13,
              color: 'var(--clay-navy-500)',
              lineHeight: 1.65,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {campaign.shortDescription || campaign.goal || campaign.description}
          </p>
        </div>

        {/* ── Progress ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--clay-navy-300)', fontWeight: 600 }}>Đã gây quỹ</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--clay-green-deep)', fontFamily: 'var(--font-heading)' }}>
                {formatVND(campaign.raisedAmount)}
              </span>
            </div>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: progress >= 100 ? 'var(--clay-green-soft)' : 'var(--clay-bg-soft)',
                color: progress >= 100 ? 'var(--clay-green-deep)' : 'var(--clay-navy-500)',
                fontSize: 12,
                fontWeight: 800,
                border: '1.5px solid var(--clay-border)',
              }}
            >
              {progress}%
            </span>
          </div>

          {/* Clay progress bar */}
          <div className="clay-progress-track">
            <div className="clay-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--clay-navy-300)', fontWeight: 500 }}>
              Mục tiêu: {formatVND(campaign.targetAmount)}
            </span>
            {campaign.donationCount ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: 'var(--clay-green-deep)',
                  fontWeight: 700,
                }}
              >
                <Users className="w-3 h-3" />
                {campaign.donationCount} lượt
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {onQuickDonate ? (
            <button
              onClick={() => onQuickDonate(campaign)}
              className="clay-btn-primary"
              style={{ flex: 1, fontSize: 13, padding: '10px 16px', gap: 6 }}
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Ủng hộ nhanh
            </button>
          ) : (
            <Link href={`/campaigns/${campaign._id}/donate-money`} style={{ flex: 1, textDecoration: 'none' }}>
              <button
                className="clay-btn-primary"
                style={{ width: '100%', fontSize: 13, padding: '10px 16px', gap: 6 }}
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Ủng hộ tiền
              </button>
            </Link>
          )}

          <Link href={`/campaigns/${campaign._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button
              className="clay-btn-outline"
              style={{ padding: '10px 14px', fontSize: 13 }}
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
