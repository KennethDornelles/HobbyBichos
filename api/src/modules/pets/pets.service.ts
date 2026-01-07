import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPetDto: CreatePetDto, ownerId: string) {
    return this.prisma.pet.create({
      data: {
        ...createPetDto,
        ownerId,
      },
    });
  }

  async findAll() {
    return this.prisma.pet.findMany();
  }

  async findOne(id: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }
    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto, ownerId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.pet.update({
      where: { id },
      data: updatePetDto,
    });
  }

  async remove(id: string, ownerId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.pet.delete({ where: { id } });
  }

  async findMyPets(ownerId: string) {
    return this.prisma.pet.findMany({ where: { ownerId } });
  }
}
