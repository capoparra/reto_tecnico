import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductDto,
  ProductRepositoryPort,
} from '@application/ports/product.repository.port';
import { ProductOrmEntity } from '../entities/product.orm-entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findStoreProduct(): Promise<ProductDto | null> {
    const products = await this.repo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    const product = products[0];
    if (!product) return null;
    return this.toDto(product);
  }

  async findById(id: string): Promise<ProductDto | null> {
    const product = await this.repo.findOne({ where: { id } });
    return product ? this.toDto(product) : null;
  }

  async decrementStock(id: string): Promise<ProductDto | null> {
    const result = await this.repo
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stockUnits: () => 'stock_units - 1' })
      .where('id = :id', { id })
      .andWhere('stock_units > 0')
      .execute();
    if (!result.affected) return null;
    return this.findById(id);
  }

  private toDto(entity: ProductOrmEntity): ProductDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      priceInCents: entity.priceInCents,
      stockUnits: entity.stockUnits,
      imageUrl: entity.imageUrl,
    };
  }
}
