require('dotenv').config();

const { connectDb } = require('../config/db');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const SupportRequest = require('../models/SupportRequest');
const Notification = require('../models/Notification');

const {
  ROLES,
  CAMPAIGN_STATUS,
  DONATION_TYPES,
  DONATION_STATUS,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
  ORDER_STATUS,
  PAYMENT_PURPOSE,
  PAYMENT_STATUS,
  VOLUNTEER_STATUS,
  SUPPORT_STATUS,
  INVENTORY_TX_TYPE,
} = require('../constants/enums');
const { applyStockChange } = require('../services/inventoryService');
const { shortCode } = require('../utils/codes');

async function seed() {
  await connectDb();
  console.log('--- BẮT ĐẦU SEED DỮ LIỆU ĐẦY ĐỦ CHO REGIVE ---');

  // 1. TÀI KHOẢN NGƯỜI DÙNG
  const accountsData = [
    {
      email: 'admin@regive.local',
      password: 'Admin@123',
      fullName: 'Quản trị viên ReGive',
      phone: '0901000001',
      address: 'Hà Nội',
      role: ROLES.ADMIN,
    },
    {
      email: 'employee@regive.local',
      password: 'Employee@123',
      fullName: 'Nguyễn Văn Điều Phối',
      phone: '0901000002',
      address: 'Đà Nẵng',
      role: ROLES.EMPLOYEE,
    },
    {
      email: 'user@regive.local',
      password: 'User@123',
      fullName: 'Trần Minh Quân',
      phone: '0912345678',
      address: 'TP. Hồ Chí Minh',
      role: ROLES.USER,
    },
    {
      email: 'user1@example.com',
      password: 'password123',
      fullName: 'Nguyễn Văn Hùng',
      phone: '0988776655',
      address: 'Cầu Giấy, Hà Nội',
      role: ROLES.USER,
    },
    {
      email: 'beneficiary@regive.local',
      password: 'Beneficiary@123',
      fullName: 'Hoàng Thị Mơ',
      phone: '0977112233',
      address: 'Bắc Mê, Hà Giang',
      role: ROLES.BENEFICIARY,
      beneficiaryInfo: {
        householdSize: 4,
        note: 'Hộ cận nghèo, 2 con nhỏ, cần sách vở và áo ấm mùa đông.',
      },
    },
    {
      email: 'beneficiary1@example.com',
      password: 'password123',
      fullName: 'Trần Thị Lan',
      phone: '0933445566',
      address: 'Nam Trà My, Quảng Nam',
      role: ROLES.BENEFICIARY,
      beneficiaryInfo: {
        householdSize: 5,
        note: 'Gia đình vùng sạt lở mùa mưa bão, hoàn cảnh đặc biệt khó khăn.',
      },
    },
    {
      email: 'hoangnam@regive.local',
      password: 'User@123',
      fullName: 'Lê Hoàng Nam',
      phone: '0944556677',
      address: 'Hải Châu, Đà Nẵng',
      role: ROLES.USER,
    },
  ];

  const users = {};
  for (const acc of accountsData) {
    let u = await User.findOne({ email: acc.email });
    if (!u) {
      u = await User.create({
        email: acc.email,
        passwordHash: await User.hashPassword(acc.password),
        fullName: acc.fullName,
        phone: acc.phone,
        address: acc.address,
        role: acc.role,
        beneficiaryInfo: acc.beneficiaryInfo,
      });
      console.log(`+ Tạo tài khoản: ${acc.email} (${acc.role})`);
    } else {
      console.log(`= Đã tồn tại tài khoản: ${acc.email}`);
    }
    users[acc.email] = u;
  }

  const adminUser = users['admin@regive.local'];
  const employeeUser = users['employee@regive.local'];
  const demoUser = users['user1@example.com'] || users['user@regive.local'];
  const demoBeneficiary = users['beneficiary1@example.com'] || users['beneficiary@regive.local'];

  // 2. CHIẾN DỊCH THIỆN NGUYỆN (CAMPAIGNS)
  const campaignsData = [
    {
      title: 'Áo Ấm Cho Em — Mùa Đông Vùng Cao Hà Giang 2026',
      shortDescription: 'Gây quỹ trao tặng 1.200 áo phao ấm và 500 chăn bông cho học sinh tiểu học xã Lũng Cú & Đồng Văn vượt qua mùa đông buốt giá.',
      category: 'children',
      bannerImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      description:
        'Hàng ngàn em nhỏ tại các điểm trường xã Lũng Cú và Đồng Văn đang đối mặt với cái lạnh buốt giá dưới 5°C. Chiến dịch quyên góp kinh phí may áo khoác ấm, ủng đi mưa và chăn ấm cho các em.',
      goal: 'Trao tặng 1.200 bộ áo ấm và 500 chăn bông cho học sinh tiểu học Hà Giang.',
      location: 'Đồng Văn, Hà Giang',
      organization: 'CLB Kết Nối Yêu Thương & ReGive Hà Giang',
      contactInfo: {
        representative: 'Nguyễn Văn Minh (Trưởng ban)',
        phone: '0988112233',
        email: 'minh.nguyen@regive.org.vn',
      },
      volunteerConditions: 'Độ tuổi từ 18-35, sức khỏe tốt chịu được địa hình núi cao, ưu tiên có kinh nghiệm đi phượt hoặc sơ cứu cơ bản.',
      targetItems: [
        { name: 'Áo khoác lông vũ chống rét', targetQty: 1200, receivedQty: 780, unit: 'chiếc' },
        { name: 'Chăn ấm siêu nhẹ', targetQty: 500, receivedQty: 320, unit: 'chiếc' },
        { name: 'Ủng đi mưa lót lông', targetQty: 1000, receivedQty: 450, unit: 'đôi' },
      ],
      tags: ['Vùng cao', 'Áo ấm mùa đông', 'Trẻ em', 'Khẩn cấp'],
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 120000000,
      raisedAmount: 86500000,
      activities: [
        {
          title: 'Khảo sát thực địa và trao đợt 1 tại xã Lũng Cú',
          content: 'Đoàn tình nguyện viên ReGive phối hợp Hội Chữ Thập Đỏ đã trao 350 áo phao ấm và 150 chăn bông cho các em học sinh trường Phổ thông Dân tộc Bán trú Lũng Cú.',
          date: new Date('2026-09-18'),
          author: 'Ban Điều Hành ReGive',
          image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80',
        },
        {
          title: 'Tiếp nhận 500 áo khoác lông vũ từ các nhà hảo tâm',
          content: 'Kho ReGive Hà Nội đã hoàn tất phân loại, giặt sấy kháng khuẩn và đóng gói 500 chiếc áo ấm đạt chuẩn để chuẩn bị cho chuyến xe thứ 2.',
          date: new Date('2026-09-24'),
          author: 'Tổ Kiểm Định Vật Phẩm',
          image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      title: 'Chiến Dịch Hỗ Trợ Học Đường Vùng Lũ Miền Trung',
      shortDescription: 'Tái thiết 4 điểm trường tiểu học bị bão lũ tàn phá tại Nam Trà My, trang bị bàn ghế và đồ dùng học tập.',
      category: 'disaster_relief',
      bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      description:
        'Trận lũ lụt vừa qua đã cuốn trôi toàn bộ sách vở, bàn ghế của 4 điểm trường tiểu học tại huyện Nam Trà My. Chúng tôi kêu gọi kinh phí và hiện vật để sửa chữa phòng học và trang bị đồ dùng học tập.',
      goal: 'Tái thiết 4 điểm trường và hỗ trợ dụng cụ học tập cho 450 học sinh.',
      location: 'Nam Trà My, Quảng Nam',
      organization: 'Mạng Lưới Tình Nguyện Miền Trung',
      contactInfo: {
        representative: 'Lê Thu Trang',
        phone: '0977223344',
        email: 'trang.le@regive.org.vn',
      },
      volunteerConditions: 'Ưu tiên TNV tại Quảng Nam/Đà Nẵng có khả năng hỗ trợ dọn dẹp bùn đất và sửa chữa mộc, xây dựng cơ bản.',
      targetItems: [
        { name: 'Bàn ghế học sinh chống nước', targetQty: 150, receivedQty: 90, unit: 'bộ' },
        { name: 'Bộ sách giáo khoa lớp 1-5', targetQty: 450, receivedQty: 310, unit: 'bộ' },
        { name: 'Vở ô ly 96 trang', targetQty: 2500, receivedQty: 1800, unit: 'cuốn' },
      ],
      tags: ['Cứu trợ bão lũ', 'Miền Trung', 'Học đường', 'Tái thiết'],
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-11-30'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 80000000,
      raisedAmount: 52000000,
      activities: [
        {
          title: 'Khởi công sửa chữa mái tôn và sơn mới 3 phòng học',
          content: 'Đội thợ địa phương cùng đội tình nguyện ReGive đã tiến hành lợp lại mái tôn chống bão và thay cửa kính kiên cố cho điểm trường Trà Leng.',
          date: new Date('2026-09-05'),
          author: 'Điều Phối Viên Miền Trung',
          image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      title: 'Bữa Cơm Yêu Thương — Tiếp Sức Người Vô Gia Cư Sài Gòn',
      shortDescription: 'Cung cấp 12.000 suất ăn nóng ấm và nhu yếu phẩm mỗi tuần cho người lao động nghèo và người vô gia cư tại TP.HCM.',
      category: 'poverty_alleviation',
      bannerImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
      description:
        'Mỗi đêm, hàng trăm người lao động nghèo, người già neo đơn và người vô gia cư tại TP.HCM mưu sinh vất vả. Chiến dịch duy trì 1.000 suất ăn nóng ấm mỗi tuần cùng các nhu yếu phẩm cơ bản.',
      goal: 'Phát 12.000 suất ăn dinh dưỡng và nước uống sạch trong vòng 3 tháng.',
      location: 'Quận 1 & Quận 4, TP. Hồ Chí Minh',
      organization: 'Bếp Cơm Sài Gòn Ấm & ReGive Miền Nam',
      contactInfo: {
        representative: 'Trần Hoài An',
        phone: '0903334455',
        email: 'an.tran@regive.org.vn',
      },
      volunteerConditions: 'Nhiệt tình, có phương tiện di chuyển cá nhân vào buổi tối, có mặt đúng giờ tại điểm chuẩn bị lúc 18h00.',
      targetItems: [
        { name: 'Gạo sạch ST25', targetQty: 2000, receivedQty: 1400, unit: 'kg' },
        { name: 'Dầu ăn & Gia vị đóng chai', targetQty: 300, receivedQty: 210, unit: 'chai' },
        { name: 'Hộp bã mía thân thiện môi trường', targetQty: 5000, receivedQty: 3800, unit: 'hộp' },
      ],
      tags: ['Bữa cơm từ thiện', 'TP.HCM', 'Người vô gia cư', 'Tuần hoàn'],
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-12-10'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 60000000,
      raisedAmount: 45200000,
      activities: [
        {
          title: 'Đêm phát cơm thứ 4 - 350 suất ăn dinh dưỡng tại khu vực Chợ Lớn',
          content: 'Hơn 20 tình nguyện viên đã tập trung chuẩn bị cơm thịt kho trứng và sữa tươi trao tận tay các cụ già và người lao động bán vé số dạo.',
          date: new Date('2026-09-22'),
          author: 'Nhóm TNV Sài Gòn Ấm',
          image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
        },
      ],
    },
    {
      title: 'Tủ Sách Tri Thức Cho Trẻ Em Vùng Biên Giới',
      shortDescription: 'Xây dựng 5 thư viện mini thân thiện với 3.000 đầu sách truyện tranh và kỹ năng sống tại Lạng Sơn.',
      category: 'education',
      bannerImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      description:
        'Xây dựng 5 tủ sách cộng đồng với hơn 3.000 đầu sách truyện tranh, sách khoa học và kỹ năng sống cho thiếu nhi tại các xã biên giới Lạng Sơn.',
      goal: 'Xây dựng 5 thư viện mini thân thiện tại các trường bán trú.',
      location: 'Cao Lộc, Lạng Sơn',
      organization: 'Hội Sách Cộng Đồng Việt Nam',
      contactInfo: {
        representative: 'Phạm Hồng Ánh',
        phone: '0912445566',
        email: 'anh.pham@regive.org.vn',
      },
      volunteerConditions: 'Yêu thích đọc sách, có kỹ năng phân loại và bọc dán sách bảo quản, hỗ trợ tổ chức ngày hội đọc.',
      targetItems: [
        { name: 'Sách truyện thiếu nhi & kỹ năng', targetQty: 3000, receivedQty: 1950, unit: 'cuốn' },
        { name: 'Kệ sách gỗ 5 tầng', targetQty: 10, receivedQty: 7, unit: 'cái' },
      ],
      tags: ['Tủ sách', 'Giáo dục', 'Trẻ em biên giới', 'Tri thức'],
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-11-15'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 40000000,
      raisedAmount: 28000000,
      activities: [],
    },
    {
      title: 'Nước Sạch Cho Đồng Bào Hạn Mặn Bến Tre',
      shortDescription: 'Lắp đặt 10 bồn chứa nước dung tích lớn và máy lọc nước RO cung cấp nước ngọt miễn phí cho 1.500 hộ dân.',
      category: 'environment',
      bannerImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      description:
        'Hạn mặn kéo dài khiến hàng ngàn hộ dân thiếu nước sinh hoạt. Chiến dịch lắp đặt 10 bồn chứa nước dung tích lớn và máy lọc nước RO công suất cao.',
      goal: 'Cung cấp nước ngọt sinh hoạt miễn phí cho 1.500 hộ gia đình.',
      location: 'Ba Tri, Bến Tre',
      organization: 'Quỹ Môi Trường Xanh ĐBSCL',
      contactInfo: {
        representative: 'Võ Minh Đạt',
        phone: '0939556677',
        email: 'dat.vo@regive.org.vn',
      },
      volunteerConditions: 'Hiểu biết kỹ thuật lọc nước cơ bản hoặc hỗ trợ vận chuyển lắp đặt bồn chứa tại xã Ba Tri.',
      targetItems: [
        { name: 'Bồn chứa nước Inox 2000L', targetQty: 10, receivedQty: 8, unit: 'bồn' },
        { name: 'Hệ thống máy lọc nước RO công nghiệp', targetQty: 3, receivedQty: 2, unit: 'hệ thống' },
      ],
      tags: ['Nước sạch', 'Bến Tre', 'Hạn mặn', 'Môi trường'],
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-10-31'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 150000000,
      raisedAmount: 115000000,
      activities: [],
    },
    {
      title: 'Hành Trình Chữa Lành — Phẫu Thuật Nụ Cười Trẻ Thơ',
      shortDescription: 'Tài trợ 100% chi phí phẫu thuật nụ cười và phục hồi chức năng phát âm cho 30 em nhỏ hở môi vòm miệng.',
      category: 'healthcare',
      bannerImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
      description:
        'Phối hợp cùng các y bác sĩ tình nguyện mang lại nụ cười trọn vẹn cho các em nhỏ bị dị tật hở môi, vòm miệng có hoàn cảnh khó khăn.',
      goal: 'Tài trợ 100% chi phí phẫu thuật cho 30 em nhỏ.',
      location: 'Bệnh viện Nhi Trung Ương, Hà Nội',
      organization: 'Nhóm Bác Sĩ Tình Nguyện Nụ Cười Mới',
      contactInfo: {
        representative: 'Bác sĩ Đặng Quốc Cường',
        phone: '0913889900',
        email: 'cuong.dang@regive.org.vn',
      },
      volunteerConditions: 'Ưu tiên sinh viên y khoa, điều dưỡng hoặc TNV có kinh nghiệm chăm sóc và chơi đùa cùng bệnh nhi.',
      targetItems: [
        { name: 'Gói hỗ trợ dinh dưỡng hậu phẫu', targetQty: 30, receivedQty: 22, unit: 'suất' },
      ],
      tags: ['Y tế', 'Phẫu thuật nụ cười', 'Trẻ em', 'Bệnh viện'],
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-12-25'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 200000000,
      raisedAmount: 142000000,
      activities: [],
    },
  ];

  const campaigns = [];
  for (const camp of campaignsData) {
    let c = await Campaign.findOne({ title: camp.title });
    if (!c) {
      c = await Campaign.create({
        ...camp,
        createdBy: adminUser._id,
      });
      console.log(`+ Tạo chiến dịch: ${c.title}`);
    } else {
      c.category = camp.category;
      c.bannerImage = camp.bannerImage;
      c.shortDescription = camp.shortDescription;
      c.organization = camp.organization;
      c.contactInfo = camp.contactInfo;
      c.volunteerConditions = camp.volunteerConditions;
      c.targetItems = camp.targetItems;
      c.tags = camp.tags;
      c.activities = camp.activities;
      await c.save();
      console.log(`= Cập nhật chiến dịch: ${c.title}`);
    }
    campaigns.push(c);
  }

  const primaryCampaign = campaigns[0];
  const secondCampaign = campaigns[1];

  // 3. VẬT PHẨM QUYÊN GÓP & MARKETPLACE (PRODUCTS)
  const productsData = [
    {
      name: 'Balo chống gù học sinh cao cấp Tiger Family',
      description: 'Balo học sinh màu xanh đậm, đệm lưng êm ái thoáng khí, các khóa kéo hoạt động hoàn hảo, đã giặt sạch sẽ.',
      category: 'balo',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      price: 150000,
      stockQuantity: 6,
      storageLocation: 'Kệ A1 - Kho Hà Nội',
    },
    {
      name: 'Bộ sách giáo khoa & tuyển tập truyện cổ tích Việt Nam',
      description: 'Bộ sách gồm 12 cuốn truyện tranh màu và sách tham khảo toán - văn cấp 1, giấy còn mới nguyên vẹn không rách.',
      category: 'sach',
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.GOOD,
      quality: PRODUCT_QUALITY.HIGH,
      price: 85000,
      stockQuantity: 15,
      storageLocation: 'Kệ B2 - Kho Hà Nội',
    },
    {
      name: 'Áo khoác gió thể thao chống nước 2 lớp',
      description: 'Áo khoác gió form unisex size L, chất liệu chống gió cản mưa nhẹ, phù hợp thời tiết se lạnh hoặc đi phượt.',
      category: 'quan_ao',
      images: [
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      price: 180000,
      stockQuantity: 5,
      storageLocation: 'Kệ C1 - Kho Đà Nẵng',
    },
    {
      name: 'Bình giữ nhiệt inox cao cấp 500ml',
      description: 'Bình giữ nhiệt chất liệu inox 304 giữ nóng 8h và giữ lạnh 12h, hàng mới chưa qua sử dụng, có hộp đi kèm.',
      category: 'gia_dung',
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.NEW,
      quality: PRODUCT_QUALITY.HIGH,
      price: 120000,
      stockQuantity: 10,
      storageLocation: 'Kệ A3 - Kho TP.HCM',
    },
    {
      name: 'Đèn bàn học LED chống cận thị Rạng Đông',
      description: 'Đèn học có 3 chế độ ánh sáng vàng/trắng/trung tính, ánh sáng dịu mắt, bóng LED tiết kiệm điện năng.',
      category: 'dien_tu',
      images: [
        'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.GOOD,
      quality: PRODUCT_QUALITY.MEDIUM,
      price: 95000,
      stockQuantity: 8,
      storageLocation: 'Kệ D2 - Kho Hà Nội',
    },
    {
      name: 'Giày thể thao nam nữ êm chân size 39',
      description: 'Đôi giày thể thao thể dục màu trắng xám, đế cao su chống trượt, lót trong êm ái, thích hợp đi bộ và chạy bộ.',
      category: 'giay_dep',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      price: 220000,
      stockQuantity: 3,
      storageLocation: 'Kệ E1 - Kho TP.HCM',
    },
    {
      name: 'Bộ xếp hình Lego trí tuệ phát triển tư duy',
      description: 'Hơn 400 chi tiết xếp hình phong phú kích thích sáng tạo cho trẻ nhỏ từ 5 đến 12 tuổi, đầy đủ khay đựng.',
      category: 'do_choi',
      images: [
        'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.GOOD,
      quality: PRODUCT_QUALITY.HIGH,
      price: 160000,
      stockQuantity: 5,
      storageLocation: 'Kệ B1 - Kho Đà Nẵng',
    },
    {
      name: 'Tai nghe chụp tai có micro học trực tuyến',
      description: 'Tai nghe over-ear êm tai, có mic đàm thoại rõ ràng, jack 3.5mm tương thích mọi laptop và điện thoại.',
      category: 'dien_tu',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      ],
      condition: PRODUCT_CONDITION.FAIR,
      quality: PRODUCT_QUALITY.MEDIUM,
      price: 110000,
      stockQuantity: 4,
      storageLocation: 'Kệ D1 - Kho Hà Nội',
    },
  ];

  const createdProducts = [];
  for (const pData of productsData) {
    let prod = await Product.findOne({ name: pData.name });
    if (!prod) {
      prod = await Product.create({
        name: pData.name,
        description: pData.description,
        category: pData.category,
        images: pData.images,
        campaign: primaryCampaign._id,
        condition: pData.condition,
        quality: pData.quality,
        suggestedPrice: pData.price,
        price: pData.price,
        currency: 'VND',
        suitableForMarketplace: true,
        reviewed: true,
        reviewedBy: employeeUser._id,
        reviewedAt: new Date(),
        listedOnMarketplace: true,
        listedAt: new Date(),
        status: PRODUCT_STATUS.LISTED,
        stockQuantity: pData.stockQuantity,
        storageLocation: pData.storageLocation,
        createdBy: employeeUser._id,
      });
      console.log(`+ Tạo sản phẩm Marketplace: ${prod.name}`);
    } else {
      console.log(`= Đã tồn tại sản phẩm: ${prod.name}`);
    }
    createdProducts.push(prod);
  }

  // 4. QUYÊN GÓP (DONATIONS) MẪU CHO DEMO USER
  const donationsData = [
    {
      donor: demoUser._id,
      campaign: primaryCampaign._id,
      type: DONATION_TYPES.MONEY,
      amount: 500000,
      note: 'Chúc các em nhỏ Hà Giang có một mùa đông thật ấm áp!',
      status: DONATION_STATUS.COMPLETED,
    },
    {
      donor: demoUser._id,
      campaign: secondCampaign._id,
      type: DONATION_TYPES.MONEY,
      amount: 200000,
      note: 'Góp chút tấm lòng gửi tới các điểm trường Nam Trà My.',
      status: DONATION_STATUS.PENDING,
    },
    {
      donor: demoUser._id,
      campaign: primaryCampaign._id,
      type: DONATION_TYPES.PRODUCT,
      productInfo: {
        name: 'Áo khoác phao trẻ em',
        quantity: 5,
        description: 'Áo ấm dày dặn size 8-10 tuổi, đã giặt sạch.',
        conditionNote: 'Like new, còn rất mới',
      },
      note: 'Tôi có thể gửi qua bưu điện hoặc mang trực tiếp tới kho.',
      status: DONATION_STATUS.PROCESSING,
    },
  ];

  for (const dData of donationsData) {
    const existing = await Donation.findOne({
      donor: dData.donor,
      campaign: dData.campaign,
      amount: dData.amount,
      type: dData.type,
    });
    if (!existing) {
      await Donation.create(dData);
      console.log(`+ Tạo quyên góp mẫu (${dData.type}) cho user ${demoUser.email}`);
    }
  }

  // 5. ĐĂNG KÝ TÌNH NGUYỆN (VOLUNTEER REGISTRATIONS)
  const existingVolunteer = await VolunteerRegistration.findOne({
    user: demoUser._id,
    campaign: secondCampaign._id,
  });

  if (!existingVolunteer) {
    await VolunteerRegistration.create({
      user: demoUser._id,
      campaign: secondCampaign._id,
      status: VOLUNTEER_STATUS.APPROVED,
      skills: 'Sơ cấp cứu, phân loại hàng cứu trợ, lái xe bán tải',
      availabilityNote: 'Có thể tham gia trọn vẹn 2 ngày cuối tuần',
      schedule: {
        date: new Date('2026-10-17'),
        timeSlot: '07:30 - 17:00',
        location: 'UBND Xã Trà Mai, Huyện Nam Trà My, Quảng Nam',
      },
      reviewedBy: employeeUser._id,
      reviewedAt: new Date(),
    });
    console.log(`+ Tạo đăng ký tình nguyện viên đã duyệt cho ${demoUser.email}`);
  }

  // 6. YÊU CẦU HỖ TRỢ (SUPPORT REQUESTS) CHO BENEFICIARY
  const supportData = [
    {
      beneficiary: demoBeneficiary._id,
      campaign: secondCampaign._id,
      title: 'Xin hỗ trợ sách giáo khoa và áo ấm cho 3 con nhỏ',
      description:
        'Nhà tôi thuộc diện khó khăn tại xã Trà Mai. Mùa lũ vừa qua làm hỏng toàn bộ sách vở của các cháu. Kính mong ban tổ chức xem xét hỗ trợ bộ sách lớp 3, lớp 5 và 3 chiếc áo ấm để các cháu yên tâm tới trường.',
      urgency: 'high',
      status: SUPPORT_STATUS.APPROVED,
      reviewNote:
        'Hồ sơ đã được cán bộ xã xác nhận. Dự kiến chuyển 2 phần quà gồm 3 bộ quần áo và đồ dùng học tập trong đợt công tác ngày 17/10.',
      receivedConfirmed: false,
      handledBy: employeeUser._id,
      handledAt: new Date(),
    },
    {
      beneficiary: demoBeneficiary._id,
      title: 'Hỗ trợ bồn chứa nước sinh hoạt gia đình',
      description:
        'Gia đình neo đơn, nguồn nước giếng bị nhiễm phèn sau mưa bão. Mong nhận được hỗ trợ bồn chứa và thiết bị lọc nước sạch.',
      urgency: 'medium',
      status: SUPPORT_STATUS.IN_PROGRESS,
      reviewNote: 'Đang điều phối vật phẩm từ chiến dịch nước sạch.',
      receivedConfirmed: false,
    },
  ];

  for (const sData of supportData) {
    const exists = await SupportRequest.findOne({
      beneficiary: sData.beneficiary,
      title: sData.title,
    });
    if (!exists) {
      await SupportRequest.create(sData);
      console.log(`+ Tạo yêu cầu hỗ trợ mẫu cho ${demoBeneficiary.email}`);
    }
  }

  // 7. ĐƠN HÀNG MARKETPLACE & THANH TOÁN (ORDERS & PAYMENTS)
  const existingOrder = await Order.findOne({ buyer: demoUser._id });
  if (!existingOrder && createdProducts.length > 0) {
    const targetProduct = createdProducts[0];
    const orderCode = shortCode('ORD');
    const totalAmount = targetProduct.price * 2;

    const order = await Order.create({
      orderCode,
      buyer: demoUser._id,
      items: [
        {
          product: targetProduct._id,
          name: targetProduct.name,
          price: targetProduct.price,
          quantity: 2,
        },
      ],
      totalAmount,
      currency: 'VND',
      status: ORDER_STATUS.PAID,
      shippingAddress: 'Số 15 ngõ 82 Cầu Giấy, Hà Nội',
      phone: '0988776655',
      note: 'Giao trong giờ hành chính giúp mình',
      statusHistory: [
        {
          status: ORDER_STATUS.PENDING,
          at: new Date(Date.now() - 86400000),
          by: demoUser._id,
          note: 'Đặt hàng thành công',
        },
        {
          status: ORDER_STATUS.PAID,
          at: new Date(),
          by: demoUser._id,
          note: 'Đã thanh toán Sandbox',
        },
      ],
    });

    const payment = await Payment.create({
      paymentCode: shortCode('PAY'),
      purpose: PAYMENT_PURPOSE.ORDER,
      amount: totalAmount,
      currency: 'VND',
      status: PAYMENT_STATUS.SUCCESS,
      provider: 'sandbox',
      payer: demoUser._id,
      order: order._id,
      sandboxToken: shortCode('SBX'),
      paidAt: new Date(),
    });

    order.payment = payment._id;
    await order.save();
    console.log(`+ Tạo đơn hàng & thanh toán mẫu: ${order.orderCode} (${formatVND(totalAmount)})`);
  }

  // 8. THÔNG BÁO (NOTIFICATIONS)
  const notificationsData = [
    {
      user: demoUser._id,
      title: 'Đăng ký tình nguyện đã được duyệt!',
      message:
        'Hồ sơ tham gia chiến dịch "Học Đường Vùng Lũ" đã được phê duyệt. Vui lòng kiểm tra lịch phân công chi tiết tại mục Đăng ký tình nguyện.',
      type: 'volunteer',
      isRead: false,
    },
    {
      user: demoUser._id,
      title: 'Đơn hàng đã thanh toán thành công',
      message: 'Đơn hàng vật phẩm gây quỹ của bạn đã được xác nhận thanh toán. Nhân viên đang đóng gói gửi hàng.',
      type: 'order',
      isRead: true,
    },
    {
      user: demoUser._id,
      title: 'Tiếp nhận quyên góp hiện vật',
      message: 'Món đồ quyên góp "Áo khoác phao trẻ em" của bạn đang được nhân viên xử lý tiếp nhận.',
      type: 'donation',
      isRead: false,
    },
    {
      user: demoBeneficiary._id,
      title: 'Yêu cầu hỗ trợ đã được phê duyệt',
      message:
        'Yêu cầu "Xin hỗ trợ sách giáo khoa và áo ấm" của bạn đã được duyệt. Điều phối viên sẽ chuyển đồ hỗ trợ theo lịch công tác.',
      type: 'support',
      isRead: false,
    },
  ];

  for (const nData of notificationsData) {
    const exists = await Notification.findOne({
      user: nData.user,
      title: nData.title,
    });
    if (!exists) {
      await Notification.create(nData);
      console.log(`+ Tạo thông báo cho user: ${nData.title}`);
    }
  }

  function formatVND(amt) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
  }

  console.log('\n=============================================');
  console.log(' SEED DỮ LIỆU THÀNH CÔNG! BẠN CÓ THỂ ĐĂNG NHẬP:');
  console.log(' - User (Người hảo tâm): user1@example.com / password123');
  console.log(' - User (Người hảo tâm): user@regive.local / User@123');
  console.log(' - Beneficiary (Thụ hưởng): beneficiary1@example.com / password123');
  console.log(' - Employee (Điều phối): employee@regive.local / Employee@123');
  console.log(' - Admin: admin@regive.local / Admin@123');
  console.log('=============================================\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Lỗi khi seed:', err);
  process.exit(1);
});
