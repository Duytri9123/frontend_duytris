import {
  generateMetaTitle,
  generateMetaDescription,
  generateKeywords,
} from '../../../Admin/lib/seo'

describe('generateMetaTitle', () => {
  it('returns product name alone when no brand or category', () => {
    expect(generateMetaTitle('Laptop ABC')).toBe('Laptop ABC')
  })

  it('appends brand name with dash separator', () => {
    expect(generateMetaTitle('Laptop ABC', 'Dell')).toBe('Laptop ABC - Dell')
  })

  it('appends category with pipe separator', () => {
    expect(generateMetaTitle('Laptop ABC', undefined, 'Electronics')).toBe(
      'Laptop ABC | Electronics'
    )
  })

  it('formats with both brand and category', () => {
    expect(generateMetaTitle('Laptop ABC', 'Dell', 'Electronics')).toBe(
      'Laptop ABC - Dell | Electronics'
    )
  })

  it('trims whitespace from inputs', () => {
    expect(generateMetaTitle('  Laptop  ', '  Dell  ')).toBe('Laptop - Dell')
  })

  it('ignores empty brand/category strings', () => {
    expect(generateMetaTitle('Laptop ABC', '', '')).toBe('Laptop ABC')
  })
})

describe('generateMetaDescription', () => {
  it('strips HTML tags', () => {
    const result = generateMetaDescription('<p>Hello <b>world</b></p>')
    expect(result).toBe('Hello world')
  })

  it('returns plain text unchanged when within maxLength', () => {
    expect(generateMetaDescription('Short description')).toBe('Short description')
  })

  it('truncates and appends ellipsis when exceeding maxLength', () => {
    const long = 'a'.repeat(200)
    const result = generateMetaDescription(long, 160)
    expect(result.length).toBeLessThanOrEqual(160)
    expect(result.endsWith('...')).toBe(true)
  })

  it('respects custom maxLength', () => {
    const result = generateMetaDescription('Hello world this is a test', 10)
    expect(result.length).toBeLessThanOrEqual(10)
    expect(result.endsWith('...')).toBe(true)
  })

  it('collapses multiple spaces', () => {
    const result = generateMetaDescription('Hello   world')
    expect(result).toBe('Hello world')
  })
})

describe('generateKeywords', () => {
  it('returns product name as keyword', () => {
    const keywords = generateKeywords('Laptop ABC')
    expect(keywords).toContain('Laptop ABC')
  })

  it('includes brand and combined brand keyword', () => {
    const keywords = generateKeywords('Laptop ABC', 'Dell')
    expect(keywords).toContain('Dell')
    expect(keywords).toContain('Laptop ABC Dell')
  })

  it('includes category and combined category keyword', () => {
    const keywords = generateKeywords('Laptop ABC', undefined, 'Electronics')
    expect(keywords).toContain('Electronics')
    expect(keywords).toContain('Laptop ABC Electronics')
  })

  it('includes attribute values and combined attribute keywords', () => {
    const keywords = generateKeywords('Laptop ABC', undefined, undefined, { color: 'red' })
    expect(keywords).toContain('red')
    expect(keywords).toContain('Laptop ABC color red')
  })

  it('returns unique keywords (no duplicates)', () => {
    const keywords = generateKeywords('Laptop', 'Laptop')
    const unique = new Set(keywords)
    expect(keywords.length).toBe(unique.size)
  })
})
