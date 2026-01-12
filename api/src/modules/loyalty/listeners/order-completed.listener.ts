import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoyaltyService } from '../services/loyalty.service';
import { LoyaltyReferralService } from '../services/loyalty-referral.service';

interface OrderCompletedEvent {
  orderId: string;
  userId: string;
  amount: any;
}

@Injectable()
export class OrderCompletedListener {
  private readonly logger = new Logger(OrderCompletedListener.name);

  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly referralService: LoyaltyReferralService,
  ) {}

  @OnEvent('order.completed')
  async handleOrderCompleted(event: OrderCompletedEvent): Promise<void> {
    try {
      this.logger.debug(
        `Processing loyalty for completed order ${event.orderId}`,
      );

      await this.loyaltyService.handleOrderCompleted(
        event.orderId,
        event.userId,
        event.amount,
      );

      await this.referralService.processReferralFirstPurchase(event.userId);

      this.logger.log(`Loyalty points awarded for order ${event.orderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process loyalty for order ${event.orderId}`,
        error,
      );
    }
  }
}
