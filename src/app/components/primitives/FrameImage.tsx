import { useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface FrameImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Lazily loaded image that fades in on load — never pops into view.
 */
export function FrameImage({ src, alt, className, imgClassName }: FrameImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <ImageWithFallback
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName ?? ""}`}
      />
    </div>
  );
}
