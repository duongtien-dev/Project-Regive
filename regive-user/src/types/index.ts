export type Role = 'USER' | 'BENEFICIARY' | 'EMPLOYEE' | 'ADMIN';

export type BeneficiaryInfo = {
  householdSize?: number | null;
  note?: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: Role;
  isActive: boolean;
  beneficiaryInfo?: BeneficiaryInfo;
  createdAt?: string;
  updatedAt?: string;
};

export type CampaignStatus = 'draft' | 'active' | 'closed' | 'cancelled';

export type Campaign = {
  _id: string;
  title: string;
  description: string;
  goal: string;
  location: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  targetAmount: number;
  raisedAmount: number;
  createdBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
    role?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
};

export type DonationType = 'money' | 'product';
export type DonationStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'rejected';

export type ProductDonationInfo = {
  name: string;
  quantity: number;
  description?: string;
  conditionNote?: string;
};

export type Donation = {
  _id: string;
  donor: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | string;
  campaign: {
    _id?: string;
    title?: string;
    status?: string;
    location?: string;
  } | string;
  type: DonationType;
  amount: number;
  productInfo?: ProductDonationInfo;
  note?: string;
  status: DonationStatus;
  processedBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type VolunteerStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type VolunteerSchedule = {
  date?: string;
  timeSlot?: string;
  location?: string;
};

export type VolunteerRegistration = {
  _id: string;
  user: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | string;
  campaign: {
    _id?: string;
    title?: string;
    location?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } | string;
  skills?: string;
  availabilityNote?: string;
  status: VolunteerStatus;
  schedule?: VolunteerSchedule;
  reviewedBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportUrgency = 'low' | 'medium' | 'high';
export type SupportStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export type SupportRequest = {
  _id: string;
  beneficiary: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    beneficiaryInfo?: BeneficiaryInfo;
  } | string;
  campaign?: {
    _id?: string;
    title?: string;
    status?: string;
  } | string | null;
  title: string;
  description: string;
  urgency: SupportUrgency;
  status: SupportStatus;
  reviewNote?: string;
  handledBy?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | string;
  handledAt?: string;
  receivedConfirmed?: boolean;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor' | 'damaged';
export type ProductQuality = 'high' | 'medium' | 'low';
export type ProductStatus = 'draft' | 'assessed' | 'in_stock' | 'listed' | 'sold_out' | 'rejected' | 'archived';

export type Product = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  images: string[];
  donation?: string | null;
  campaign?: {
    _id?: string;
    title?: string;
    status?: string;
  } | string | null;
  condition?: ProductCondition;
  quality?: ProductQuality;
  suggestedPrice?: number;
  price: number;
  currency: string;
  suitableForMarketplace: boolean;
  stockQuantity: number;
  listedOnMarketplace: boolean;
  listedAt?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export type OrderItem = {
  product: {
    _id?: string;
    name?: string;
    images?: string[];
    price?: number;
    status?: string;
    stockQuantity?: number;
  } | string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatusHistory = {
  status: OrderStatus;
  at: string;
  by?: string;
  note?: string;
};

export type Order = {
  _id: string;
  orderCode: string;
  buyer: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  } | string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: string;
  phone: string;
  note?: string;
  statusHistory: OrderStatusHistory[];
  payment?: {
    _id?: string;
    paymentCode?: string;
    status?: string;
    amount?: number;
    paidAt?: string;
    provider?: string;
  } | string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentPurpose = 'order' | 'donation';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export type Payment = {
  _id: string;
  id?: string;
  paymentCode: string;
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  sandboxToken?: string;
  order?: {
    _id?: string;
    orderCode?: string;
    status?: string;
    totalAmount?: number;
  } | string | null;
  donation?: {
    _id?: string;
    type?: string;
    amount?: number;
    status?: string;
  } | string | null;
  payer?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | string;
  checkoutHint?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
};
