import React, { useState, useCallback, forwardRef } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>

export const ImageWithFallback = forwardRef<HTMLImageElement, ImgProps>(function ImageWithFallback(
  props,
  ref,
) {
  const [didError, setDidError] = useState(false)

  const handleError = useCallback(
    (e?: React.SyntheticEvent<HTMLImageElement>) => {
      setDidError(true)
      if (props.onError) props.onError(e as any)
    },
    [props],
  )

  const handleLoad = useCallback(
    (e?: React.SyntheticEvent<HTMLImageElement>) => {
      setDidError(false)
      if (props.onLoad) props.onLoad(e as any)
    },
    [props],
  )

  const { src, alt = '', style, className = '', ...rest } = props

  if (didError) {
    return (
      <div className={`inline-block bg-gray-100 text-center align-middle ${className}`} style={style}>
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt={`Fallback: ${alt}`} ref={ref} {...rest} />
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={(rest as any).loading ?? 'lazy'}
      ref={ref}
      onError={handleError}
      onLoad={handleLoad}
      {...rest}
    />
  )
})

ImageWithFallback.displayName = 'ImageWithFallback'
