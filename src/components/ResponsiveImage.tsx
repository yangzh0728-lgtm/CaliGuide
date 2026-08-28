import type { ImgHTMLAttributes } from "react";
import { getResponsiveImageSource } from "../lib/responsiveImage";

type ResponsiveImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
};

export default function ResponsiveImage({ src, sizes, ...props }: ResponsiveImageProps) {
  const source = getResponsiveImageSource(src);

  return (
    <img
      {...props}
      src={source.src}
      srcSet={source.srcSet}
      sizes={source.srcSet ? sizes : undefined}
    />
  );
}
