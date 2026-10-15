/**
 * Duplicate Complaint Detection Service
 * Uses text similarity (Jaccard coefficient on word tokens) to find
 * complaints describing the same issue in the same location/category.
 */

/**
 * Tokenize and normalize a text string into a Set of lowercase words.
 */
const tokenize = (text = '') => {
  const stopWords = new Set([
    'the','a','an','is','in','at','on','of','and','or','to','for','with',
    'this','that','are','was','has','have','not','be','but','by','from',
    'it','its','as','we','my','your','our','i','me','us','they','he','she'
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
};

/**
 * Compute Jaccard similarity between two token sets.
 * Returns a score from 0.0 to 1.0
 */
const jaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Compute a weighted similarity score for two complaints.
 * Weights: title (40%), description (40%), subcategory/location (20%)
 */
const computeComplaintSimilarity = (complaintA, complaintB) => {
  // Must be in same category to be considered duplicate
  const catA = complaintA.category?._id?.toString() || complaintA.category?.toString() || '';
  const catB = complaintB.category?._id?.toString() || complaintB.category?.toString() || '';
  if (catA !== catB) return 0;

  const titleSim = jaccardSimilarity(
    tokenize(complaintA.title),
    tokenize(complaintB.title)
  );
  const descSim = jaccardSimilarity(
    tokenize(complaintA.description),
    tokenize(complaintB.description)
  );
  const locSim = jaccardSimilarity(
    tokenize(complaintA.subcategory || ''),
    tokenize(complaintB.subcategory || '')
  );

  // Weighted combination
  const weightedScore = (titleSim * 0.40) + (descSim * 0.40) + (locSim * 0.20);
  return Math.round(weightedScore * 100) / 100;
};

const SIMILARITY_THRESHOLD = 0.35; // 35% similarity triggers duplicate flag

module.exports = { computeComplaintSimilarity, SIMILARITY_THRESHOLD };
