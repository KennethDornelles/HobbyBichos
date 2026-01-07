import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Review } from './entities/review.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
  user: { id: string };
}

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiResponse({ status: 201, type: Review })
  async create(@Body() dto: CreateReviewDto, @Request() req: AuthRequest) {
    return this.reviewsService.create(dto, req.user.id);
  }

  @Get('average/store')
  @ApiResponse({ status: 200, schema: { example: 4.5 } })
  async averageForStore(@Query('storeId') storeId: string) {
    return this.reviewsService.averageForStore(storeId);
  }

  @Get('average/employee')
  @ApiResponse({ status: 200, schema: { example: 4.7 } })
  async averageForEmployee(@Query('employeeId') employeeId: string) {
    return this.reviewsService.averageForEmployee(employeeId);
  }
}
