import { GetStoreProductUseCase } from './get-store-product.use-case';
import { ProductRepositoryPort } from '@application/ports/product.repository.port';

describe('GetStoreProductUseCase', () => {
  let useCase: GetStoreProductUseCase;
  let repository: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    repository = {
      findStoreProduct: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };
    useCase = new GetStoreProductUseCase(repository);
  });

  it('returns product when found', async () => {
    const product = {
      id: '1',
      name: 'Test',
      description: 'Desc',
      priceInCents: 1000,
      stockUnits: 5,
    };
    repository.findStoreProduct.mockResolvedValue(product);
    const result = await useCase.execute();
    expect(result).toEqual({ ok: true, value: product });
  });

  it('returns error when product missing', async () => {
    repository.findStoreProduct.mockResolvedValue(null);
    const result = await useCase.execute();
    expect(result).toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' });
  });
});
