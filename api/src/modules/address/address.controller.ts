import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('address')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Cria novo endereço' })
  create(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista endereços do usuário' })
  findAll(@Req() req: any) {
    return this.addressService.findAll(req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza endereço' })
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    return this.addressService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove endereço' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.addressService.remove(id, req.user.id);
  }
}
