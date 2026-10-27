import { describe, expect, it } from 'vitest'
import { checkSimilarity, SimilarityReason } from '../src/engine/similarity'

describe('checkSimilarity', () => {
  it('normalizes whitespace, case, punctuation, and Chinese text', () => {
    expect(checkSimilarity(' Hello, WORLD! ', 'hello world')).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.IDENTICAL,
      distance: 0,
      ratio: 100,
    })
    expect(checkSimilarity('弹幕 测试！', '弹幕测试')).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.IDENTICAL,
    })
  })

  it('accepts edits under the configured threshold', () => {
    expect(checkSimilarity('hello', 'hella')).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.EDIT_DISTANCE,
      distance: 2,
      ratio: 80,
    })
  })

  it('uses the size-adjusted edit threshold for short strings', () => {
    expect(
      checkSimilarity('a', 'b', { maxEditDist: 2, minDanmuSize: 4 })
    ).toMatchObject({
      isSimilar: false,
      reason: SimilarityReason.EDIT_DISTANCE,
    })
    expect(
      checkSimilarity('a', 'b', { maxEditDist: 4, minDanmuSize: 4 })
    ).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.EDIT_DISTANCE,
    })
  })

  it('uses 2-gram cosine similarity after the edit threshold is exceeded', () => {
    expect(
      checkSimilarity(
        `${'a'.repeat(50)}${'b'.repeat(50)}`,
        `${'a'.repeat(48)}${'b'.repeat(52)}`
      )
    ).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.COSINE_DISTANCE,
      ratio: expect.any(Number),
    })
  })

  it('handles short strings and empty normalized input', () => {
    expect(checkSimilarity('a', 'b', { maxEditDist: 0 })).toMatchObject({
      isSimilar: false,
      reason: SimilarityReason.EDIT_DISTANCE,
    })
    expect(checkSimilarity('!!!', '???')).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.IDENTICAL,
    })
  })

  it('compresses repeated characters before the final comparison', () => {
    expect(checkSimilarity('hellooooo', 'hello')).toMatchObject({
      isSimilar: true,
      reason: SimilarityReason.IDENTICAL,
      distance: 0,
    })
  })

  it('reports dissimilar text when neither metric passes', () => {
    expect(checkSimilarity('hello', 'world')).toMatchObject({
      isSimilar: false,
      reason: SimilarityReason.EDIT_DISTANCE,
      ratio: 0,
    })
    expect(
      checkSimilarity('hello', 'hella', { maxEditDist: 0, maxCosine: 100 })
    ).toMatchObject({
      isSimilar: false,
      reason: SimilarityReason.EDIT_DISTANCE,
    })
  })
})
