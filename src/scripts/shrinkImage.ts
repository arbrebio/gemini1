/**
 * The hosting platform rejects request bodies over ~4.5 MB, and phone
 * cameras routinely produce 5–12 MB photos. Uploads therefore go through
 * `shrinkImage` first: large images are re-encoded in the browser as JPEG,
 * at most `maxSide` pixels on the longest side.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Returns a smaller JPEG copy of `file`, or the original file when it is not
 * an image, is already small, cannot be decoded by this browser (e.g. HEIC
 * outside Safari), or would not get smaller. Never throws.
 */
export function shrinkImage(file: File, maxSide = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= 1024 * 1024) return Promise.resolve(file);

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    const done = (result: File) => { URL.revokeObjectURL(objectUrl); resolve(result); };

    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return done(file);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob || blob.size >= file.size) return done(file);
          const name = (file.name || 'photo').replace(/\.[^.]*$/, '') + '.jpg';
          done(new File([blob], name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      } catch {
        done(file);
      }
    };
    img.onerror = () => done(file);
    img.src = objectUrl;
  });
}
