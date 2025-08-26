import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReviewDto & { userId: number }) {
    return this.prisma.review.create({ 
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.userId,
        productId: data.productId,
      }
    });
  }

  async findAll() {
    return this.prisma.review.findMany();
  }

  async findOne(id: number) {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateReviewDto) {
    return this.prisma.review.update({ 
      where: { id }, 
      data: {
        rating: data.rating,
        comment: data.comment,
        productId: data.productId,
      }
    });
  }

  async remove(id: number) {
    return this.prisma.review.delete({ where: { id } });
  }
}
