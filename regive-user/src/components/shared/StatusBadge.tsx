import React from 'react';
import { Tag } from 'antd';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

type StatusType =
  | 'donation'
  | 'volunteer'
  | 'support'
  | 'order'
  | 'payment'
  | 'campaign'
  | 'product';

interface StatusBadgeProps {
  type: StatusType;
  status?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon?: React.ReactNode }
> = {
  // Common
  pending: { label: 'Chờ duyệt / xử lý', color: 'orange', icon: <Clock className="w-3 h-3 mr-1 inline" /> },
  processing: { label: 'Đang xử lý', color: 'blue', icon: <RefreshCw className="w-3 h-3 mr-1 inline animate-spin" /> },
  completed: { label: 'Hoàn tất', color: 'green', icon: <CheckCircle2 className="w-3 h-3 mr-1 inline" /> },
  rejected: { label: 'Từ chối', color: 'red', icon: <XCircle className="w-3 h-3 mr-1 inline" /> },
  cancelled: { label: 'Đã hủy', color: 'default', icon: <XCircle className="w-3 h-3 mr-1 inline" /> },

  // Volunteer & Support
  approved: { label: 'Đã duyệt', color: 'green', icon: <CheckCircle2 className="w-3 h-3 mr-1 inline" /> },
  in_progress: { label: 'Đang hỗ trợ', color: 'cyan', icon: <RefreshCw className="w-3 h-3 mr-1 inline animate-spin" /> },

  // Order
  paid: { label: 'Đã thanh toán', color: 'cyan', icon: <CheckCircle2 className="w-3 h-3 mr-1 inline" /> },
  shipped: { label: 'Đang giao hàng', color: 'purple', icon: <RefreshCw className="w-3 h-3 mr-1 inline" /> },

  // Payment
  success: { label: 'Thành công', color: 'green', icon: <CheckCircle2 className="w-3 h-3 mr-1 inline" /> },
  failed: { label: 'Thất bại', color: 'red', icon: <AlertCircle className="w-3 h-3 mr-1 inline" /> },

  // Campaign
  active: { label: 'Đang gây quỹ', color: 'green' },
  closed: { label: 'Đã kết thúc', color: 'default' },
  draft: { label: 'Bản nháp', color: 'default' },

  // Product Condition
  new: { label: 'Mới 100%', color: 'green' },
  like_new: { label: 'Như mới', color: 'cyan' },
  good: { label: 'Tốt', color: 'blue' },
  fair: { label: 'Chấp nhận được', color: 'gold' },
  poor: { label: 'Cũ', color: 'default' },
  damaged: { label: 'Hỏng hóc', color: 'red' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  if (!status) return null;
  const cfg = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    color: 'default',
  };

  return (
    <Tag color={cfg.color} className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${className || ''}`}>
      {cfg.icon}
      {cfg.label}
    </Tag>
  );
};
