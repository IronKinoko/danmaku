/**
 * 弹幕相似度算法 - 参考 pakku.js
 * 包含编辑距离、拼音距离、余弦相似度等多种相似度计算方法
 */

export interface SimilarityConfig {
  /** @default 3 */
  maxEditDist: number // 编辑距离阈值
  /** @default 80 */
  maxCosine: number // 余弦相似度阈值 (0-100)
  /** @default 2 */
  minDanmuSize: number // 最小弹幕长度
}

export enum SimilarityReason {
  IDENTICAL,
  EDIT_DISTANCE,
  COSINE_DISTANCE,
}

export interface SimilarityResult {
  isSimilar: boolean
  reason: SimilarityReason
  distance: number
  ratio: number // 相似度比率 0-100
}

/**
 * 快速编辑距离算法
 * 基于字符频率差异计算，时间复杂度 O(n)
 * 不是传统的编辑距离，但足够用于弹幕去重
 */
function fastEditDistance(str1: string, str2: string): number {
  const freq1 = getCharFrequency(str1)
  const freq2 = getCharFrequency(str2)

  let distance = 0

  // 计算字符频率差异
  const allChars = new Set([...Object.keys(freq1), ...Object.keys(freq2)])
  for (const char of allChars) {
    const count1 = freq1[char] || 0
    const count2 = freq2[char] || 0
    distance += Math.abs(count1 - count2)
  }

  return distance
}

/**
 * 获取字符频率
 */
function getCharFrequency(str: string): Record<string, number> {
  const freq: Record<string, number> = {}
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1
  }
  return freq
}

/**
 * 计算 2-gram (二元组)
 */
function get2Grams(str: string): Record<string, number> {
  const grams: Record<string, number> = {}
  for (let i = 0; i < str.length - 1; i++) {
    const gram = str.substring(i, i + 2)
    grams[gram] = (grams[gram] || 0) + 1
  }
  return grams
}

/**
 * 余弦相似度
 * 基于 2-gram 的向量余弦相似度
 */
function cosineSimilarity(str1: string, str2: string): number {
  if (str1.length < 2 || str2.length < 2) {
    // 字符串太短，无法计算 2-gram
    return str1 === str2 ? 100 : 0
  }

  const grams1 = get2Grams(str1)
  const grams2 = get2Grams(str2)

  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  const allGrams = new Set([...Object.keys(grams1), ...Object.keys(grams2)])

  // 计算点积和模长
  for (const gram of allGrams) {
    const count1 = grams1[gram] || 0
    const count2 = grams2[gram] || 0
    dotProduct += count1 * count2
    magnitude1 += count1 * count1
    magnitude2 += count2 * count2
  }

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0
  }

  const cosine = dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2))
  return Math.round(cosine * 100)
}

/**
 * 标准化弹幕文本
 * 移除空白、统一大小写等
 */
function normalizeDanmaku(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '') // 移除所有空白字符
    .replace(/[^\w\u4e00-\u9fff]/g, '') // 保留字母、数字、汉字
}

/**
 * 主要的相似度检测函数
 */
export function checkSimilarity(
  danmaku1: string,
  danmaku2: string,
  config: Partial<SimilarityConfig> = {}
): SimilarityResult {
  const finalConfig: SimilarityConfig = {
    maxEditDist: 3,
    maxCosine: 80,
    minDanmuSize: 2,
    ...config,
  }

  // 标准化输入
  const norm1 = normalizeDanmaku(danmaku1)
  const norm2 = normalizeDanmaku(danmaku2)

  // 检查完全相同
  if (norm1 === norm2) {
    return {
      isSimilar: true,
      reason: SimilarityReason.IDENTICAL,
      distance: 0,
      ratio: 100,
    }
  }

  const len1 = norm1.length
  const len2 = norm2.length
  const lenSum = len1 + len2

  // 检查编辑距离
  const editDist = fastEditDistance(norm1, norm2)
  const editDistThreshold =
    lenSum < finalConfig.minDanmuSize
      ? (finalConfig.maxEditDist * lenSum) / finalConfig.minDanmuSize
      : finalConfig.maxEditDist

  if (editDist <= editDistThreshold) {
    const ratio = Math.round(((lenSum - editDist) / lenSum) * 100)
    return {
      isSimilar: true,
      reason: SimilarityReason.EDIT_DISTANCE,
      distance: editDist,
      ratio,
    }
  }

  // 检查余弦相似度
  const cosine = cosineSimilarity(norm1, norm2)
  if (cosine >= finalConfig.maxCosine) {
    return {
      isSimilar: true,
      reason: SimilarityReason.COSINE_DISTANCE,
      distance: 100 - cosine,
      ratio: cosine,
    }
  }

  // 尝试压缩连续字符，可能是重复输入导致的相似
  const compressed1 = norm1.replace(/(.)\1{2,}/g, '$1')
  const compressed2 = norm2.replace(/(.)\1{2,}/g, '$1')
  if (norm1 !== compressed1 || norm2 !== compressed2) {
    return checkSimilarity(compressed1, compressed2, finalConfig)
  }

  return {
    isSimilar: false,
    reason: SimilarityReason.EDIT_DISTANCE,
    distance: editDist,
    ratio: 0,
  }
}
