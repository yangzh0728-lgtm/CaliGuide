export const MAX_FORUM_POST_IMAGES = 8;

export function mergeForumPostImageSelection(currentImages: File[], selectedFiles: ArrayLike<File> | null) {
  if (!selectedFiles?.length) {
    return currentImages;
  }

  return [...currentImages, ...Array.from(selectedFiles)].slice(0, MAX_FORUM_POST_IMAGES);
}
