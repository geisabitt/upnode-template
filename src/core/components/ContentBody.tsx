import { createElement, type ReactNode } from 'react'
import { siteConfig } from '@/client/config/site.config'
import { isPublicLinkEnabled } from '@/core/lib/modules'
const entities = (value: string) => value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) => {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  if (entity[0] !== '#') return named[entity.toLowerCase()] || ''
  const number = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
  return Number.isInteger(number) && number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : ''
})
export function safeContentHref(value: string): string | undefined {
  try {
    const href = entities(value).trim(), url = new URL(href, siteConfig.seo.url)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined
    if (url.origin === new URL(siteConfig.seo.url).origin && !isPublicLinkEnabled(url.pathname)) return undefined
    return url.origin === new URL(siteConfig.seo.url).origin ? url.pathname + url.search + url.hash : url.toString()
  } catch { return undefined }
}
type Node = { tag: string; href?: string; children: (Node | string)[] }
const allowed = new Set(['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'br'])
// Creates React nodes from an allowlist. No raw HTML, style, script or event attributes.
export function htmlContent(content: string): ReactNode {
  const root: Node = { tag: 'div', children: [] }, stack = [root]
  const clean = content.replace(/<(script|style|iframe|object|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  for (const token of clean.match(/<[^>]*>|[^<]+|</g) || []) {
    const tag = token.match(/^<(\/?)\s*([a-z0-9]+)\b([^>]*)>/i)
    if (!tag) { stack[stack.length - 1].children.push(entities(token)); continue }
    const name = tag[2].toLowerCase() === 'h1' ? 'h2' : tag[2].toLowerCase()
    if (!allowed.has(name)) continue
    if (tag[1]) { const index = stack.map(node => node.tag).lastIndexOf(name); if (index > 0) stack.length = index; continue }
    const href = name === 'a' ? tag[3].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i) : null
    const node: Node = { tag: name, children: [], ...(href ? { href: safeContentHref(href[1] || href[2] || href[3]) } : {}) }
    stack[stack.length - 1].children.push(node)
    if (name !== 'br' && stack.length < 64) stack.push(node)
  }
  const render = (node: Node | string, key: number): ReactNode => typeof node === 'string' ? node : createElement(
    node.tag === 'a' && !node.href ? 'span' : node.tag,
    { key, ...(node.tag === 'a' && node.href ? { href: node.href, rel: 'noopener noreferrer' } : {}) },
    ...(node.tag === 'br' ? [] : node.children.map(render)),
  )
  return root.children.map(render)
}
function inlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^\s)]+\))/g).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (!match) return part
    const href = safeContentHref(match[2])
    return href ? <a key={index} href={href} rel="noopener noreferrer">{match[1]}</a> : match[1]
  })
}
export function ContentBody({ content, format }: { content: string; format?: 'plain' | 'html' | 'markdown' }) {
  format = format || (/<(?:h[1-6]|p|a|ul|ol|strong|em)(?:\s|>)/i.test(content) ? 'html' : /^#{1,6}\s|\[[^\]]+\]\([^\s)]+\)/m.test(content) ? 'markdown' : 'plain')
  if (format === 'html') return <>{htmlContent(content)}</>
  if (format === 'markdown') return <>{content.split(/\r?\n/).map((line, index) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    return heading ? createElement('h' + Math.max(2, heading[1].length), { key: index }, inlineMarkdown(heading[2])) :
      <p key={index}>{inlineMarkdown(line)}</p>
  })}</>
  return <>{content}</>
}
