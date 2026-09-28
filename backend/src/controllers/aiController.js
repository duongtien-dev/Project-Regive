const { body, param } = require('express-validator');
const Product = require('../models/Product');
const AiAssessment = require('../models/AiAssessment');
const {
  AI_ASSESSMENT_STATUS,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
  UNSAFE_CONDITIONS,
} = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { assessProductInput } = require('../services/aiService');
const { createNotification } = require('../services/common');

const assessValidators = [
  body('productId').isMongoId(),
  body('extraNote').optional().isString(),
  body('images').optional().isArray(),
];

const reviewValidators = [
  param('id').isMongoId(),
  body('category').optional().trim().notEmpty(),
  body('condition').optional().isIn(Object.values(PRODUCT_CONDITION)),
  body('quality').optional().isIn(Object.values(PRODUCT_QUALITY)),
  body('suggestedPrice').optional().isFloat({ min: 0 }),
  body('price').optional().isFloat({ min: 0 }),
  body('suitableForMarketplace').optional().isBoolean(),
  body('assessmentNote').optional().isString(),
  body('applyPrice').optional().isBoolean(),
];

const idParam = [param('id').isMongoId()];

function decisionsDiffer(suggestion, finalDecision) {
  const keys = ['category', 'condition', 'quality', 'suggestedPrice', 'suitableForMarketplace'];
  return keys.some((k) => String(suggestion[k]) !== String(finalDecision[k]));
}

const assessProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const images =
    req.body.images && req.body.images.length > 0 ? req.body.images : product.images || [];

  const input = {
    name: product.name,
    description: product.description,
    category: product.category,
    images,
    extraNote: req.body.extraNote || '',
  };

  let assessment;
  try {
    const aiResult = await assessProductInput(input);
    assessment = await AiAssessment.create({
      product: product._id,
      requestedBy: req.user._id,
      status: AI_ASSESSMENT_STATUS.SUGGESTED,
      provider: aiResult.provider,
      input,
      suggestion: aiResult.suggestion,
      rawResponse: aiResult.rawResponse,
    });
  } catch (err) {
    assessment = await AiAssessment.create({
      product: product._id,
      requestedBy: req.user._id,
      status: AI_ASSESSMENT_STATUS.FAILED,
      provider: 'none',
      input,
      errorMessage: err.message || 'AI assessment failed',
      rawResponse: { error: true },
    });

    return success(
      res,
      {
        assessment,
        fallbackHint:
          'AI failed. Employee/Admin can still assess manually via POST /api/products/:id/assess',
      },
      'AI assessment failed — use manual assessment',
      202
    );
  }

  // Attach latest AI suggestion snapshot on product without applying authority
  product.assessmentNote = [
    product.assessmentNote,
    `[AI:${assessment._id}] pending human review`,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 2000);
  product.latestAiAssessment = assessment._id;
  await product.save();

  return success(
    res,
    {
      assessment,
      reviewRequired: true,
      note: 'AI result is suggestion only. Confirm/override before applying to product. AI never auto-publishes.',
    },
    'AI assessment suggested',
    201
  );
});

const listByProduct = asyncHandler(async (req, res) => {
  const assessments = await AiAssessment.find({ product: req.params.productId })
    .populate('requestedBy', 'fullName email role')
    .populate('reviewedBy', 'fullName email role')
    .sort({ createdAt: -1 });
  return success(res, { assessments });
});

const getById = asyncHandler(async (req, res) => {
  const assessment = await AiAssessment.findById(req.params.id)
    .populate('product')
    .populate('requestedBy', 'fullName email role')
    .populate('reviewedBy', 'fullName email role');
  if (!assessment) throw new ApiError(404, 'AI assessment not found');
  return success(res, { assessment });
});

const listPending = asyncHandler(async (_req, res) => {
  const assessments = await AiAssessment.find({ status: AI_ASSESSMENT_STATUS.SUGGESTED })
    .populate('product', 'name category images status')
    .populate('requestedBy', 'fullName email')
    .sort({ createdAt: -1 });
  return success(res, { assessments });
});

