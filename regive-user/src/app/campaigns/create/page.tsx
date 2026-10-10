'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateCampaignForm } from '@/components/campaigns/CreateCampaignForm';

export default function CreateCampaignPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-p-s700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách chiến dịch</span>
      </Link>

      <CreateCampaignForm />
    </div>
  );
}
