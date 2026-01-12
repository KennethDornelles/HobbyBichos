import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyService } from './loyalty.service';
import { PrismaService } from '../../database/prisma.service';
import { LoyaltyCalculatorService } from './loyalty-calculator.service';
import { LoyaltyTierService } from './loyalty-tier.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  LoyaltyTier,
  TransactionType,
  RedemptionStatus,
  Prisma,
} from '@prisma/client';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let prisma: PrismaService;
  let calculator: LoyaltyCalculatorService;
  let tierService: LoyaltyTierService;
  let events: EventEmitter2;

  const mockUserId = 'test-user-id';
  const mockAccountId = 'test-account-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            loyaltyAccount: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            loyaltyTransaction: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            loyaltyReward: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            loyaltyRedemption: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            order: { count: jest.fn() },
            $transaction: jest.fn(),
          },
        },
        {
          provide: LoyaltyCalculatorService,
          useValue: {
            calculatePointsFromPurchase: jest.fn().mockReturnValue(100),
            calculateTierFromLifetimePoints: jest
              .fn()
              .mockReturnValue(LoyaltyTier.BRONZE),
            getTierMultiplier: jest.fn().mockReturnValue(1),
            getTierBenefits: jest.fn().mockReturnValue(['benefit1']),
            generateRedemptionCode: jest.fn().mockReturnValue('HBC-ABC123'),
          },
        },
        {
          provide: LoyaltyTierService,
          useValue: {
            checkAndUpgradeTier: jest
              .fn()
              .mockResolvedValue({ upgraded: false }),
            getTierDetails: jest.fn().mockReturnValue({
              name: 'Bronze',
              benefits: [],
              multiplier: 1,
              color: '#b08d57',
            }),
            getTierProgress: jest
              .fn()
              .mockReturnValue({ current: 0, target: 1000, percentage: 0 }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoyaltyService>(LoyaltyService);
    prisma = module.get<PrismaService>(PrismaService);
    calculator = module.get<LoyaltyCalculatorService>(LoyaltyCalculatorService);
    tierService = module.get<LoyaltyTierService>(LoyaltyTierService);
    events = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('getOrCreateAccount', () => {
    it('should create new account if not exists', async () => {
      const mockAccount = {
        id: mockAccountId,
        userId: mockUserId,
        currentPoints: 0,
        lifetimePoints: 0,
        tier: LoyaltyTier.BRONZE,
        tierExpiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        phone: '1234567890',
        role: 'CLIENT',
        storeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      jest
        .spyOn(prisma.loyaltyAccount, 'upsert')
        .mockResolvedValue(mockAccount as any);

      const result = await service.getOrCreateAccount(mockUserId);
      expect(result.userId).toBe(mockUserId);
      expect(result.tier).toBe(LoyaltyTier.BRONZE);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getOrCreateAccount(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addPoints', () => {
    it('should add points to account and emit event', async () => {
      const mockAccount = {
        id: mockAccountId,
        userId: mockUserId,
        currentPoints: 0,
        lifetimePoints: 0,
        tier: LoyaltyTier.BRONZE,
        tierExpiresAt: new Date(),
      };

      const mockTransaction = {
        id: 'txn-1',
        accountId: mockAccountId,
        points: 100,
        type: TransactionType.PURCHASE,
        description: 'Test purchase',
        orderId: null,
        referenceId: null,
        expiresAt: null,
        expired: false,
        createdAt: new Date(),
      };

      jest
        .spyOn(service, 'getOrCreateAccount')
        .mockResolvedValue(mockAccount as any);
      jest
        .spyOn(prisma, '$transaction')
        .mockResolvedValue([mockTransaction] as any);

      const result = await service.addPoints({
        userId: mockUserId,
        points: 100,
        type: TransactionType.PURCHASE,
        description: 'Test purchase',
      });

      expect(result.points).toBe(100);
      expect(events.emit).toHaveBeenCalledWith(
        'loyalty.points.earned',
        expect.any(Object),
      );
    });
  });

  describe('redeemReward', () => {
    it('should fail if user has insufficient points', async () => {
      const mockAccount = {
        id: mockAccountId,
        userId: mockUserId,
        currentPoints: 100,
        lifetimePoints: 100,
        tier: LoyaltyTier.BRONZE,
      };

      const mockReward = {
        id: 'reward-1',
        name: 'Test Reward',
        pointsCost: 500,
        isActive: true,
        stockLimit: null,
        usedCount: 0,
      };

      jest
        .spyOn(service, 'getOrCreateAccount')
        .mockResolvedValue(mockAccount as any);
      jest
        .spyOn(prisma.loyaltyReward, 'findUnique')
        .mockResolvedValue(mockReward as any);

      await expect(
        service.redeemReward(mockUserId, { rewardId: 'reward-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate redemption code and deduct points', async () => {
      const mockAccount = {
        id: mockAccountId,
        userId: mockUserId,
        currentPoints: 500,
        lifetimePoints: 500,
        tier: LoyaltyTier.BRONZE,
      };

      const mockReward = {
        id: 'reward-1',
        name: 'Test Reward',
        pointsCost: 500,
        isActive: true,
        stockLimit: null,
        usedCount: 0,
        value: new Prisma.Decimal('10.00'),
        rewardType: 'DISCOUNT_PERCENT',
      };

      const mockRedemption = {
        id: 'redeem-1',
        accountId: mockAccountId,
        rewardId: 'reward-1',
        pointsUsed: 500,
        code: 'HBC-ABC123',
        status: RedemptionStatus.PENDING,
        usedAt: null,
        expiresAt: new Date(),
        orderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(service, 'getOrCreateAccount')
        .mockResolvedValue(mockAccount as any);
      jest
        .spyOn(prisma.loyaltyReward, 'findUnique')
        .mockResolvedValue(mockReward as any);
      jest
        .spyOn(prisma, '$transaction')
        .mockResolvedValue([mockRedemption] as any);

      const result = await service.redeemReward(mockUserId, {
        rewardId: 'reward-1',
      });
      expect(result.code).toBe('HBC-ABC123');
      expect(result.status).toBe(RedemptionStatus.PENDING);
    });
  });

  describe('applyRedemptionCode', () => {
    it('should fail if code is invalid', async () => {
      jest
        .spyOn(prisma.loyaltyRedemption, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.applyRedemptionCode('INVALID-CODE', 'order-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if code is expired', async () => {
      const mockRedemption = {
        id: 'redeem-1',
        code: 'HBC-ABC123',
        status: RedemptionStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000),
        reward: {
          value: new Prisma.Decimal('10.00'),
          rewardType: 'DISCOUNT_PERCENT',
        },
      };

      jest
        .spyOn(prisma.loyaltyRedemption, 'findUnique')
        .mockResolvedValue(mockRedemption as any);

      await expect(
        service.applyRedemptionCode('HBC-ABC123', 'order-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleOrderCompleted', () => {
    it('should award welcome bonus for first order', async () => {
      const mockAccount = {
        id: mockAccountId,
        userId: mockUserId,
        currentPoints: 0,
        lifetimePoints: 0,
        tier: LoyaltyTier.BRONZE,
      };

      jest
        .spyOn(service, 'getOrCreateAccount')
        .mockResolvedValue(mockAccount as any);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(1);
      jest
        .spyOn(service, 'addPoints')
        .mockResolvedValue({ id: 'txn-1' } as any);

      await service.handleOrderCompleted(
        'order-1',
        mockUserId,
        new Prisma.Decimal('100'),
      );

      expect(service.addPoints).toHaveBeenCalledTimes(2);
    });
  });
});
