import { ProductOrmEntity } from '../entities/product.orm-entity';

export const seedProducts: Partial<ProductOrmEntity>[] = [
  {
    name: 'Auriculares Bluetooth Pro',
    description:
      'Auriculares inalámbricos con cancelación de ruido, 30h de batería y estuche de carga rápida.',
    priceInCents: 24990000,
    stockUnits: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
];
