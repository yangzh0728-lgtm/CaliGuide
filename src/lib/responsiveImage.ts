const UNSPLASH_HOST = "images.unsplash.com";
const RESPONSIVE_WIDTHS = [480, 800, 1200] as const;

export function getResponsiveImageSource(source: string) {
  try {
    const url = new URL(source);
    if (url.hostname !== UNSPLASH_HOST) {
      return { src: source };
    }

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", url.searchParams.get("fit") || "crop");
    url.searchParams.set("w", "1200");

    const src = url.toString();
    const srcSet = RESPONSIVE_WIDTHS.map((width) => {
      const variant = new URL(src);
      variant.searchParams.set("w", String(width));
      return `${variant.toString()} ${width}w`;
    }).join(", ");

    return { src, srcSet };
  } catch {
    return { src: source };
  }
}
