require('dotenv').config();

const { connectDb } = require('../config/db');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const AiAssessment = require('../models/AiAssessment');
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
  AI_ASSESSMENT_STATUS,
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

  // 2. CHIẾN DỊCH THIỆN NGUYỆN (CAMPAIGNS) VỚI ĐẦY ĐỦ TRƯỜNG CHI TIẾT
  const campaignsData = [
    {
      title: 'Áo Ấm Cho Em — Mùa Đông Vùng Cao Hà Giang 2026',
      shortDescription:
        'Gây quỹ may 1.200 áo phao ấm 3 lớp, 500 chăn bông và 1.000 đôi ủng đi mưa cho học sinh tiểu học xã Lũng Cú, Đồng Văn & Lũng Táo.',
      category: 'children',
      urgency: 'urgent',
      bannerImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'Hàng ngàn em nhỏ tại các điểm trường xã Lũng Cú, Lũng Táo và Đồng Văn đang đối mặt với cái lạnh buốt giá dưới 5°C của mùa đông vùng cao Đông Bắc. Nhiều em phải đi chân trần trên nền đá tai mèo trơn trượt và chỉ mặc một manh áo mỏng manh.\n\nChiến dịch “Áo Ấm Cho Em 2026” do CLB Kết Nối Yêu Thương phối hợp cùng Nền tảng ReGive phát động nhằm mang hơi ấm đến 1.200 em học sinh mầm non và tiểu học. Toàn bộ kinh phí sẽ được dùng để may áo khoác phao 3 lớp chống thấm, mua chăn ấm và ủng đi mưa, đồng thời tổ chức bữa ăn dinh dưỡng ngày trao quà.',
      goal: 'Trao tặng 1.200 áo khoác phao giữ nhiệt, 500 chăn bông và 1.000 đôi ủng đi mưa cho trẻ em vùng cao Hà Giang.',
      location: 'Đồng Văn & Mèo Vạc, Hà Giang',
      beneficiaryCount: 1200,
      beneficiaryUnit: 'học sinh tiểu học và mầm non',
      impactSummary: 'Trang bị 1.200 áo phao ấm 3 lớp, 500 chăn bông và 1.000 đôi ủng chống rét cho học sinh 3 xã biên giới Hà Giang.',
      organization: 'CLB Kết Nối Yêu Thương & ReGive Hà Giang',
      contactInfo: {
        representative: 'Nguyễn Văn Minh (Trưởng ban Điều Phối)',
        phone: '0988112233',
        email: 'minh.nguyen@regive.org.vn',
      },
      bankAccount: {
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountNumber: '9999AOAMHAGIANG',
        accountHolder: 'QUY THIEN NGUYEN REGIVE VIET NAM',
        branch: 'Chi nhánh Ba Đình, Hà Nội',
        qrCodeUrl: '',
      },
      volunteerConditions:
        'Độ tuổi 18-35, sức khỏe dẻo dai thích nghi tốt thời tiết lạnh dưới 5°C, tuân thủ kỷ luật đoàn đi phượt/tình nguyện vùng cao, ưu tiên TNV có kỹ năng sơ cứu hoặc chụp ảnh tư liệu.',
      targetItems: [
        { name: 'Áo khoác lông vũ 3 lớp chống rét', targetQty: 1200, receivedQty: 780, unit: 'chiếc' },
        { name: 'Chăn bông siêu nhẹ giữ nhiệt', targetQty: 500, receivedQty: 320, unit: 'chiếc' },
        { name: 'Ủng đi mưa lót nỉ chống trượt', targetQty: 1000, receivedQty: 450, unit: 'đôi' },
        { name: 'Khăn len & Găng tay ấm', targetQty: 1200, receivedQty: 900, unit: 'bộ' },
      ],
      budgetBreakdown: [
        {
          title: 'May 1.200 áo khoác phao 3 lớp chuyên dụng',
          percentage: 70,
          amount: 56000000,
          description: 'Đặt may trực tiếp tại xưởng với chất liệu vải dù gió chống nước và lót bông ép giữ nhiệt dày dặn.',
        },
        {
          title: 'Mua 500 chăn bông ấm & 1.000 đôi ủng',
          percentage: 18,
          amount: 14400000,
          description: 'Cung cấp chăn đắp tại các điểm trường bán trú và ủng cao su cho các em đi bộ qua đèo núi.',
        },
        {
          title: 'Vận chuyển hàng hóa vượt đèo & Hậu cần đoàn',
          percentage: 12,
          amount: 9600000,
          description: 'Thuê xe tải 3.5 tấn vận chuyển từ Hà Nội lên Hà Giang và trung chuyển bằng xe máy vào các điểm trường bản sâu.',
        },
        {
          title: 'Phí vận hành nền tảng ReGive',
          percentage: 0,
          amount: 0,
          description: 'ReGive tài trợ 100% chi phí công nghệ & quản trị — 0% phí nền tảng.',
        },
      ],
      timeline: [
        {
          phase: 'Giai đoạn 1',
          date: '01/09/2026 - 15/09/2026',
          title: 'Khảo sát tiền trạm & Lập danh sách điểm trường',
          description: 'Đoàn tiền trạm khảo sát 8 điểm trường lẻ tại Lũng Táo và Đồng Văn, chốt danh sách 1.200 em khó khăn nhất.',
          status: 'completed',
        },
        {
          phase: 'Giai đoạn 2',
          date: '16/09/2026 - 31/10/2026',
          title: 'Gây quỹ cộng đồng & Đặt may áo ấm',
          description: 'Phát động chiến dịch gây quỹ và đặt xưởng may áo khoác theo kích cỡ chiều cao của từng lớp.',
          status: 'in_progress',
        },
        {
          phase: 'Giai đoạn 3',
          date: '01/11/2026 - 30/11/2026',
          title: 'Tập kết kho bãi & Đóng gói suất quà',
          description: 'Kiểm tra chất lượng áo ấm, đóng gói theo từng điểm trường và tập kết tại kho Hà Nội sẵn sàng xuất phát.',
          status: 'upcoming',
        },
        {
          phase: 'Giai đoạn 4',
          date: '05/12/2026 - 15/12/2026',
          title: 'Hành trình trao quà thực địa tại Hà Giang',
          description: 'Đoàn 25 tình nguyện viên di chuyển lên Hà Giang, trao tận tay các em học sinh và nấu bữa ăn ấm áp.',
          status: 'upcoming',
        },
      ],
      faqs: [
        {
          question: 'Tôi có thể ủng hộ áo ấm cũ đã qua sử dụng không?',
          answer:
            'Có. ReGive hoan nghênh hiện vật cũ còn dùng tốt (>80%), sạch sẽ, không rách nát. Sau khi tiếp nhận, đội ngũ ReGive sẽ phân loại, giặt sấy nhiệt độ cao và tiệt trùng UV-C trước khi chuyển lên vùng cao.',
        },
        {
          question: 'Làm thế nào để tôi kiểm tra dòng tiền ủng hộ của mình?',
          answer:
            'Mọi khoản đóng góp qua tài khoản hoặc cổng thanh toán đều được hệ thống ReGive ghi nhận tức thì vào mục "Sao kê minh bạch" và cập nhật vào số dư công khai của chiến dịch theo thời gian thực.',
        },
        {
          question: 'Tôi muốn đăng ký tham gia đoàn trao quà trực tiếp tại Hà Giang thì làm sao?',
          answer:
            'Bạn hãy nhấn nút "Đăng ký tình nguyện viên" ngay trên trang chiến dịch, điền kỹ năng và ghi chú thời gian tham gia. Ban điều phối sẽ liên hệ phỏng vấn và xếp lịch tập huấn.',
        },
      ],
      verificationStatus: {
        isVerified: true,
        verifiedAt: new Date('2026-08-25'),
        verifiedBy: 'UBND Huyện Đồng Văn & Hội Đồng Giám Định ReGive',
        licenseNumber: 'GP-TGQ-2026/UBND-HG',
      },
      donationGuidelines: {
        moneyNote:
          '100% số tiền ủng hộ được nạp vào quỹ chiến dịch, sao kê tự động theo thời gian thực và giải ngân minh bạch có hóa đơn chứng từ.',
        productNote:
          'Quần áo ấm, chăn màn hoặc sách vở cần sạch sẽ, lành lặn. Xin không gửi đồ hè hoặc đồ hư hỏng.',
        receivingAddress: 'Kho Tổng ReGive Hà Nội: Số 15 Cầu Giấy, Hà Nội — ĐT tiếp nhận: 0988112233.',
      },
      tags: ['Áo ấm', 'Hà Giang', 'Trẻ em', 'Mùa đông', 'Vùng cao', 'Đồng Văn'],
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 80000000,
      raisedAmount: 53500000,
      activities: [
        {
          title: 'Khảo sát thực tế điểm trường Lũng Táo',
          date: new Date('2026-09-10'),
          content: 'Đoàn tiền trạm đã đến 3 điểm trường lẻ, ghi nhận 420 em học sinh thiếu áo khoác mùa đông và ủng đi đường đất sình lầy.',
          image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
          author: 'Nguyễn Văn Minh',
        },
        {
          title: 'Tiếp nhận đợt hàng áo ấm đợt 1',
          date: new Date('2026-09-25'),
          content: 'Đã hoàn tất may 400 áo khoác phao 3 lớp tại xưởng may đối tác, sẵn sàng chuyển về kho tổng tập kết.',
          image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
          author: 'Ban Hậu Cần',
        },
      ],
    },
    {
      title: 'Tủ Sách Tri Thức Cho Trẻ Em Vùng Biên Giới',
      shortDescription:
        'Xây dựng 5 thư viện mini thân thiện với 3.000 đầu sách truyện tranh, khoa học và kỹ năng sống tại các trường bán trú Lạng Sơn.',
      category: 'education',
      urgency: 'normal',
      bannerImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'Thiếu thốn nguồn sách đọc giải trí và tài liệu bổ trợ khiến việc phát triển kỹ năng đọc hiểu của các em học sinh vùng biên giới gặp nhiều hạn chế. Dự án hướng tới việc xây dựng 5 không gian đọc mở thân thiện, trang bị đầy đủ kệ sách gỗ, thảm ngồi và 3.000 cuốn sách mới.',
      goal: 'Xây dựng 5 thư viện mini thân thiện tại các trường bán trú tiểu học Cao Lộc, Lạng Sơn.',
      location: 'Cao Lộc & Tràng Định, Lạng Sơn',
      beneficiaryCount: 3000,
      beneficiaryUnit: 'học sinh bán trú',
      impactSummary: 'Xây dựng 5 thư viện mini thân thiện với 3.000 đầu sách truyện tranh và kỹ năng sống tại Lạng Sơn.',
      organization: 'Hội Sách Cộng Đồng Việt Nam',
      contactInfo: {
        representative: 'Phạm Hồng Ánh',
        phone: '0912445566',
        email: 'anh.pham@regive.org.vn',
      },
      bankAccount: {
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountNumber: '9999TUSACHBIENGIOI',
        accountHolder: 'QUY THIEN NGUYEN REGIVE VIET NAM',
        branch: 'Chi nhánh Hà Nội',
        qrCodeUrl: '',
      },
      volunteerConditions: 'Yêu thích đọc sách, có kỹ năng phân loại và bọc dán sách bảo quản, hỗ trợ tổ chức ngày hội đọc.',
      targetItems: [
        { name: 'Sách truyện thiếu nhi & kỹ năng', targetQty: 3000, receivedQty: 1950, unit: 'cuốn' },
        { name: 'Kệ sách gỗ 5 tầng', targetQty: 10, receivedQty: 7, unit: 'cái' },
        { name: 'Bàn đọc và thảm nỉ ngồi đọc', targetQty: 15, receivedQty: 10, unit: 'bộ' },
      ],
      budgetBreakdown: [
        {
          title: 'Mua 3.000 đầu sách thiếu nhi và kỹ năng mới',
          percentage: 65,
          amount: 26000000,
          description: 'Sách truyện cổ tích, bách khoa toàn thư, truyện tranh lịch sử NXB Kim Đồng.',
        },
        {
          title: 'Đóng mới 10 kệ sách gỗ và bàn đọc thân thiện',
          percentage: 25,
          amount: 10000000,
          description: 'Kệ sách gỗ chống ẩm 5 tầng thiết kế bo tròn an toàn cho thiếu nhi.',
        },
        {
          title: 'Tổ chức ngày hội đọc sách & Quà tặng học tập',
          percentage: 10,
          amount: 4000000,
          description: 'Trao tặng bộ dụng cụ học tập và tổ chức thi đố vui đọc sách cho các em.',
        },
      ],
      timeline: [
        {
          phase: 'Giai đoạn 1',
          date: '15/09/2026 - 30/09/2026',
          title: 'Thu gom sách & Phân loại tuyển chọn',
          description: 'Tiếp nhận sách quyên góp từ các trường học và chọn lọc đầu sách phù hợp lứa tuổi.',
          status: 'completed',
        },
        {
          phase: 'Giai đoạn 2',
          date: '01/10/2026 - 25/10/2026',
          title: 'Sản xuất kệ sách & Mua sách bổ sung',
          description: 'Đặt làm kệ sách gỗ và mua mới 1.500 đầu sách thiếu nhi.',
          status: 'in_progress',
        },
        {
          phase: 'Giai đoạn 3',
          date: '01/11/2026 - 15/11/2026',
          title: 'Lắp đặt và Khai trương 5 thư viện mini',
          description: 'Vận chuyển lên Lạng Sơn, hoàn thiện trang trí và tổ chức ngày hội đọc sách.',
          status: 'upcoming',
        },
      ],
      faqs: [
        {
          question: 'Tôi có thể quyên góp sách cũ không?',
          answer: 'Có. Sách truyện tranh, sách khoa học, văn học thiếu nhi còn nguyên vẹn không rách bìa đều được tiếp nhận.',
        },
      ],
      verificationStatus: {
        isVerified: true,
        verifiedAt: new Date('2026-09-01'),
        verifiedBy: 'Phòng GD&ĐT Huyện Cao Lộc & ReGive',
        licenseNumber: 'GP-GD-2026/LS',
      },
      tags: ['Tủ sách', 'Giáo dục', 'Trẻ em biên giới', 'Tri thức', 'Lạng Sơn'],
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-11-15'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 40000000,
      raisedAmount: 28000000,
      activities: [],
    },
    {
      title: 'Nước Sạch Cho Đồng Bào Hạn Mặn Bến Tre',
      shortDescription:
        'Lắp đặt 10 bồn chứa nước inox dung tích lớn và 3 máy lọc nước RO công nghiệp cung cấp nước ngọt miễn phí cho 1.500 hộ dân.',
      category: 'environment',
      urgency: 'emergency',
      bannerImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'Hạn mặn kéo dài khốc liệt tại khu vực hạ lưu sông Tiền khiến hàng ngàn hộ dân xã Ba Tri không có nước ngọt để ăn uống và sinh hoạt. Chiến dịch khẩn cấp lắp đặt 10 bồn chứa nước 2000L và 3 trạm lọc nước RO công suất lớn phục vụ bà con.',
      goal: 'Cung cấp nước ngọt sinh hoạt miễn phí cho 1.500 hộ gia đình tại Ba Tri, Bến Tre.',
      location: 'Ba Tri & Bình Đại, Bến Tre',
      beneficiaryCount: 1500,
      beneficiaryUnit: 'hộ gia đình',
      impactSummary: 'Lắp đặt 10 bồn chứa nước 2000L và 3 hệ thống máy lọc nước RO công nghiệp cho 1.500 hộ dân.',
      organization: 'Quỹ Môi Trường Xanh ĐBSCL',
      contactInfo: {
        representative: 'Võ Minh Đạt',
        phone: '0939556677',
        email: 'dat.vo@regive.org.vn',
      },
      bankAccount: {
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountNumber: '9999NUOCSACHBENTRE',
        accountHolder: 'QUY THIEN NGUYEN REGIVE VIET NAM',
        branch: 'Chi nhánh Bến Tre',
        qrCodeUrl: '',
      },
      volunteerConditions: 'Hiểu biết kỹ thuật lọc nước cơ bản hoặc hỗ trợ vận chuyển lắp đặt bồn chứa tại xã Ba Tri.',
      targetItems: [
        { name: 'Bồn chứa nước Inox 2000L', targetQty: 10, receivedQty: 8, unit: 'bồn' },
        { name: 'Hệ thống máy lọc nước RO công nghiệp', targetQty: 3, receivedQty: 2, unit: 'hệ thống' },
      ],
      budgetBreakdown: [
        {
          title: '3 Hệ thống máy lọc nước RO công nghiệp (1.000L/h)',
          percentage: 60,
          amount: 90000000,
          description: 'Hệ thống xử lý nước mặn thành nước tinh khiết uống trực tiếp đạt chuẩn BYT.',
        },
        {
          title: '10 Bồn chứa nước Inox 304 dung tích 2000L',
          percentage: 28,
          amount: 42000000,
          description: 'Bồn chứa nước ngọt dự trữ đặt tại các điểm văn hóa ấp.',
        },
        {
          title: 'Thi công đường ống & Bảo trì màng lọc 1 năm',
          percentage: 12,
          amount: 18000000,
          description: 'Lắp đặt van xả tự động và bảo dưỡng định kỳ.',
        },
      ],
      timeline: [
        {
          phase: 'Giai đoạn 1',
          date: '01/07/2026 - 31/07/2026',
          title: 'Đo độ mặn nguồn nước & Khảo sát vị trí đặt trạm',
          description: 'Lấy mẫu nước tại 10 điểm và xác định vị trí cấp nước công cộng.',
          status: 'completed',
        },
        {
          phase: 'Giai đoạn 2',
          date: '01/08/2026 - 30/09/2026',
          title: 'Lắp đặt 2 trạm lọc đầu tiên và 8 bồn chứa',
          description: 'Bàn giao 2 trạm lọc RO đầu tiên cho UBND xã Ba Tri vận hành.',
          status: 'completed',
        },
        {
          phase: 'Giai đoạn 3',
          date: '01/10/2026 - 31/10/2026',
          title: 'Hoàn thiện trạm lọc thứ 3 & Tổng kết dự án',
          description: 'Vận hành toàn bộ hệ thống phục vụ bà con suốt mùa hạn mặn.',
          status: 'in_progress',
        },
      ],
      faqs: [
        {
          question: 'Chất lượng nước lọc có đảm bảo uống trực tiếp không?',
          answer: 'Nước sau lọc qua màng RO được Viện Pasteur kiểm nghiệm đạt tiêu chuẩn nước uống đóng chai QCVN 6-1:2010/BYT.',
        },
      ],
      verificationStatus: {
        isVerified: true,
        verifiedAt: new Date('2026-06-28'),
        verifiedBy: 'Sở Nông Nghiệp & PTNT Tỉnh Bến Tre',
        licenseNumber: 'GP-NN-2026/BT',
      },
      tags: ['Nước sạch', 'Bến Tre', 'Hạn mặn', 'Môi trường', 'Đồng bằng sông Cửu Long'],
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-10-31'),
      status: CAMPAIGN_STATUS.ACTIVE,
      targetAmount: 150000000,
      raisedAmount: 115000000,
      activities: [],
    },
    {
      title: 'Hành Trình Chữa Lành — Phẫu Thuật Nụ Cười Trẻ Thơ',
      shortDescription:
        'Tài trợ 100% chi phí phẫu thuật nụ cười và phục hồi chức năng phát âm cho 30 em nhỏ hở môi vòm miệng.',
      category: 'healthcare',
      urgency: 'urgent',
      bannerImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'Phối hợp cùng các y bác sĩ tình nguyện mang lại nụ cười trọn vẹn cho các em nhỏ bị dị tật hở môi, vòm miệng có hoàn cảnh khó khăn. Giúp các em tự tin hòa nhập cuộc sống, ăn uống và phát âm bình thường.',
      goal: 'Tài trợ 100% chi phí phẫu thuật và chăm sóc hậu phẫu cho 30 em nhỏ.',
      location: 'Bệnh viện Nhi Trung Ương, Hà Nội',
      beneficiaryCount: 30,
      beneficiaryUnit: 'bệnh nhi hở môi vòm miệng',
      impactSummary: 'Tài trợ trọn gói phẫu thuật tạo hình nụ cười và trị liệu phát âm cho 30 em nhỏ có hoàn cảnh khó khăn.',
      organization: 'Nhóm Bác Sĩ Tình Nguyện Nụ Cười Mới',
      contactInfo: {
        representative: 'Bác sĩ Đặng Quốc Cường',
        phone: '0913889900',
        email: 'cuong.dang@regive.org.vn',
      },
      bankAccount: {
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountNumber: '9999NUCOITRETHO',
        accountHolder: 'QUY THIEN NGUYEN REGIVE VIET NAM',
        branch: 'Chi nhánh Hà Nội',
        qrCodeUrl: '',
      },
      volunteerConditions: 'Ưu tiên sinh viên y khoa, điều dưỡng hoặc TNV có kinh nghiệm chăm sóc và chơi đùa cùng bệnh nhi.',
      targetItems: [
        { name: 'Gói hỗ trợ dinh dưỡng hậu phẫu', targetQty: 30, receivedQty: 22, unit: 'suất' },
        { name: 'Bộ đồ chơi phát triển cơ hàm & phát âm', targetQty: 30, receivedQty: 18, unit: 'bộ' },
      ],
      budgetBreakdown: [
        {
          title: 'Chi phí phẫu thuật & Vật tư y tế tạo hình (5.000.000 ₫/ca)',
          percentage: 75,
          amount: 150000000,
          description: 'Phẫu thuật thẩm mỹ đóng khe môi, tạo hình vòm họng bằng kỹ thuật vi phẫu hiện đại.',
        },
        {
          title: 'Dinh dưỡng chuyên biệt & Trị liệu ngôn ngữ hậu phẫu',
          percentage: 15,
          amount: 30000000,
          description: 'Cung cấp sữa dinh dưỡng y khoa và 6 buổi trị liệu tập phát âm cùng chuyên gia.',
        },
        {
          title: 'Hỗ trợ chi phí đi lại và lưu trú cho gia đình bệnh nhi',
          percentage: 10,
          amount: 20000000,
          description: 'Hỗ trợ tiền vé xe và phòng trọ sạch sẽ gần bệnh viện cho phụ huynh ở tỉnh xa.',
        },
      ],
      timeline: [
        {
          phase: 'Giai đoạn 1',
          date: '01/08/2026 - 31/08/2026',
          title: 'Khám sàng lọc và xét nghiệm tiền phẫu',
          description: 'Khám sức khỏe tổng quát cho 45 hồ sơ và chọn 30 em đủ điều kiện phẫu thuật an toàn.',
          status: 'completed',
        },
        {
          phase: 'Giai đoạn 2',
          date: '01/09/2026 - 15/11/2026',
          title: 'Tiến hành các đợt phẫu thuật theo nhóm',
          description: 'Đã hoàn thành 18 ca phẫu thuật thành công, các em đang phục hồi tốt.',
          status: 'in_progress',
        },
        {
          phase: 'Giai đoạn 3',
          date: '16/11/2026 - 25/12/2026',
          title: 'Hoàn thành 12 ca còn lại & Trị liệu phát âm',
          description: 'Tiếp tục phẫu thuật đợt cuối và theo dõi sự phát triển ngôn ngữ của các em.',
          status: 'upcoming',
        },
      ],
      faqs: [
        {
          question: 'Phẫu thuật được thực hiện ở đâu?',
          answer: 'Toàn bộ các ca phẫu thuật đều được thực hiện tại phòng mổ vô trùng tiêu chuẩn của Bệnh viện Nhi Trung Ương bởi đội ngũ bác sĩ chuyên khoa đầu ngành.',
        },
      ],
      verificationStatus: {
        isVerified: true,
        verifiedAt: new Date('2026-07-20'),
        verifiedBy: 'Hội Phẫu Thuật Tạo Hình Hà Nội & ReGive',
        licenseNumber: 'GP-YT-2026/HN',
      },
      tags: ['Y tế', 'Phẫu thuật nụ cười', 'Trẻ em', 'Bệnh viện', 'Nụ cười mới'],
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
      Object.assign(c, camp);
      await c.save();
      console.log(`= Cập nhật chiến dịch chi tiết: ${c.title}`);
    }
    campaigns.push(c);
  }

  const primaryCampaign = campaigns[0];
  const secondCampaign = campaigns[1];

  // 3. VẬT PHẨM QUYÊN GÓP & MARKETPLACE (PRODUCTS) VỚI ĐẦY ĐỦ TRƯỜNG CHI TIẾT
  const productsData = [
    {
      sku: 'REG-BALO-001',
      name: 'Balo chống gù học sinh cao cấp Tiger Family Joyful',
      brand: 'Tiger Family',
      origin: 'Đức (Nhập khẩu chính hãng)',
      description:
        'Balo học sinh chuẩn công thái học châu Âu của thương hiệu Tiger Family (Germany). Thiết kế form hộp cứng cáp, đệm lưng Ergo Spine phân tán 40% trọng lượng lên hông và xương chậu, giúp bé không bị gù lưng khi mang sách vở nặng. Khóa kéo SBS siêu bền, vải chống thấm nước IPX4, dải phản quang ban đêm 360 độ giúp bảo vệ an toàn tối đa cho học sinh.',
      category: 'balo',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      originalPrice: 890000,
      price: 150000,
      weight: '750g',
      dimensions: { length: 38, width: 28, height: 18, unit: 'cm' },
      material: 'Vải Polyester 900D phủ PU chống thấm nước, đệm mút EVA tổ ong thoáng khí',
      color: 'Xanh Navy & Dạ quang',
      tags: ['Chống gù', 'Học sinh tiểu học', 'Chống thấm nước', 'Bảo vệ cột sống', 'Tiger Family'],
      highlights: [
        'Công nghệ đệm lưng Ergo Spine phân tán 40% lực tì đè lên cột sống',
        'Chất liệu kháng khuẩn, chống trầy xước và chống nước đạt chuẩn IPX4',
        'Dải phản quang 360 độ ban đêm đạt chuẩn an toàn giao thông châu Âu',
        'Đáy cặp có 4 chân đế cao su chống bám bẩn và giữ dáng đứng vững',
      ],
      specifications: [
        { key: 'Thương hiệu', value: 'Tiger Family (Germany)' },
        { key: 'Dung tích chứa', value: '18 Lít (Đựng vừa tài liệu A4 và laptop 13 inch)' },
        { key: 'Khối lượng siêu nhẹ', value: '750 gram' },
        { key: 'Độ tuổi khuyên dùng', value: 'Lớp 1 đến Lớp 5 (6 - 11 tuổi)' },
        { key: 'Cấu tạo ngăn', value: '1 ngăn lớn chia vách chống quăn sách, 2 ngăn phụ đựng dụng cụ, 2 ngăn co giãn bên hông' },
        { key: 'Khóa kéo', value: 'Khóa SBS siêu bền êm ái chống kẹt' },
      ],
      inspectionReport: {
        conditionDetails:
          'Vải cặp còn nguyên form 98%, khóa kéo mượt mà 100%, đường may gia cố chắc chắn, đáy balo xước nhẹ 2% không ảnh hưởng thẩm mỹ.',
        functionalityStatus: 'Hoạt động hoàn hảo 100% (Khóa ngực chống trượt, quai đệm vai co giãn tốt)',
        sanitizationStatus: 'Đã giặt sấy nhiệt độ cao 70°C và khử khuẩn tia cực tím UV-C 15 phút tại trung tâm ReGive',
        accessoriesIncluded: ['Bọc chống mưa chuyên dụng Tiger Family', 'Hộp bút mini đồng bộ', 'Thẻ tên phản quang'],
        inspectedAt: new Date(),
        inspectorName: 'Trần Minh Anh - Giám định viên ReGive',
        score: 9.7,
      },
      donationStory: {
        donorName: 'Gia đình chị Nguyễn Mai Phương',
        donorType: 'individual',
        isAnonymous: false,
        donorMessage:
          'Bé nhà mình lên cấp 2 đổi cặp lớn hơn nên gửi tặng lại chiếc balo Tiger Family này. Cặp còn rất bền đẹp, hy vọng sẽ giúp một bạn nhỏ vùng cao vững bước đến trường!',
        intakeLocation: 'Điểm tiếp nhận ReGive Cầu Giấy, Hà Nội',
        receivedAt: new Date('2026-09-20'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 150.000đ sẽ chuyển vào quỹ Áo Ấm Hà Giang, tài trợ 01 chiếc áo phao lót lông ấm cho học sinh nghèo.',
        co2SavedKg: 3.8,
        wasteDivertedKg: 0.75,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ A1-04 - Kho ReGive Trung Tâm Hà Nội',
        packagingType: 'Thùng carton tái chế đạt chuẩn FSC, bọc xốp khí tự hủy sinh học',
        shippingOptions: [
          'Giao hàng tiết kiệm toàn quốc (2-3 ngày)',
          'Hỏa tốc nội thành Hà Nội (2-4 giờ)',
          'Nhận trực tiếp tại Kho ReGive Cầu Giấy',
        ],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 30,
        returnPolicy: 'Đồng kiểm khi nhận hàng. Đổi trả hoặc hoàn tiền 100% gây quỹ trong 30 ngày nếu phát hiện lỗi hư hỏng ngoài mô tả.',
        supportHotline: '1900 6868 (Hỗ trợ 24/7)',
      },
      stockQuantity: 6,
      storageLocation: 'Kệ A1-04 - Kho ReGive Trung Tâm Hà Nội',
    },
    {
      sku: 'REG-BOOK-002',
      name: 'Bộ sách giáo khoa & Tuyển tập truyện cổ tích Việt Nam (12 cuốn)',
      brand: 'NXB Kim Đồng & Giáo Dục',
      origin: 'Việt Nam',
      description:
        'Tuyển tập 12 cuốn sách chọn lọc gồm truyện cổ tích dân gian Việt Nam, truyện tranh lịch sử và sách tham khảo kỹ năng tư duy bồi dưỡng cho học sinh tiểu học. Giấy in màu cao cấp trên chất liệu chống lóa mắt, gáy sách được dán keo nhiệt gia cố vững chắc, hình ảnh minh họa sinh động truyền tải bài học đạo đức ý nghĩa.',
      category: 'sach',
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.GOOD,
      quality: PRODUCT_QUALITY.HIGH,
      originalPrice: 320000,
      price: 85000,
      weight: '1.8kg',
      dimensions: { length: 24, width: 17, height: 12, unit: 'cm' },
      material: 'Giấy bãi bằng cao cấp in màu, bìa cán màng bóng chống ẩm mốc',
      color: 'Bìa đa sắc rực rỡ',
      tags: ['Sách truyện', 'Cổ tích Việt Nam', 'Giáo dục', 'Kỹ năng sống'],
      highlights: [
        'Trọn bộ 12 cuốn truyện tranh nhân văn và sách rèn luyện tư duy',
        'Minh họa màu 100%, nét in rõ đẹp không nhòe mực',
        'Đã bọc màng bảo vệ gáy sách và dán keo gia cố chắc chắn',
      ],
      specifications: [
        { key: 'Nhà xuất bản', value: 'NXB Kim Đồng & NXB Giáo Dục Việt Nam' },
        { key: 'Số lượng sách', value: '12 cuốn truyện & sách tham khảo' },
        { key: 'Số trang trung bình', value: '64 - 120 trang/cuốn' },
        { key: 'Độ tuổi phù hợp', value: 'Thiếu nhi 6 - 12 tuổi' },
      ],
      inspectionReport: {
        conditionDetails: 'Sách sạch sẽ 95%, không quăn mép, không bị viết vẽ bậy lên trang nội dung, gáy sách chắc chắn.',
        functionalityStatus: 'Trang giấy nguyên vẹn 100%, không rách, không thiếu trang',
        sanitizationStatus: 'Khử khuẩn bằng máy tiệt trùng sách chiếu tia UV chuyên dụng',
        accessoriesIncluded: ['Bộ đánh dấu trang gỗ khắc laser', 'Bọc bìa plastic chống bụi'],
        inspectedAt: new Date(),
        inspectorName: 'Lê Thùy Dương - Giám định viên ReGive',
        score: 9.4,
      },
      donationStory: {
        donorName: 'Thầy giáo Hoàng Văn Đức',
        donorType: 'individual',
        isAnonymous: false,
        donorMessage: 'Tủ sách tuổi thơ của gia đình xin gửi tặng lại để tiếp thêm tri thức cho các bạn nhỏ.',
        intakeLocation: 'Trạm tiếp nhận ReGive Đống Đa, Hà Nội',
        receivedAt: new Date('2026-09-18'),
      },
      charityImpact: {
        directBenefit: '100% doanh thu 85.000đ đóng góp vào Tủ Sách Tri Thức Biên Giới Lạng Sơn.',
        co2SavedKg: 2.1,
        wasteDivertedKg: 1.8,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ B2-08 - Kho Hà Nội',
        packagingType: 'Túi giấy kraft bọc màng chống ẩm 2 lớp',
        shippingOptions: ['Giao tiêu chuẩn toàn quốc (2-3 ngày)', 'Nhận tại kho ReGive'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 15,
        returnPolicy: 'Đổi trả miễn phí trong 15 ngày nếu sách thiếu trang hoặc hư hại so với cam kết.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 15,
      storageLocation: 'Kệ B2-08 - Kho Hà Nội',
    },
    {
      sku: 'REG-CLOTH-003',
      name: 'Áo khoác gió thể thao chống nước The North Face 2 lớp',
      brand: 'The North Face',
      origin: 'Việt Nam (Gia công xuất khẩu)',
      description:
        'Áo khoác gió thể thao 2 lớp công nghệ vải Gore-Tex cản gió và chống nước tối ưu. Lớp ngoài chống thấm cản mưa nhẹ, lớp lót trong dạng lưới tổ ong thoáng khí thoát mồ hôi nhanh. Thiết kế mũ trùm đầu tháo rời linh hoạt, khóa kéo YKK ép dán seam-tape chống nước qua khe chỉ.',
      category: 'quan_ao',
      images: [
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      originalPrice: 950000,
      price: 180000,
      weight: '450g',
      dimensions: { length: 70, width: 54, height: 2, unit: 'cm' },
      material: 'Vải Gore-Tex 2 lớp cản gió 100%, lót lưới tản nhiệt Poly Micro-mesh',
      color: 'Đỏ Đô phối Đen Sporty',
      tags: ['Áo khoác gió', 'The North Face', 'Chống nước', 'Dã ngoại', 'Phượt'],
      highlights: [
        'Công nghệ màng thở Gore-Tex cản gió, chống mưa phùn hiệu quả',
        'Khóa kéo chống nước YKK ép dán Seam-tape chống rò rỉ nước',
        'Mũ trùm đầu tháo rời linh hoạt, có dây rút ôm sát cản gió rét',
      ],
      specifications: [
        { key: 'Kích cỡ (Size)', value: 'Size L (Thích hợp người cao 1m65 - 1m75, nặng 58 - 70kg)' },
        { key: 'Công nghệ vải', value: 'Chống thấm nước 10.000mm H2O, độ thở khí 10.000g/m2/24h' },
        { key: 'Kiểu dáng', value: 'Form Regular Unisex nam nữ đều mặc đẹp' },
      ],
      inspectionReport: {
        conditionDetails: 'Áo giữ màu tươi mới 99%, không sờn rách, logo thêu sắc nét, khóa kéo hoạt động trơn tru.',
        functionalityStatus: 'Mọi khóa kéo, nút bấm, dây rút hoạt động trơn tru',
        sanitizationStatus: 'Giặt hấp khử mùi sinh học và sấy tiệt trùng nhiệt độ kiểm soát',
        accessoriesIncluded: ['Mũ trùm đầu tháo rời'],
        inspectedAt: new Date(),
        inspectorName: 'Nguyễn Văn Điều Phối',
        score: 9.8,
      },
      donationStory: {
        donorName: 'CLB Phượt Bụi Đà Nẵng',
        donorType: 'organization',
        isAnonymous: false,
        donorMessage: 'Ủng hộ chương trình từ thiện ReGive để gây quỹ cho trẻ em vùng cao.',
        intakeLocation: 'Trạm tiếp nhận ReGive Hải Châu, Đà Nẵng',
        receivedAt: new Date('2026-09-12'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 180.000đ tài trợ suất ăn dinh dưỡng và áo ấm cho trẻ nhỏ Hà Giang.',
        co2SavedKg: 4.5,
        wasteDivertedKg: 0.45,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ C1-02 - Kho Đà Nẵng',
        packagingType: 'Túi bọc sinh học kháng khuẩn',
        shippingOptions: ['Giao hàng toàn quốc (2-3 ngày)'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 30,
        returnPolicy: 'Bao đổi trả nếu phát sinh lỗi rách hoặc hỏng khóa.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 5,
      storageLocation: 'Kệ C1-02 - Kho Đà Nẵng',
    },
    {
      sku: 'REG-HOME-004',
      name: 'Bình giữ nhiệt Lock&Lock Inox 304 Feather Light 500ml',
      brand: 'Lock&Lock',
      origin: 'Hàn Quốc (Sản xuất tại nhà máy Lock&Lock)',
      description:
        'Bình giữ nhiệt Lock&Lock Feather Light siêu nhẹ, vỏ phủ sơn tĩnh điện pastel mờ chống trầy. Ruột bình inox 304 không gỉ mạ đồng chân không 3 lớp, giữ nhiệt nóng 8 giờ và giữ lạnh đến 24 giờ. Nắp bật One-touch có khóa an toàn chống tràn tuyệt đối, lưới lọc trà tiện lợi.',
      category: 'gia_dung',
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.NEW,
      quality: PRODUCT_QUALITY.HIGH,
      originalPrice: 390000,
      price: 120000,
      weight: '230g',
      dimensions: { length: 22, width: 6.5, height: 6.5, unit: 'cm' },
      material: 'Ruột Inox 304 cao cấp mạ đồng, vỏ thép không gỉ sơn tĩnh điện nhám',
      color: 'Xanh Mint pastel',
      tags: ['Bình giữ nhiệt', 'Lock&Lock', 'Inox 304', 'Tiết kiệm', 'Môi trường'],
      highlights: [
        'Giữ nóng liên tục 8 tiếng (trên 65°C) và giữ lạnh 24 tiếng (dưới 8°C)',
        'Nắp mở One-Touch có khóa chốt an toàn chống tràn nước 100%',
        'Trọng lượng siêu nhẹ chỉ 230g, lớp mạ chân không cách nhiệt mỏng 2mm',
      ],
      specifications: [
        { key: 'Thương hiệu', value: 'Lock&Lock (Hàn Quốc)' },
        { key: 'Dung tích', value: '500ml' },
        { key: 'Chất liệu ruột', value: 'Inox STS304 an toàn thực phẩm' },
        { key: 'Hiệu năng giữ nhiệt', value: 'Nóng > 65°C trong 8h / Lạnh < 8°C trong 24h' },
      ],
      inspectionReport: {
        conditionDetails: 'Hàng mới 100% chưa qua sử dụng, nguyên hộp tem mác niêm phong.',
        functionalityStatus: 'Gioăng cao su kín khít 100%, nắp bật nhạy bén',
        sanitizationStatus: 'Khử khuẩn bằng khí Ozone và tia cực tím',
        accessoriesIncluded: ['Hộp đựng chính hãng', 'Lưới lọc trà inox'],
        inspectedAt: new Date(),
        inspectorName: 'Phạm Đức Toàn - Giám định viên ReGive',
        score: 10.0,
      },
      donationStory: {
        donorName: 'Công ty CP Công Nghệ Xanh',
        donorType: 'corporate',
        isAnonymous: false,
        donorMessage: 'Ủng hộ 10 bình giữ nhiệt gây quỹ nước sạch cho bà con Bến Tre.',
        intakeLocation: 'Trạm tiếp nhận ReGive Quận 1, TP.HCM',
        receivedAt: new Date('2026-09-05'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 120.000đ đóng góp vào Dự án Nước Sạch Bến Tre.',
        co2SavedKg: 1.9,
        wasteDivertedKg: 0.3,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ A3-11 - Kho TP.HCM',
        packagingType: 'Hộp carton có đệm lót bảo vệ',
        shippingOptions: ['Giao hàng toàn quốc', 'Giao hỏa tốc nội thành'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 60,
        returnPolicy: 'Bảo hành giữ nhiệt 60 ngày nếu bình bị tỏa nhiệt ra vỏ ngoài.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 10,
      storageLocation: 'Kệ A3-11 - Kho TP.HCM',
    },
    {
      sku: 'REG-ELEC-005',
      name: 'Đèn bàn học LED chống cận thị Rạng Đông RD-RL-20.LED',
      brand: 'Rạng Đông',
      origin: 'Việt Nam',
      description:
        'Đèn bàn LED bảo vệ thị lực học đường từ thương hiệu quốc dân Rạng Đông. Ánh sáng chuẩn CRI > 90 tái hiện màu sắc trung thực không gây lóa mỏi mắt, điều khiển cảm ứng 3 mức nhiệt độ màu phù hợp học tập, đọc sách và thư giãn ban đêm.',
      category: 'dien_tu',
      images: [
        'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.GOOD,
      quality: PRODUCT_QUALITY.MEDIUM,
      originalPrice: 285000,
      price: 95000,
      weight: '850g',
      dimensions: { length: 35, width: 15, height: 42, unit: 'cm' },
      material: 'Nhựa ABS chống cháy, cần đèn kim loại bọc silicon uốn cong 360 độ',
      color: 'Trắng tinh khiết',
      tags: ['Đèn học LED', 'Rạng Đông', 'Chống cận', 'Học tập'],
      highlights: [
        'Chip LED SunLike cho chỉ số hoàn màu CRI > 90, ánh sáng trung thực',
        '3 chế độ màu (Trắng 6500K - Vàng 3000K - Trung tính 4500K) cảm ứng',
        'Cần đèn bọc silicon dẻo dai điều chỉnh mọi góc chiếu thuận tiện',
      ],
      specifications: [
        { key: 'Công suất', value: '6W (Tương đương bóng sợi đốt 40W)' },
        { key: 'Chỉ số hoàn màu', value: 'Ra >= 90' },
        { key: 'Độ rọi trung tâm', value: '>= 700 Lux' },
        { key: 'Nguồn điện', value: 'Adapter 12V DC an toàn chống giật' },
      ],
      inspectionReport: {
        conditionDetails: 'Vỏ ngoài sạch sẽ không nứt vỡ, bóng LED sáng đều không nhấp nháy, nút cảm ứng nhạy.',
        functionalityStatus: 'Kiểm tra mạch điện & adapter an toàn 100%',
        sanitizationStatus: 'Lau cồn y tế khử khuẩn toàn bộ bề mặt',
        accessoriesIncluded: ['Adapter nguồn 12V chính hãng'],
        inspectedAt: new Date(),
        inspectorName: 'Trần Minh Anh - Giám định viên ReGive',
        score: 9.3,
      },
      donationStory: {
        donorName: 'Anh Vũ Đình Trọng',
        donorType: 'individual',
        isAnonymous: false,
        donorMessage: 'Đèn dùng rất tốt cho góc học tập, xin tặng lại các bạn nhỏ.',
        intakeLocation: 'Trạm tiếp nhận ReGive Thanh Xuân, Hà Nội',
        receivedAt: new Date('2026-09-15'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 95.000đ đóng góp vào Quỹ Tủ Sách Biên Giới.',
        co2SavedKg: 2.7,
        wasteDivertedKg: 0.85,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ D2-03 - Kho Hà Nội',
        packagingType: 'Hộp carton có màng xốp bóng khí',
        shippingOptions: ['Giao toàn quốc (2-3 ngày)'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 30,
        returnPolicy: 'Đổi mới hoặc hoàn tiền 100% nếu phát sinh lỗi đèn trong 30 ngày.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 8,
      storageLocation: 'Kệ D2-03 - Kho Hà Nội',
    },
    {
      sku: 'REG-SHOE-006',
      name: "Giày thể thao Biti's Hunter Street Nam Nữ Size 39",
      brand: "Biti's",
      origin: 'Việt Nam',
      description:
        "Giày thể thao Biti's Hunter Street phiên bản Canvas thời trang. Đế LiteFlex cao su đúc nguyên khối siêu nhẹ giảm sốc, lót giày Ortholite kháng khuẩn êm ái thoáng khí. Thiết kế đường phố trẻ trung, form giày ôm chân vận động linh hoạt.",
      category: 'giay_dep',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.LIKE_NEW,
      quality: PRODUCT_QUALITY.HIGH,
      originalPrice: 690000,
      price: 220000,
      weight: '550g / đôi',
      dimensions: { length: 27, width: 10, height: 11, unit: 'cm' },
      material: 'Vải Canvas dệt thoáng khí, đế cao su đúc LiteFlex đàn hồi cao',
      color: 'Trắng Kem & Xám Khói',
      tags: ["Biti's Hunter", 'Giày thể thao', 'Streetwear', 'Thời trang'],
      highlights: [
        'Đế LiteFlex siêu nhẹ giảm chấn động tối đa khi di chuyển vận động',
        'Lót giày kháng khuẩn Ortholite khử mùi hôi chân hiệu quả',
        'Form ôm chân vừa vặn, phong cách Streetwear trẻ trung năng động',
      ],
      specifications: [
        { key: 'Size giày', value: 'Size 39 (Chiều dài bàn chân 24.5cm - 25.0cm)' },
        { key: 'Chất liệu thân', value: 'Vải Canvas 10oz bền bỉ thoáng khí' },
        { key: 'Chất liệu đế', value: 'Cao su nhiệt dẻo TPR chống trơn trượt' },
      ],
      inspectionReport: {
        conditionDetails: 'Đế giày độ mòn dưới 2%, vải thân giày sạch tinh tươm, dây giày mới.',
        functionalityStatus: 'Đế bám dính tốt, lót trong êm ái đàn hồi 100%',
        sanitizationStatus: 'Giặt hấp tiệt trùng UV và xịt khử khuẩn thảo mộc chuyên sâu',
        accessoriesIncluded: ['Dây giày sơ cua màu trắng'],
        inspectedAt: new Date(),
        inspectorName: 'Nguyễn Văn Điều Phối',
        score: 9.6,
      },
      donationStory: {
        donorName: 'Bạn Lê Minh Trí (Sinh viên ĐH KHTN)',
        donorType: 'individual',
        isAnonymous: false,
        donorMessage: 'Mua nhầm size đi 1 lần nên gửi tặng lại để giúp gây quỹ từ thiện.',
        intakeLocation: 'Trạm tiếp nhận ReGive Quận 5, TP.HCM',
        receivedAt: new Date('2026-09-22'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 220.000đ đóng góp vào Quỹ Phẫu Thuật Nụ Cười Trẻ Thơ.',
        co2SavedKg: 5.2,
        wasteDivertedKg: 0.6,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ E1-05 - Kho TP.HCM',
        packagingType: 'Hộp giày giấy tái chế ReGive',
        shippingOptions: ['Giao tiêu chuẩn toàn quốc (2-3 ngày)'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 30,
        returnPolicy: 'Hỗ trợ thử chân đồng kiểm khi nhận hàng.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 3,
      storageLocation: 'Kệ E1-05 - Kho TP.HCM',
    },
    {
      sku: 'REG-TOY-007',
      name: 'Bộ đồ chơi xếp hình trí tuệ Lego City 450 chi tiết',
      brand: 'Lego (Đan Mạch)',
      origin: 'Đan Mạch / Hungary',
      description:
        'Bộ xếp hình Lego chủ đề thành phố tương lai gồm 450 chi tiết mảnh ghép chuẩn xác. Chất liệu nhựa ABS nguyên sinh tuyệt đối an toàn cho trẻ nhỏ. Hỗ trợ kích thích tư duy logic, khả năng giải quyết vấn đề và óc tưởng tượng không gian.',
      category: 'do_choi',
      images: [
        'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.GOOD,
      quality: PRODUCT_QUALITY.HIGH,
      originalPrice: 750000,
      price: 160000,
      weight: '900g',
      dimensions: { length: 30, width: 22, height: 14, unit: 'cm' },
      material: 'Nhựa ABS nguyên sinh cao cấp an toàn không độc hại (BPA Free)',
      color: 'Đa màu sắc',
      tags: ['Lego City', 'Đồ chơi trí tuệ', 'Phát triển tư duy', 'Bền đẹp'],
      highlights: [
        '450 chi tiết mảnh ghép chuẩn xác, phát triển tư duy không gian và sáng tạo',
        'Đầy đủ khay nhựa phân loại ngăn nắp và sách hướng dẫn lắp ghép',
        'Tương thích 100% với mọi bộ xếp hình Lego tiêu chuẩn quốc tế',
      ],
      specifications: [
        { key: 'Thương hiệu', value: 'Lego Group (Đan Mạch)' },
        { key: 'Số lượng mảnh ghép', value: '450 chi tiết + 3 nhân vật minifigures' },
        { key: 'Độ tuổi', value: '5 - 12 tuổi' },
      ],
      inspectionReport: {
        conditionDetails: 'Mảnh ghép đầy đủ 100%, không bị gãy vỡ hay biến dạng, khớp nối chắc chắn.',
        functionalityStatus: 'Khớp nối vừa khít, không lỏng lẻo',
        sanitizationStatus: 'Rửa tiệt trùng bằng dung dịch chuyên dụng cho đồ chơi trẻ em & sấy khô tia cực tím',
        accessoriesIncluded: ['Khay nhựa phân loại có nắp', 'Sách hướng dẫn lắp ghép'],
        inspectedAt: new Date(),
        inspectorName: 'Lê Thùy Dương - Giám định viên ReGive',
        score: 9.5,
      },
      donationStory: {
        donorName: 'Gia đình anh Trần Quốc Tuấn',
        donorType: 'individual',
        isAnonymous: false,
        donorMessage: 'Gửi tặng các bạn nhỏ đam mê lắp ghép sáng tạo.',
        intakeLocation: 'Trạm tiếp nhận ReGive Sơn Trà, Đà Nẵng',
        receivedAt: new Date('2026-09-10'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 160.000đ đóng góp vào Quỹ Tủ Sách Biên Giới.',
        co2SavedKg: 3.1,
        wasteDivertedKg: 0.9,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ B1-03 - Kho Đà Nẵng',
        packagingType: 'Hộp carton bảo vệ khay nhựa',
        shippingOptions: ['Giao hàng toàn quốc (2-3 ngày)'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 15,
        returnPolicy: 'Hoàn tiền 100% nếu thiếu chi tiết chính.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 5,
      storageLocation: 'Kệ B1-03 - Kho Đà Nẵng',
    },
    {
      sku: 'REG-ELEC-008',
      name: 'Tai nghe chụp tai có micro học trực tuyến Sony MDR-ZX110AP',
      brand: 'Sony',
      origin: 'Thái Lan',
      description:
        'Tai nghe over-ear chính hãng Sony MDR-ZX110AP tích hợp microphone đàm thoại rõ ràng lọc tiếng ồn. Màng loa Dynamic 30mm cho âm thanh chi tiết, đệm tai êm ái không gây đau tai khi học online kéo dài. Thiết kế gập xoay Swivel gấp phẳng bỏ balo siêu gọn gàng.',
      category: 'dien_tu',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ],
      condition: PRODUCT_CONDITION.FAIR,
      quality: PRODUCT_QUALITY.MEDIUM,
      originalPrice: 490000,
      price: 110000,
      weight: '120g',
      dimensions: { length: 20, width: 15, height: 5, unit: 'cm' },
      material: 'Vỏ nhựa polymer siêu nhẹ, đệm tai mút xốp bọc da êm ái',
      color: 'Đen sang trọng',
      tags: ['Tai nghe Sony', 'Học trực tuyến', 'Micro đàm thoại', 'Gọn nhẹ'],
      highlights: [
        'Driver dynamic 30mm cho âm thanh rõ ràng, cách âm thụ động tốt',
        'Microphone tích hợp đàm thoại học tiếng Anh & Zoom rõ tiếng, lọc tạp âm',
        'Thiết kế gập xoay Swivel gập gọn bỏ balo tiện lợi mang theo',
      ],
      specifications: [
        { key: 'Thương hiệu', value: 'Sony (Nhật Bản)' },
        { key: 'Kích thước màng loa', value: '30 mm Dynamic Dome' },
        { key: 'Dải tần số', value: '12 Hz – 22.000 Hz' },
        { key: 'Cổng cắm', value: 'Jack 3.5mm mạ vàng chữ L' },
      ],
      inspectionReport: {
        conditionDetails: 'Đệm da có vết xước nhỏ 5% theo thời gian, chất âm 2 bên loa cân bằng 100%, mic thu âm trong.',
        functionalityStatus: 'Âm thanh 2 kênh rõ nét, micro hoạt động hoàn hảo',
        sanitizationStatus: 'Lau cồn y tế và tiệt trùng mút tai bằng tia cực tím',
        accessoriesIncluded: ['Jack chuyển đổi 3.5mm'],
        inspectedAt: new Date(),
        inspectorName: 'Trần Minh Anh - Giám định viên ReGive',
        score: 8.9,
      },
      donationStory: {
        donorName: 'Bạn Ngô Thu Trang',
        donorType: 'individual',
        isAnonymous: false,
        donorMessage: 'Tặng lại chiếc tai nghe đã đồng hành cùng mình suốt 4 năm đại học.',
        intakeLocation: 'Trạm tiếp nhận ReGive Hai Bà Trưng, Hà Nội',
        receivedAt: new Date('2026-09-08'),
      },
      charityImpact: {
        directBenefit: '100% số tiền 110.000đ đóng góp vào Quỹ Áo Ấm Cho Em Hà Giang.',
        co2SavedKg: 1.5,
        wasteDivertedKg: 0.15,
        fundAllocationPercent: 100,
      },
      warehouseAndShipping: {
        storageLocation: 'Kệ D1-07 - Kho Hà Nội',
        packagingType: 'Túi chống sốc tái chế ReGive',
        shippingOptions: ['Giao toàn quốc (2-3 ngày)'],
        estimatedDeliveryDays: '2 - 3 ngày làm việc',
      },
      guaranteePolicy: {
        warrantyDays: 30,
        returnPolicy: 'Bảo hành nghe thử 30 ngày đổi trả nếu phát sinh rè loa.',
        supportHotline: '1900 6868',
      },
      stockQuantity: 4,
      storageLocation: 'Kệ D1-07 - Kho Hà Nội',
    },
  ];

  const createdProducts = [];
  for (const pData of productsData) {
    let prod = await Product.findOne({ name: pData.name });
    if (!prod) {
      prod = await Product.create({
        ...pData,
        campaign: primaryCampaign._id,
        currency: 'VND',
        suitableForMarketplace: true,
        reviewed: true,
        reviewedBy: employeeUser._id,
        reviewedAt: new Date(),
        listedOnMarketplace: true,
        listedAt: new Date(),
        status: PRODUCT_STATUS.LISTED,
        createdBy: employeeUser._id,
      });
      console.log(`+ Tạo sản phẩm Marketplace: ${prod.name} (SKU: ${prod.sku})`);
    } else {
      // Update with deep fields
      Object.assign(prod, pData);
      prod.campaign = primaryCampaign._id;
      prod.suitableForMarketplace = true;
      prod.reviewed = true;
      prod.reviewedBy = employeeUser._id;
      prod.reviewedAt = new Date();
      prod.listedOnMarketplace = true;
      prod.status = PRODUCT_STATUS.LISTED;
      await prod.save();
      console.log(`= Cập nhật sản phẩm Marketplace chi tiết: ${prod.name}`);
    }

    // Seed or update AiAssessment
    let assessment = await AiAssessment.findOne({ product: prod._id });
    if (!assessment) {
      assessment = await AiAssessment.create({
        product: prod._id,
        requestedBy: employeeUser._id,
        status: AI_ASSESSMENT_STATUS.CONFIRMED,
        provider: 'gemini-1.5-flash',
        input: {
          name: prod.name,
          description: prod.description,
          category: prod.category,
          images: prod.images,
          extraNote: 'Kiểm định chất lượng phân loại vật phẩm trao tặng cộng đồng ReGive',
        },
        suggestion: {
          category: prod.category,
          condition: prod.condition,
          quality: prod.quality,
          suggestedPrice: prod.price,
          suitableForMarketplace: true,
          confidence: 0.96,
          rationale: `Sản phẩm ${prod.name} thuộc thương hiệu ${prod.brand || 'chính hãng'}, đạt phẩm chất ${prod.quality}, tình trạng ${prod.condition}. Phù hợp 100% để niêm yết gây quỹ.`,
        },
        finalDecision: {
          category: prod.category,
          condition: prod.condition,
          quality: prod.quality,
          suggestedPrice: prod.price,
          suitableForMarketplace: true,
          confidence: 0.98,
          rationale: 'Chuyên viên kiểm định ReGive đã đối chiếu thực tế và phê duyệt niêm yết.',
        },
        reviewedBy: employeeUser._id,
        reviewedAt: new Date(),
        appliedToProduct: true,
      });
      prod.latestAiAssessment = assessment._id;
      await prod.save();
      console.log(`  + Đã liên kết AiAssessment xác thực cho ${prod.name}`);
    } else {
      prod.latestAiAssessment = assessment._id;
      await prod.save();
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
