import React from 'react';
import { ShieldCheck, FileText, Lock, RefreshCw } from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-gray-200 pb-6 text-center">
        <h1 className="text-3xl font-black text-gray-900">Chính Sách & Điều Khoản Hoạt Động</h1>
        <p className="text-xs text-gray-400 mt-2">Cập nhật lần cuối: Tháng 09/2026</p>
      </div>

      <div className="space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm text-sm text-gray-600 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>1. Nguyên Tắc Minh Bạch Tài Chính</span>
          </h2>
          <p>
            ReGive cam kết mọi khoản tiền ủng hộ của nhà hảo tâm đều được ghi nhận trực tiếp vào tiến độ thực tế của chiến dịch. Toàn bộ dòng tiền thu được từ việc bán sản phẩm tuần hoàn trên Marketplace được chuyển 100% vào quỹ hoạt động vì cộng đồng.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-teal-600" />
            <span>2. Quy Định Tiếp Nhận Vật Phẩm Quyên Góp</span>
          </h2>
          <p>
            Nhằm đảm bảo an toàn và vệ sinh cho người thụ hưởng, ReGive chỉ tiếp nhận các vật phẩm còn nguyên vẹn, sử dụng tốt, không rách nát, ẩm mốc hoặc có nguy cơ gây mất an toàn (cháy nổ, hóa chất độc hại, pin hư hỏng). Các vật phẩm không đạt tiêu chuẩn an toàn sẽ bị từ chối tiếp nhận.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-600" />
            <span>3. Bảo Mật Thông Tin & Dữ Liệu Cá Nhân</span>
          </h2>
          <p>
            Thông tin cá nhân bao gồm họ tên, số điện thoại, địa chỉ và thông tin hoàn cảnh khó khăn của người thụ hưởng được lưu trữ bảo mật và chỉ được chia sẻ cho nhân viên tiếp nhận, điều phối viên thiện nguyện của ReGive nhằm phục vụ công tác xác minh và vận chuyển hỗ trợ.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>4. Quyền & Trách Nhiệm Của Tình Nguyện Viên</span>
          </h2>
          <p>
            Tình nguyện viên tham gia trên tinh thần tự nguyện, có trách nhiệm tuân thủ nội quy an toàn, thời gian và địa điểm đã được ban tổ chức phân công. ReGive có trách nhiệm trang bị trang thiết bị bảo hộ, hướng dẫn công việc và đảm bảo sự công bằng, tôn trọng lẫn nhau trong mọi hoạt động.
          </p>
        </section>
      </div>
    </div>
  );
}
