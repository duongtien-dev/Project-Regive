const {
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
} = require('../constants/enums');
const config = require('../config');

const CATEGORY_KEYWORDS = [
  { category: 'bags', keywords: ['balo', 'túi', 'bag', 'backpack', 'vali'] },
  { category: 'clothing', keywords: ['áo', 'quần', 'shirt', 'dress', 'jacket', 'clothes'] },
  { category: 'books', keywords: ['sách', 'book', 'vở', 'notebook'] },
  { category: 'electronics', keywords: ['điện thoại', 'laptop', 'tai nghe', 'phone', 'tablet'] },
  { category: 'toys', keywords: ['đồ chơi', 'toy', 'lego'] },
  { category: 'home', keywords: ['nồi', 'chén', 'bàn', 'ghế', 'home', 'kitchen'] },
];

const BASE_PRICE = {
  bags: 100000,
  clothing: 80000,
  books: 30000,
  electronics: 500000,
  toys: 60000,
  home: 90000,
  other: 50000,
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const item of CATEGORY_KEYWORDS) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item.category;
    }
  }
  return 'other';
}

function detectCondition(text) {
  const lower = text.toLowerCase();
  if (/(hỏng|hư|vỡ|damaged|broken|unsafe)/.test(lower)) return PRODUCT_CONDITION.DAMAGED;
  if (/(mới|new\b)/.test(lower)) return PRODUCT_CONDITION.NEW;
  if (/(như mới|like[_ ]?new|còn tốt)/.test(lower)) return PRODUCT_CONDITION.LIKE_NEW;
  if (/(cũ|fair|trầy)/.test(lower)) return PRODUCT_CONDITION.FAIR;
  if (/(poor|xấu|rách)/.test(lower)) return PRODUCT_CONDITION.POOR;
  return PRODUCT_CONDITION.GOOD;
}

function detectQuality(condition) {
  if ([PRODUCT_CONDITION.NEW, PRODUCT_CONDITION.LIKE_NEW].includes(condition)) {
    return PRODUCT_QUALITY.HIGH;
  }
  if ([PRODUCT_CONDITION.GOOD, PRODUCT_CONDITION.FAIR].includes(condition)) {
    return PRODUCT_QUALITY.MEDIUM;
  }
  return PRODUCT_QUALITY.LOW;
}

function priceFor(category, condition, quality) {
  let price = BASE_PRICE[category] || BASE_PRICE.other;
  const conditionFactor = {
    [PRODUCT_CONDITION.NEW]: 1.2,
    [PRODUCT_CONDITION.LIKE_NEW]: 1.0,
    [PRODUCT_CONDITION.GOOD]: 0.85,
    [PRODUCT_CONDITION.FAIR]: 0.65,
    [PRODUCT_CONDITION.POOR]: 0.4,
    [PRODUCT_CONDITION.DAMAGED]: 0,
  }[condition];
  const qualityFactor = {
    [PRODUCT_QUALITY.HIGH]: 1.1,
    [PRODUCT_QUALITY.MEDIUM]: 1,
    [PRODUCT_QUALITY.LOW]: 0.75,
  }[quality];
  return Math.round((price * conditionFactor * qualityFactor) / 1000) * 1000;
}

/**
 * Mock/heuristic AI provider — default for Sprint 3 demo.
 * Replaceable later with real vision API when AI_PROVIDER/API key is configured.
 */
async function runMockAssessment({ name, description, category, images, extraNote }) {
  const text = [name, description, category, extraNote, ...(images || [])].join(' ');
  const detectedCategory = category && category !== 'other' ? category : detectCategory(text);
  const condition = detectCondition(text);
  const quality = detectQuality(condition);
  const suitableForMarketplace = condition !== PRODUCT_CONDITION.DAMAGED && condition !== PRODUCT_CONDITION.POOR;
  const suggestedPrice = suitableForMarketplace
    ? priceFor(detectedCategory, condition, quality)
    : 0;

  const confidence = images && images.length > 0 ? 0.78 : 0.62;

  return {
    provider: 'mock',
    suggestion: {
      category: detectedCategory,
      condition,
      quality,
      suggestedPrice,
      suitableForMarketplace,
      confidence,
      rationale:
        'Heuristic assessment from product text/images metadata. Human review is required before applying.',
    },
    rawResponse: {
      engine: 'regive-mock-ai-v1',
      analyzedFields: { name, description, category, imageCount: (images || []).length },
    },
  };
}

async function assessProductInput(input) {
  // Future: if config.aiProvider === 'openai' && config.aiApiKey → call real API
  // For now always use mock with graceful contract identical to a real provider.
  if (config.aiProvider === 'external' && config.aiApiKey) {
    try {
      // Placeholder hook — without a configured endpoint we fall back to mock
      return await runMockAssessment(input);
    } catch (err) {
      const fallback = await runMockAssessment(input);
      return {
        ...fallback,
        provider: 'mock-fallback',
        rawResponse: {
          ...fallback.rawResponse,
          fallbackReason: err.message,
        },
      };
    }
  }

  return runMockAssessment(input);
}

module.exports = { assessProductInput, runMockAssessment };
