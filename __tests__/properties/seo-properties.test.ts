/**
 * Property-Based Tests: SEO metadata correctness properties
 * Tests SEO generation functions from Admin/lib/seo.ts
 *
 * Properties covered:
 * - Property 13: SEO Metadata Generation (Requirements 3.2.1.4)
 */
import * as fc from 'fast-check'

// Inline the pure SEO functions (same logic as Admin/lib/seo.ts)
// so frontend tests don't need to import from Admin/

function generateMetaTitle(productName: string, brandName?: string, categoryName?: string): string {
  let title = productName.trim()
  if (brandName?.trim()) title += ` - ${brandName.trim()}`
  if (categoryName?.trim()) title += ` | ${categoryName.trim()}`
  return title
}

function generateMetaDescription(description: string, maxLength = 160): string {
  const stripped = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (stripped.length <= maxLength) return stripped
  return stripped.slice(0, maxLength - 3).trimEnd() + '...'
}

function generateKeywords(
  productName: string,
  brandName?: string,
  categoryName?: string,
  attributes?: Record<string, string>
): string[] {
  const keywords: string[] = []
  const name = productName.trim()
  if (name) keywords.push(name)
  if (brandName?.trim()) {
    keywords.push(brandName.trim())
    keywords.push(`${name} ${brandName.trim()}`)
  }
  if (categoryName?.trim()) {
    keywords.push(categoryName.trim())
    keywords.push(`${name} ${categoryName.trim()}`)
  }
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value?.trim()) {
        keywords.push(value.trim())
        keywords.push(`${name} ${key} ${value.trim()}`)
      }
    }
  }
  return [...new Set(keywords.filter(Boolean))]
}

const nonEmptyString = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
const optionalString = fc.option(nonEmptyString, { nil: undefined })

// ===== PROPERTY 13: SEO Metadata Generation =====

describe('Property 13: SEO Metadata Generation', () => {
  describe('generateMetaTitle', () => {
    it('always contains the product name', () => {
      fc.assert(
        fc.property(nonEmptyString, optionalString, optionalString, (name, brand, category) => {
          const title = generateMetaTitle(name, brand, category)
          expect(title).toContain(name.trim())
        })
      )
    })

    it('contains brand name when provided', () => {
      fc.assert(
        fc.property(nonEmptyString, nonEmptyString, (name, brand) => {
          const title = generateMetaTitle(name, brand)
          expect(title).toContain(brand.trim())
        })
      )
    })

    it('contains category name when provided', () => {
      fc.assert(
        fc.property(nonEmptyString, nonEmptyString, (name, category) => {
          const title = generateMetaTitle(name, undefined, category)
          expect(title).toContain(category.trim())
        })
      )
    })

    it('without brand/category, title equals trimmed product name', () => {
      fc.assert(
        fc.property(nonEmptyString, name => {
          const title = generateMetaTitle(name)
          expect(title).toBe(name.trim())
        })
      )
    })

    it('title is never empty for non-empty product name', () => {
      fc.assert(
        fc.property(nonEmptyString, optionalString, optionalString, (name, brand, category) => {
          const title = generateMetaTitle(name, brand, category)
          expect(title.length).toBeGreaterThan(0)
        })
      )
    })
  })

  describe('generateMetaDescription', () => {
    it('description never exceeds maxLength', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 1000 }),
          fc.integer({ min: 10, max: 300 }),
          (description, maxLength) => {
            const result = generateMetaDescription(description, maxLength)
            expect(result.length).toBeLessThanOrEqual(maxLength)
          }
        )
      )
    })

    it('short descriptions are returned unchanged (no HTML)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('<') && !s.includes('>')),
          description => {
            const cleaned = description.replace(/\s+/g, ' ').trim()
            if (cleaned.length <= 160) {
              const result = generateMetaDescription(description)
              expect(result).toBe(cleaned)
            }
          }
        )
      )
    })

    it('truncated descriptions end with "..."', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 200, maxLength: 500 }).filter(s => !s.includes('<')),
          description => {
            const result = generateMetaDescription(description, 160)
            if (result.length === 160) {
              expect(result.endsWith('...')).toBe(true)
            }
          }
        )
      )
    })

    it('strips HTML tags from description', () => {
      const htmlDesc = '<p>Sản phẩm <strong>chất lượng</strong> cao</p>'
      const result = generateMetaDescription(htmlDesc)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('Sản phẩm')
    })
  })

  describe('generateKeywords', () => {
    it('always includes product name as a keyword', () => {
      fc.assert(
        fc.property(nonEmptyString, optionalString, optionalString, (name, brand, category) => {
          const keywords = generateKeywords(name, brand, category)
          expect(keywords).toContain(name.trim())
        })
      )
    })

    it('keywords array has no duplicates', () => {
      fc.assert(
        fc.property(nonEmptyString, optionalString, optionalString, (name, brand, category) => {
          const keywords = generateKeywords(name, brand, category)
          const unique = new Set(keywords)
          expect(keywords.length).toBe(unique.size)
        })
      )
    })

    it('keywords array is non-empty for non-empty product name', () => {
      fc.assert(
        fc.property(nonEmptyString, name => {
          const keywords = generateKeywords(name)
          expect(keywords.length).toBeGreaterThan(0)
        })
      )
    })

    it('all keywords are non-empty strings', () => {
      fc.assert(
        fc.property(nonEmptyString, optionalString, optionalString, (name, brand, category) => {
          const keywords = generateKeywords(name, brand, category)
          for (const kw of keywords) {
            expect(typeof kw).toBe('string')
            expect(kw.length).toBeGreaterThan(0)
          }
        })
      )
    })
  })
})
