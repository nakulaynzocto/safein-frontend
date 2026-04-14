'use client';
import Image from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = '',
  priority = false,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error || !src) {
    return (
      <div className={`bg-gradient-to-r from-slate-200 to-slate-300 ${className} flex items-center justify-center`}>
          <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">Image Unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      className={className}
      onError={handleError}
      priority={priority}
    />
  );
}
