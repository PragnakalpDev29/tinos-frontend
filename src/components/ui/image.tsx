import NextImage, { type ImageProps as NextImageProps } from 'next/image'

interface ImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  variant?: 'default' | 'cover' | 'contain'
  contentKey?: string
}

export function Image({ 
  className, 
  variant = 'default', 
  contentKey,
  src,
  alt,
  width,
  height,
  ...props 
}: ImageProps) {
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      {...props}
    />
  )
}
