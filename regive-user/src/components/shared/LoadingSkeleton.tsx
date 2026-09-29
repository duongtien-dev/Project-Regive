import React from 'react';
import { Skeleton, Card } from 'antd';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <Skeleton.Image className="!w-full !h-48 rounded-xl mb-4" active />
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100">
      <Skeleton active paragraph={{ rows }} title={{ width: '40%' }} />
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton.Image className="!w-full !h-72 rounded-2xl" active />
      <Skeleton active paragraph={{ rows: 6 }} title={{ width: '60%' }} />
    </div>
  );
};
