import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates and creates a commission record for a completed appointment.
   * Based on the Service's commissionPercentage.
   */
  async calculateForAppointment(appointmentId: string) {
    this.logger.log(`Calculating commission for appointment ${appointmentId}`);
    
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        professional: true,
      },
    });

    if (!appointment) {
      this.logger.warn(`Appointment ${appointmentId} not found`);
      return;
    }

    if (!appointment.professionalId) {
      this.logger.log(`No professional assigned to appointment ${appointmentId}`);
      return;
    }

    // Check if commission already exists
    const existing = await this.prisma.commission.findFirst({
      where: {
        sourceType: 'APPOINTMENT',
        sourceId: appointmentId,
      },
    });

    if (existing) {
      this.logger.log(`Commission already exists for appointment ${appointmentId}`);
      return;
    }

    // Calculate details
    const percentage = appointment.service.commissionPercentage || 0;
    if (percentage <= 0) {
      this.logger.log(`Service ${appointment.service.name} has 0% commission`);
      return;
    }

    const price = Number(appointment.service.price);
    const amount = (price * percentage) / 100;

    await this.prisma.commission.create({
      data: {
        professionalId: appointment.professionalId,
        amount,
        status: 'PENDING',
        sourceType: 'APPOINTMENT',
        sourceId: appointmentId,
      },
    });

    this.logger.log(`Commission of ${amount} created for professional ${appointment.professionalId}`);
  }

  /**
   * Calculates and creates commission records for an order.
   * Iterates through OrderItems and checks for assigned professionalId.
   */
  async calculateForOrder(orderId: string) {
    this.logger.log(`Calculating commissions for order ${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      return;
    }

    for (const item of order.orderItems) {
      // Only items designated to a professional
      if (!item.professionalId) continue;

      // Check existence
      const existing = await this.prisma.commission.findFirst({
        where: {
          sourceType: 'ORDER_ITEM',
          sourceId: item.id,
        },
      });

      if (existing) continue;

      let percentage = 0;
      let basePrice = 0;

      if (item.productId && item.product) {
        percentage = item.product.commissionPercentage || 0;
        basePrice = Number(item.price); // Or item.product.basePrice? Usually sale price.
      } else if (item.serviceId && item.service) {
         // Should usually use appointments for service commissions, but if sold as a package/voucher:
         percentage = item.service.commissionPercentage || 0;
         basePrice = Number(item.price);
      }

      if (percentage > 0) {
        // Commission on total line item amount or unit price? 
        // Usually commission is per item sold. 
        // total amount for this line = price * quantity.
        const totalLineAmount = basePrice * item.quantity;
        const commissionAmount = (totalLineAmount * percentage) / 100;

        if (commissionAmount > 0) {
           await this.prisma.commission.create({
            data: {
              professionalId: item.professionalId,
              amount: commissionAmount,
              status: 'PENDING',
              sourceType: 'ORDER_ITEM', // Differentiating from generic ORDER
              sourceId: item.id, // Linking to specific item
            },
          });
          this.logger.log(`Commission of ${commissionAmount} created for item ${item.id}`);
        }
      }
    }
  }
}
