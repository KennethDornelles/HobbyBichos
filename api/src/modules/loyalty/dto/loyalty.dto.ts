import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  Min,
} from 'class-validator';
import { LoyaltyTier, RewardType, TransactionType } from '@prisma/client';
import { IsDecimal } from '../../../common/validators/is-decimal.validator';

export class GetBalanceResponseDto {
  @ApiProperty({ example: 1200 })
  currentPoints: number;

  @ApiProperty({ example: 2500 })
  lifetimePoints: number;

  @ApiProperty({ enum: LoyaltyTier, example: LoyaltyTier.SILVER })
  tier: LoyaltyTier;

  @ApiProperty({ example: 'Silver' })
  tierName: string;

  @ApiProperty({ example: 3000 })
  nextTierPoints: number;

  @ApiProperty({ type: [String], example: ['5% de desconto', 'Frete grátis'] })
  tierBenefits: string[];

  @ApiProperty({ example: 40 })
  progressPercentage: number;

  constructor(partial: Partial<GetBalanceResponseDto>) {
    Object.assign(this, partial);
    this.progressPercentage = this.calculateProgressPercentage();
  }

  private calculateProgressPercentage(): number {
    if (!this.nextTierPoints || this.nextTierPoints <= 0) {
      return 100;
    }
    const ratio = (this.currentPoints / this.nextTierPoints) * 100;
    return Math.min(100, Math.max(0, Math.floor(ratio)));
  }
}

export class AddPointsDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  points: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Compra na loja' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ example: 'ORDER-123' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class RedeemRewardDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  rewardId: string;
}

export class CreateRewardDto {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Desconto em próxima compra' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 500 })
  @IsInt()
  @Min(1)
  pointsCost: number;

  @ApiProperty({ enum: RewardType })
  @IsEnum(RewardType)
  rewardType: RewardType;

  @ApiProperty({ example: '10.00', description: 'Valor da recompensa' })
  @IsDecimal()
  value: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  stockLimit?: number;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}

export class ApplyRedemptionCodeDto {
  @ApiProperty({ example: 'HBC-ABC123' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^HBC-[A-Z0-9]{6}$/)
  code: string;
}

export class GenerateReferralCodeResponseDto {
  @ApiProperty({ example: 'HOBBY2024' })
  code: string;

  @ApiProperty({ example: 'https://hobbybichos.com/ref/HOBBY2024' })
  url: string;

  @ApiProperty({ example: 200 })
  pointsEarned: number;

  @ApiProperty({ example: 5 })
  totalReferrals: number;

  constructor(partial: Partial<GenerateReferralCodeResponseDto>) {
    Object.assign(this, partial);
  }
}
