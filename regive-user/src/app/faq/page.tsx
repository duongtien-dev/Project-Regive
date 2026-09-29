'use client';

import React from 'react';
import { Collapse } from 'antd';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function FAQPage() {
  const faqItems = [
    {
      key: '1',
      label: 'Làm thế nào để tôi có thể quyên góp tiền cho một chiến dịch?',
      children: (
        <p className="text-sm text-gray-600 leading-relaxed">
          Bạn chỉ cần vào trang <strong>Chiến dịch</strong>, chọn chiến dịch muốn ủng hộ, bấm nút <strong>"Ủng hộ tiền"</strong>, chọn số tiền mong muốn và tiến hành thanh toán qua cổng thanh toán Sandbox của ReGive. Khoản đóng góp sẽ được ghi nhận và cập nhật ngay vào tiến độ chiến dịch.
        </p>
      ),
    },
    {
      key: '2',
      label: 'Quy trình quyên góp hiện vật (quần áo, sách, đồ dùng) diễn ra như thế nào?',
      children: (
        <p className="text-sm text-gray-600 leading-relaxed">
          Khi chọn <strong>"Ủng hộ hiện vật"</strong> tại một chiến dịch, bạn sẽ điền tên vật phẩm, số lượng và tình trạng sử dụng. Ban tổ chức sẽ liên hệ qua số điện thoại để hướng dẫn gửi vật phẩm đến kho tiếp nhận hoặc điểm tập kết gần bạn nhất.
        </p>
      ),
    },
    {
      key: '3',
      label: 'Toàn bộ doanh thu từ Marketplace được sử dụng như thế nào?',
      children: (
        <p className="text-sm text-gray-600 leading-relaxed">
          Các vật phẩm trên Marketplace là vật phẩm quyên góp được kiểm tra và bán gây quỹ. 100% số tiền thu được từ người mua sẽ chuyển trực tiếp vào quỹ các chiến dịch thiện nguyện và được sao kê minh bạch trên hệ thống.
        </p>
      ),
    },
    {
      key: '4',
      label: 'Tôi có thể đăng ký làm tình nguyện viên cho các hoạt động cụ thể không?',
      children: (
        <p className="text-sm text-gray-600 leading-relaxed">
          Có! Mỗi chiến dịch đều có mục <strong>"Đăng ký tình nguyện"</strong>. Bạn điền kỹ năng và thời gian có thể tham gia. Khi được duyệt, bạn sẽ nhận được lịch phân công chi tiết gồm ngày, giờ và địa điểm hoạt động.
        </p>
      ),
    },
    {
      key: '5',
      label: 'Ai có thể gửi yêu cầu hỗ trợ (Beneficiary) trên ReGive?',
      children: (
        <p className="text-sm text-gray-600 leading-relaxed">
          Bất kỳ cá nhân hoặc đại diện hộ gia đình có hoàn cảnh khó khăn khi đăng ký tài khoản với vai trò <strong>Người thụ hưởng (BENEFICIARY)</strong> đều có thể tạo yêu cầu hỗ trợ. Đội ngũ điều phối viên sẽ tiến hành xác minh và điều phối nguồn lực hỗ trợ tận tay.
        </p>
      ),
    },
    {
      key: '6',
      label: 'Thanh toán Sandbox trên hệ thống có mất tiền thật không?',
      children: (
        <p className="text-sm text-gray-600 leading-relaxed">
          Không. Cổng thanh toán Sandbox được xây dựng nhằm mục đích thử nghiệm và mô phỏng hoàn chỉnh quy trình chuyển tiền, xác nhận giao dịch tự động mà không phát sinh bất kỳ khoản phí thực tế nào từ tài khoản ngân hàng của bạn.
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2 border-b border-gray-200 pb-8">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Câu Hỏi Thường Gặp (FAQ)</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Giải đáp các thắc mắc về quy trình quyên góp, tình nguyện và tiếp nhận hỗ trợ tại ReGive.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <Collapse
          defaultActiveKey={['1', '2']}
          items={faqItems}
          bordered={false}
          className="bg-transparent"
        />
      </div>
    </div>
  );
}
