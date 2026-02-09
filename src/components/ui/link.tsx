import NextLink from 'next/link'
import { type AnchorHTMLAttributes } from 'react'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: string
  contentKey?: string
}

function getHref(href: string): string {
  if (!href) return '#'
  if (href.endsWith('.html')) {
    const path = href === 'index.html' ? '/' : href.slice(0, -5)
    return path.startsWith('/') ? path : '/' + path
  }
  return href
}

export function Link({ 
  className, 
  children, 
  variant, 
  contentKey, 
  href,
  ...props 
}: LinkProps) {
  const isExternal = href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#'))

  if (isExternal) {
    return (
      <a className={className} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <NextLink className={className} href={getHref(href)} {...props}>
      {children}
    </NextLink>
  )
}
