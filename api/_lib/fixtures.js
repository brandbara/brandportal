// Imágenes mínimas y datos de ejemplo compartidos por las pruebas de api/ (no se usan en producción).
export const b64 = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
export const JPEG_24x16 = b64('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAQABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwBKKKK0P0kKKKKAP//Z');
export const PNG_40x20 = b64('iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAYAAAD/Rn+7AAAANklEQVR4nO3OMQEAMAjAMIYy/AuZDSaBowc7GgU5favjY7kdmBikDFIGKYOUQcogZZAySBmkHoPFA0xIY/1/AAAAAElFTkSuQmCC');

export const SUPABASE = 'https://proj.supabase.co';
export const STORAGE = `${SUPABASE}/storage/v1/object/public/portals_assets/user-1/`;

// Respuesta de get_portal_secure para un portal público como el de Capeo.
export const capeoRpc = (over = {}) => ({
  status: 'success',
  id: 'p1',
  user_id: 'user-1',
  slug: 'capeo',
  brand_name: 'Capeo',
  is_protected: false,
  canvas_data: {
    items: [
      { id: 'header-1', type: 'header', content: { logo: `${STORAGE}logo.png`, title: 'Portal de Marca' } },
      { id: 'hero', type: 'hero', content: { bgType: 'image', bgValue: `${STORAGE}hero.jpeg`, title: ' ' } },
      { id: 'color', type: 'color', content: { colors: [{ hex: '#FF3C87', name: 'Principal' }, { hex: '#ffe640' }] } },
    ],
    design: { font: 'Outfit' },
    profile: { name: 'Capeo', slug: 'capeo', email: 'dueno@example.com', language: 'ES' },
  },
  ...over,
});
