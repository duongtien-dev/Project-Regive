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
} from 'lucide-react';
import { marketplaceService } from '@/services/marketplaceService';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { Product } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { formatVND } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DetailSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy Now modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await marketplaceService.getMarketplaceDetail(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
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

  const hasImage = product.images && product.images.length > 0;
  const totalPrice = product.price * quantity;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
        {/* Left: Product Images */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden relative">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Package className="w-20 h-20 stroke-[1.2] text-emerald-500 mb-2" />
                <span className="text-sm font-medium">Vật phẩm trao tặng ReGive</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info and Order Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {product.category || 'Vật phẩm'}
                </span>
                {product.condition && <StatusBadge type="product" status={product.condition} />}
                {product.quality && (
                  <Tag color="blue" className="text-xs font-semibold px-2 py-0.5 rounded-full">
                    Chất lượng: {product.quality}
                  </Tag>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-baseline justify-between">
                <span className="text-xs text-gray-500 font-medium">Giá ủng hộ quỹ:</span>
                <span className="text-3xl font-black text-emerald-700">
                  {formatVND(product.price)}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-4 pt-2 border-t border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Mô tả sản phẩm</h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {product.description || 'Sản phẩm quyên góp được kiểm tra và phân loại bởi đội ngũ ReGive.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-0.5">Số lượng còn lại:</span>
                  <span className="font-bold text-gray-900 text-sm">{product.stockQuantity} món</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-0.5">Mục đích:</span>
                  <span className="font-bold text-emerald-700 text-sm">Gây quỹ từ thiện</span>
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
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all"
              >
                {product.stockQuantity > 0 ? 'Mua ngay & Gây quỹ' : 'Tạm hết hàng'}
              </Button>
            </div>

            <div className="pt-2 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Giao hàng tận nơi toàn quốc qua đơn vị vận chuyển đối tác.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% số tiền mua sắm được ghi nhận vào quỹ thiện nguyện minh bạch.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Now Modal */}
      <Modal
        title={
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">Xác Nhận Đặt Hàng</h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              Vật phẩm: <span className="font-semibold text-gray-800">{product.name}</span>
            </p>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
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
                  (Tối đa: {product.stockQuantity} sản phẩm)
                </span>
              </div>
            </Form.Item>

            <Form.Item
              label="Địa chỉ giao hàng"
              name="shippingAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}
            >
              <Input placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..." size="large" className="!rounded-xl" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại nhận hàng"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="09xxxxxxxx" size="large" className="!rounded-xl" />
            </Form.Item>

            <Form.Item label="Ghi chú đơn hàng" name="note">
              <Input.TextArea rows={2} placeholder="Ghi chú thêm về thời gian nhận hàng..." className="!rounded-xl" />
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
