export interface ProductDto {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stockUnits: number;
  imageUrl?: string;
}

export interface ProductRepositoryPort {
  findStoreProduct(): Promise<ProductDto | null>;
  findById(id: string): Promise<ProductDto | null>;
  decrementStock(id: string): Promise<ProductDto | null>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