const confirm = asyncHandler(async (req, res) => {
  const assessment = await AiAssessment.findById(req.params.id);
  if (!assessment) throw new ApiError(404, 'AI assessment not found');
  if (assessment.status !== AI_ASSESSMENT_STATUS.SUGGESTED) {
    throw new ApiError(400, `Assessment cannot be confirmed from status ${assessment.status}`);
  }
  if (assessment.status === AI_ASSESSMENT_STATUS.FAILED) {
    throw new ApiError(400, 'Failed assessment cannot be confirmed');
  }

  const product = await Product.findById(assessment.product);
  if (!product) throw new ApiError(404, 'Product not found');

  const finalDecision = {
    category: req.body.category ?? assessment.suggestion.category,
    condition: req.body.condition ?? assessment.suggestion.condition,
    quality: req.body.quality ?? assessment.suggestion.quality,
    suggestedPrice:
      req.body.suggestedPrice !== undefined
        ? req.body.suggestedPrice
        : assessment.suggestion.suggestedPrice,
    suitableForMarketplace:
      req.body.suitableForMarketplace !== undefined
        ? Boolean(req.body.suitableForMarketplace)
        : assessment.suggestion.suitableForMarketplace,
    confidence: assessment.suggestion.confidence,
    rationale: req.body.assessmentNote || assessment.suggestion.rationale,
  };

  if (UNSAFE_CONDITIONS.includes(finalDecision.condition)) {
    finalDecision.suitableForMarketplace = false;
  }

  const overridden = decisionsDiffer(assessment.suggestion, finalDecision);
  assessment.status = overridden
    ? AI_ASSESSMENT_STATUS.OVERRIDDEN
    : AI_ASSESSMENT_STATUS.CONFIRMED;
  assessment.finalDecision = finalDecision;
  assessment.reviewedBy = req.user._id;
  assessment.reviewedAt = new Date();
  assessment.appliedToProduct = true;
  await assessment.save();

  // Apply to product — NEVER auto-list on marketplace
  product.category = finalDecision.category;
  product.condition = finalDecision.condition;
  product.quality = finalDecision.quality;
  product.suggestedPrice = finalDecision.suggestedPrice;
  product.suitableForMarketplace = finalDecision.suitableForMarketplace;
  product.reviewed = true;
  product.reviewedBy = req.user._id;
  product.reviewedAt = new Date();
  product.assessmentNote = req.body.assessmentNote || finalDecision.rationale || '';

  const applyPrice = req.body.applyPrice !== false;
  if (applyPrice && (!product.price || product.price === 0)) {
    product.price = finalDecision.suggestedPrice;
  } else if (req.body.price !== undefined) {
    product.price = req.body.price;
  }

  if (UNSAFE_CONDITIONS.includes(product.condition)) {
    product.status = PRODUCT_STATUS.REJECTED;
    product.listedOnMarketplace = false;
  } else if (
    ![PRODUCT_STATUS.LISTED, PRODUCT_STATUS.IN_STOCK, PRODUCT_STATUS.SOLD_OUT].includes(
      product.status
    )
  ) {
    product.status = PRODUCT_STATUS.ASSESSED;
  }

  await product.save();

  await createNotification({
    userId: req.user._id,
    title: 'AI assessment applied',
    message: `Assessment ${assessment.status} applied to product ${product.name}. Marketplace listing still requires publish.`,
    type: 'system',
    relatedId: assessment._id.toString(),
  });

  return success(
    res,
    {
      assessment,
      product,
      listedOnMarketplace: product.listedOnMarketplace,
      note: 'Human review applied. Use POST /api/products/:id/publish to list if eligible.',
    },
    overridden ? 'AI assessment overridden and applied' : 'AI assessment confirmed and applied'
  );
});

const reject = asyncHandler(async (req, res) => {
  const assessment = await AiAssessment.findById(req.params.id);
  if (!assessment) throw new ApiError(404, 'AI assessment not found');
  if (assessment.status !== AI_ASSESSMENT_STATUS.SUGGESTED) {
    throw new ApiError(400, `Assessment cannot be rejected from status ${assessment.status}`);
  }

  assessment.status = AI_ASSESSMENT_STATUS.REJECTED;
  assessment.reviewedBy = req.user._id;
  assessment.reviewedAt = new Date();
  assessment.appliedToProduct = false;
  await assessment.save();

  return success(res, { assessment }, 'AI assessment rejected — product unchanged');
});

module.exports = {
  assessValidators,
  reviewValidators,
  idParam,
  assessProduct,
  listByProduct,
  getById,
  listPending,
  confirm,
  reject,
};
