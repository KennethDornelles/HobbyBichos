import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Store } from '@prisma/client';

// DTO para criação de loja
export class CreateStoreDto {
  name!: string;
  phone?: string;
  isActive?: boolean;
}
@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna os horários disponíveis para agendamento em uma loja em um dia específico
   * @param storeId ID da loja
   * @param date Data no formato YYYY-MM-DD
   */
  async getAvailability(
    storeId: string,
    date: string,
  ): Promise<{ slots: string[]; businessHour: any; exclusions: any[] }> {
    // Função auxiliar para adicionar minutos a uma data
    function addMinutes(date: Date, minutes: number): Date {
      return new Date(date.getTime() + minutes * 60000);
    }
    // Função auxiliar para formatar hora no padrão HH:mm
    function format(date: Date, formatStr: string): string {
      if (formatStr === 'HH:mm') {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      }
      return '';
    }
    // 1. Verifica se é data de exclusão
    const targetDate = new Date(date + 'T00:00:00');
    const exclusion = await this.prisma.storeExclusion.findFirst({
      where: {
        storeId,
        date: {
          gte: targetDate,
          lt: addMinutes(targetDate, 24 * 60),
        },
      },
    });
    if (exclusion)
      return { slots: [], businessHour: null, exclusions: [exclusion] };

    // 2. Busca horário de funcionamento
    const weekday = targetDate.getDay();
    const businessHour = await this.prisma.storeBusinessHour.findFirst({
      where: { storeId, weekday },
    });
    if (!businessHour) return { slots: [], businessHour: null, exclusions: [] };

    // 3. Busca todos os serviços da loja (para saber a duração mínima)
    const services = await this.prisma.service.findMany({
      where: { storeId },
      select: { durationMin: true },
    });
    if (!services.length) return { slots: [], businessHour, exclusions: [] };
    // Considera o menor slot possível
    const minSlot = Math.min(...services.map((s) => s.durationMin));

    // 4. Busca agendamentos já ocupados
    const appointments = await this.prisma.appointment.findMany({
      where: {
        storeId,
        startsAt: {
          gte: targetDate,
          lt: addMinutes(targetDate, 24 * 60),
        },
        status: { in: ['SCHEDULED', 'COMPLETED'] },
      },
      select: { startsAt: true },
    });
    const occupied = appointments.map((a) => format(a.startsAt, 'HH:mm'));

    // 5. Gera slots disponíveis
    const slots: string[] = [];
    const [openH, openM] = businessHour.openTime.split(':').map(Number);
    const [closeH, closeM] = businessHour.closeTime.split(':').map(Number);
    let current = new Date(targetDate);
    current.setHours(openH, openM, 0, 0);
    const close = new Date(targetDate);
    close.setHours(closeH, closeM, 0, 0);
    while (current < close) {
      const slotStr = format(current, 'HH:mm');
      if (!occupied.includes(slotStr)) {
        slots.push(slotStr);
      }
      current = addMinutes(current, minSlot);
    }
    return { slots, businessHour, exclusions: [] };
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const { name, phone, isActive } = createStoreDto;
    const slug = this.slugify(name);
    return await this.prisma.store.create({
      data: {
        name,
        phone,
        slug,
        isActive: isActive ?? true,
      },
    });
  }

  async findAll(): Promise<Store[]> {
    return await this.prisma.store.findMany({
      where: { isActive: true },
    });
  }

  /**
   * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
   * Retorna a distância em quilômetros
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Busca lojas próximas a uma localização
   * @param latitude Latitude do usuário
   * @param longitude Longitude do usuário
   * @param radiusKm Raio de busca em quilômetros (padrão: 5km)
   * @param limit Número máximo de lojas a retornar (padrão: 3)
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 3,
  ): Promise<
    (Store & {
      distance: number;
      distanceText: string;
      durationMinutes?: number;
    })[]
  > {
    // Busca todas as lojas ativas
    const stores = await this.prisma.store.findMany({
      where: { isActive: true },
    });

    // Calcula a distância para cada loja
    const storesWithDistance = stores
      .map((store) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          store.latitude || 0,
          store.longitude || 0,
        );
        const distanceText =
          distance < 1
            ? `${(distance * 1000).toFixed(0)}m`
            : `${distance.toFixed(1)}km`;
        const durationMinutes = Math.round(distance * 3); // Estimativa: 3 minutos por km

        return {
          ...store,
          distance,
          distanceText,
          durationMinutes,
        };
      })
      .filter((store) => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return storesWithDistance;
  }
}
