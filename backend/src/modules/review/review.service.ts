import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReviewDto) {
    return this.prisma.review.create({ data });
  }

  async findAll() {
    return this.prisma.review.findMany();
  }

  async findOne(id: string) {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateReviewDto) {
    return this.prisma.review.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }
}
