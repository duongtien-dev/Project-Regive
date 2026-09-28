require('dotenv').config();

const { connectDb } = require('../config/db');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const {
  ROLES,
  CAMPAIGN_STATUS,
  DONATION_TYPES,
  DONATION_STATUS,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
} = require('../constants/enums');
const { applyStockChange } = require('../services/inventoryService');
const { INVENTORY_TX_TYPE } = require('../constants/enums');

async function seed() {
  await connectDb();

  const accounts = [
    {
      email: 'admin@regive.local',
      password: 'Admin@123',
      fullName: 'ReGive Admin',
      role: ROLES.ADMIN,
    },
    {
      email: 'employee@regive.local',
      password: 'Employee@123',
      fullName: 'ReGive Employee',
      role: ROLES.EMPLOYEE,
    },
    {
      email: 'user@regive.local',
      password: 'User@123',
      fullName: 'ReGive Donor User',
      role: ROLES.USER,
    },
    {
      email: 'beneficiary@regive.local',
      password: 'Beneficiary@123',
      fullName: 'ReGive Beneficiary',
      role: ROLES.BENEFICIARY,
      beneficiaryInfo: { householdSize: 4, note: 'Demo household' },
    },
  ];

  const created = {};
  for (const account of accounts) {
    let user = await User.findOne({ email: account.email });
    if (!user) {
      user = await User.create({
        email: account.email,
        passwordHash: await User.hashPassword(account.password),
        fullName: account.fullName,
        role: account.role,
        beneficiaryInfo: account.beneficiaryInfo,
      });
      console.log(`Created ${account.role}: ${account.email}`);
    } else {
      console.log(`Exists ${account.role}: ${account.email}`);
    }
    created[account.role] = user;
  }

  let campaign = await Campaign.findOne({ title: 'Chiến dịch hỗ trợ học đường 2026' });
  if (!campaign) {
    campaign = await Campaign.create({
      title: 'Chiến dịch hỗ trợ học đường 2026',
      description: 'Quyên góp sách vở, dụng cụ học tập và tiền hỗ trợ học sinh khó khăn.',
      goal: 'Hỗ trợ 200 học sinh',
      location: 'Đà Nẵng',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 50000000,
      raisedAmount: 0,
      createdBy: created[ROLES.ADMIN]._id,
    });
    console.log('Created demo active campaign');
  } else {
    console.log('Demo campaign already exists');
  }

  // Sprint 2 demo: product donation → assessed → stocked → listed
  let donation = await Donation.findOne({
    donor: created[ROLES.USER]._id,
    type: DONATION_TYPES.PRODUCT,
    'productInfo.name': 'Balo học sinh second-hand',
  });

  if (!donation) {
    donation = await Donation.create({
      donor: created[ROLES.USER]._id,
      campaign: campaign._id,
      type: DONATION_TYPES.PRODUCT,
      productInfo: {
        name: 'Balo học sinh second-hand',
        quantity: 3,
        description: 'Balo còn tốt, đã vệ sinh',
        conditionNote: 'like new',
      },
      status: DONATION_STATUS.PROCESSING,
      processedBy: created[ROLES.EMPLOYEE]._id,
      processedAt: new Date(),
    });
    console.log('Created demo product donation');
  }

  let product = await Product.findOne({ donation: donation._id });
  if (!product) {
    product = await Product.create({
      name: 'Balo học sinh second-hand',
      description: 'Balo còn tốt, phù hợp học sinh cấp 2-3',
      category: 'bags',
      donation: donation._id,
      campaign: campaign._id,
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      suggestedPrice: 120000,
      price: 120000,
      suitableForMarketplace: true,
      reviewed: true,
      reviewedBy: created[ROLES.EMPLOYEE]._id,
      reviewedAt: new Date(),
      status: PRODUCT_STATUS.ASSESSED,
      stockQuantity: 0,
      storageLocation: 'Kệ A1',
      createdBy: created[ROLES.EMPLOYEE]._id,
      assessmentNote: 'Seed assessment — ready for marketplace',
    });

    await applyStockChange({
      productId: product._id,
      type: INVENTORY_TX_TYPE.IN,
      quantity: 3,
      userId: created[ROLES.EMPLOYEE]._id,
      reason: 'Seed stock in',
      storageLocation: 'Kệ A1',
      referenceType: 'donation',
      referenceId: donation._id.toString(),
    });

    product = await Product.findById(product._id);
    product.listedOnMarketplace = true;
    product.listedAt = new Date();
    product.status = PRODUCT_STATUS.LISTED;
    await product.save();
    console.log('Created demo marketplace product');
  } else {
    console.log('Demo marketplace product already exists');
  }

  // Sprint 3 demo: draft product waiting for AI assessment
  let aiDonation = await Donation.findOne({
    donor: created[ROLES.USER]._id,
    type: DONATION_TYPES.PRODUCT,
    'productInfo.name': 'Áo khoác denim second-hand',
  });
  if (!aiDonation) {
    aiDonation = await Donation.create({
      donor: created[ROLES.USER]._id,
      campaign: campaign._id,
      type: DONATION_TYPES.PRODUCT,
      productInfo: {
        name: 'Áo khoác denim second-hand',
        quantity: 1,
        description: 'Áo khoác jean còn tốt, like new',
        conditionNote: 'like new',
      },
      status: DONATION_STATUS.PROCESSING,
      processedBy: created[ROLES.EMPLOYEE]._id,
      processedAt: new Date(),
    });
    console.log('Created Sprint 3 AI demo donation');
  }

  let aiProduct = await Product.findOne({ donation: aiDonation._id });
  if (!aiProduct) {
    aiProduct = await Product.create({
      name: 'Áo khoác denim second-hand',
      description: 'Áo khoác jean còn tốt, đã giặt sạch, like new',
      category: 'clothing',
      images: ['https://example.com/demo-jacket.jpg'],
      donation: aiDonation._id,
      campaign: campaign._id,
      status: PRODUCT_STATUS.DRAFT,
      stockQuantity: 0,
      createdBy: created[ROLES.EMPLOYEE]._id,
    });
    console.log('Created Sprint 3 AI draft product (pending AI review)');
  } else {
    console.log('Sprint 3 AI draft product already exists');
  }

  console.log('\nSeed done. Demo passwords:');
  accounts.forEach((a) => console.log(`- ${a.email} / ${a.password}`));
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
