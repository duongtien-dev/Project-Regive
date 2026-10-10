import React from 'react';
import { Empty, Button } from 'antd';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Chưa có thông tin hiển thị tại mục này.',
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div className={`py-12 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200 ${className}`}>
      <Empty
        description={
          <div className="mt-2">
            <p className="text-base font-semibold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500 max-w-sm mt-1">{description}</p>
          </div>
        }
      >
        {actionText && actionHref && (
          <Link href={actionHref}>
            <Button type="primary" className="bg-p-s600 hover:bg-p-s700 text-white rounded-lg">
              {actionText}
            </Button>
          </Link>
        )}
        {actionText && onAction && !actionHref && (
          <Button
            type="primary"
            onClick={onAction}
            className="bg-p-s600 hover:bg-p-s700 text-white rounded-lg"
          >
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};
