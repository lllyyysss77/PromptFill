import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { loadImage } from '../utils/imageLoader';

/**
 * OptimizedImage - 优化的图片加载组件
 * 
 * 简化版本：直接使用原生 img + loading="lazy" + 队列限流
 * 避免复杂状态导致的显示问题
 */
const OptimizedImage = memo(({
  src,
  alt = '',
  className = '',
  style = {},
  priority = 10,
  rootMargin = '200px',
  onLoad,
  onError,
  referrerPolicy = 'no-referrer',
  isDarkMode = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasTriggeredLoad = useRef(false);
  const imgRef = useRef(null);

  // 使用 IntersectionObserver 触发队列加载（预热缓存）
  useEffect(() => {
    if (!src || hasTriggeredLoad.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggeredLoad.current) {
          hasTriggeredLoad.current = true;
          // 通过队列预加载，限流
          loadImage(src, priority).catch(() => {});
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority, rootMargin]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.(new Error('Image load failed'));
  }, [onError]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        ...style,
        backgroundColor: !isLoaded && !hasError 
          ? (isDarkMode ? '#374151' : '#e5e7eb') 
          : undefined,
      }}
      onLoad={handleLoad}
      onError={handleError}
      referrerPolicy={referrerPolicy}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };
export default OptimizedImage;
