import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Controller('product-images')
@UseGuards(JwtAuthGuard)
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createProductImageDto: CreateProductImageDto, @User() user: any) {
    return this.productImageService.create(createProductImageDto);
  }

  @Get()
  findAll() {
    return this.productImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productImageService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductImageDto: UpdateProductImageDto) {
    return this.productImageService.update(id, updateProductImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productImageService.remove(id);
  }
}
