'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Modal, Form, Input, InputNumber, Alert, message, Tag } from 'antd';
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  CheckCircle,
  Truck,
  Sparkles,
  Award,
  HeartHandshake,
} from 'lucide-react';
import { marketplaceService } from '@/services/marketplaceService';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { Product } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { formatVND } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProductCard } from '@/components/shared/ProductCard';
import { DetailSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy Now modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadProductAndRelated() {
      try {
        setLoading(true);
        setError(null);
        const [data, allProducts] = await Promise.all([
          marketplaceService.getMarketplaceDetail(id),
          marketplaceService.listMarketplace().catch(() => []),
        ]);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        setRelatedProducts(allProducts.filter((p) => p._id !== id).slice(0, 4));
      } catch (err: any) {
        setError(err.message || 'Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    }
    loadProductAndRelated();
  }, [id]);

  const handleOpenBuyModal = () => {
    if (!user) {
      message.info('Vui lòng đăng nhập để tiến hành mua hàng');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setModalOpen(true);
  };

  const handleConfirmOrder = async (values: any) => {
    if (!product) return;
    try {
      setPlacingOrder(true);
      setOrderError(null);

      // 1. Create order
      const order = await orderService.create({
        productId: product._id,
        quantity,
        shippingAddress: values.shippingAddress,
        phone: values.phone,
        note: values.note,
      });

      // 2. Create payment
      const payment = await paymentService.create({
        purpose: 'order',
        orderId: order._id,
      });

      message.success('Tạo đơn hàng thành công! Đang chuyển đến trang thanh toán...');
      setModalOpen(false);

      const paymentId = payment.id || payment._id;
      router.push(`/payments/${paymentId}/checkout`);
    } catch (err: any) {
      setOrderError(err.message || 'Có lỗi xảy ra khi đặt đơn hàng');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Alert
          message="Không tìm thấy sản phẩm"
          description={error || 'Sản phẩm này không còn tồn tại trên marketplace.'}
          type="error"
          showIcon
          className="mb-6"
        />
        <Button onClick={() => router.push('/marketplace')} icon={<ArrowLeft className="w-4 h-4" />}>
          Về danh sách sản phẩm
        </Button>
      </div>
    );
  }

  const hasImage = Boolean(selectedImage || (product.images && product.images.length > 0));
  const activeImage = selectedImage || (product.images ? product.images[0] : '');
  const totalPrice = product.price * quantity;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back link */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Chợ vật phẩm</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Product Images with Gallery */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center overflow-hidden space-y-4">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden relative">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Package className="w-20 h-20 stroke-[1.2] text-emerald-500 mb-2" />
                <span className="text-sm font-medium">Vật phẩm trao tặng ReGive</span>
              </div>
            )}
          </div>

          {/* Thumbnails if multiple */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto w-full pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                    activeImage === img ? 'border-emerald-600 shadow-sm' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quality Inspection Seal Box */}
          <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Chứng nhận kiểm định ReGive Quality Shield</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Vật phẩm đã được nhân viên ReGive tiếp nhận, khử khuẩn, kiểm tra công năng và đóng gói theo quy chuẩn bảo vệ môi trường.
            </p>
          </div>
        </div>

        {/* Right: Info and Order Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {product.category || 'Vật phẩm'}
                </span>
                {product.condition && <StatusBadge type="product" status={product.condition} />}
                {product.quality && (
                  <Tag color="blue" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-0">
                    Phẩm chất: {product.quality}
                  </Tag>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">Giá ủng hộ gây quỹ:</span>
                  <span className="text-3xl font-black text-emerald-700">
                    {formatVND(product.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-800 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    100% gây quỹ
                  </span>
                </div>
              </div>

              {/* Linked Target Campaign */}
              {product.campaign && typeof product.campaign === 'object' && product.campaign.title && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
                      <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Chiến dịch thụ hưởng doanh thu</span>
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-sm truncate">
                      {product.campaign.title}
                    </h4>
                    <p className="text-xs text-amber-900/80">
                      100% số tiền {formatVND(product.price)} sẽ được nạp trực tiếp vào quỹ hỗ trợ của chiến dịch này.
                    </p>
                  </div>
                  <Link
                    href={`/campaigns/${product.campaign._id}`}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Xem quỹ
                  </Link>
                </div>
              )}

              {/* AI Verification & Quality Card */}
              {product.latestAiAssessment && (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>Kiểm định chất lượng bằng AI (AI Assessment)</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                      Độ tin cậy {Math.round((product.latestAiAssessment.suggestion?.confidence || 0.8) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                      <span className="text-gray-400 block text-[10px]">Tình trạng ghi nhận:</span>
                      <span className="font-bold text-teal-900 uppercase">
                        {product.latestAiAssessment.suggestion?.condition || product.condition}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                      <span className="text-gray-400 block text-[10px]">Phẩm chất:</span>
                      <span className="font-bold text-teal-900 uppercase">
                        {product.latestAiAssessment.suggestion?.quality || product.quality || 'Tốt'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-4 pt-2 border-t border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Mô tả sản phẩm</h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {product.description || 'Sản phẩm quyên góp được kiểm tra và phân loại bởi đội ngũ ReGive.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-0.5">Số lượng còn trong kho:</span>
                  <span className="font-black text-gray-900 text-sm">{product.stockQuantity} món</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-0.5">Địa điểm lưu kho:</span>
                  <span className="font-bold text-emerald-700 text-sm truncate block">
                    {product.storageLocation || 'Kho ReGive Trung Tâm'}
                  </span>
                </div>
              </div>
            </div>

            {/* Buy Now Button */}
            <div className="pt-2">
              <Button
                type="primary"
                size="large"
                disabled={product.stockQuantity <= 0}
                onClick={handleOpenBuyModal}
                icon={<ShoppingBag className="w-5 h-5" />}
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all"
              >
                {product.stockQuantity > 0 ? 'Mua ngay để gây quỹ' : 'Tạm hết hàng'}
              </Button>
            </div>

            <div className="pt-2 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Giao hàng tận nơi toàn quốc qua đơn vị vận chuyển đối tác.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Số tiền mua sắm được cộng thẳng vào nguồn lực cứu trợ ReGive.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Khám phá thêm
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                Vật Phẩm Trao Tặng Khác
              </h3>
            </div>
            <Link
              href="/marketplace"
              className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Buy Now Modal */}
      <Modal
        title={
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">Xác Nhận Đặt Hàng & Gây Quỹ</h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              Vật phẩm: <span className="font-semibold text-gray-800">{product.name}</span>
            </p>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-2xl"
      >
        <div className="py-4 space-y-4">
          {orderError && <Alert message="Lỗi đặt hàng" description={orderError} type="error" showIcon />}

          <Form
            layout="vertical"
            onFinish={handleConfirmOrder}
            initialValues={{
              quantity: 1,
              shippingAddress: user?.address || '',
              phone: user?.phone || '',
            }}
            requiredMark="optional"
          >
            <Form.Item label="Số lượng muốn mua" required>
              <div className="flex items-center gap-3">
                <InputNumber
                  min={1}
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  size="large"
                  className="!rounded-xl w-32"
                />
                <span className="text-xs text-gray-400">
                  (Còn lại: {product.stockQuantity} món)
                </span>
              </div>
            </Form.Item>

            <Form.Item
              label="Địa chỉ giao nhận hàng"
              name="shippingAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}
            >
              <Input placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..." size="large" className="!rounded-xl" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại liên hệ"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="09xxxxxxxx" size="large" className="!rounded-xl" />
            </Form.Item>

            <Form.Item label="Ghi chú đơn hàng" name="note">
              <Input.TextArea rows={2} placeholder="Ghi chú thời gian nhận hàng thuận tiện..." className="!rounded-xl" />
            </Form.Item>

            {/* Total calculation */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-gray-500 block">Tổng tiền thanh toán:</span>
                <span className="text-xs text-gray-400">
                  {formatVND(product.price)} × {quantity}
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-700">
                {formatVND(totalPrice)}
              </span>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={placingOrder}
              size="large"
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
            >
              Xác nhận và Chuyển đến thanh toán
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
