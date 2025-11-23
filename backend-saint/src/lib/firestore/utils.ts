import { Timestamp } from 'firebase-admin/firestore';

export function now(): Timestamp {
  return Timestamp.now();
}

export function serializeFirestoreData<T>(data: any): T {
  if (!data) return data;

  const serialized: any = { ...data };

  Object.keys(serialized).forEach((key) => {
    const value = serialized[key];

    if (value instanceof Timestamp) {
      serialized[key] = value.toDate().toISOString();
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeFirestoreData(value);
    }

    if (Array.isArray(value)) {
      serialized[key] = value.map((item) =>
        typeof item === 'object' ? serializeFirestoreData(item) : item
      );
    }
  });

  return serialized as T;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `ORD-${year}${month}${day}-${random}`;
}