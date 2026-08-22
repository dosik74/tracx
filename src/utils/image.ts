/**
 * Читает файл изображения и уменьшает его до maxSize по большей стороне,
 * возвращая data URL (можно хранить прямо в БД).
 * GIF не ресайзится (иначе пропадёт анимация) — проверяется лимит размера.
 */
export function fileToDataUrl(file: File, maxSize: number, gifLimitBytes = 3_000_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Это не изображение.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));

    reader.onload = () => {
      const raw = String(reader.result);
      // GIF оставляем как есть (анимация), но ограничиваем размер
      if (file.type === 'image/gif') {
        if (raw.length <= gifLimitBytes * 1.4) resolve(raw);
        else reject(new Error('GIF слишком большой (максимум ~2 МБ).'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось открыть изображение.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas недоступен.'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = raw;
    };

    reader.readAsDataURL(file);
  });
}
