import { ApiProperty } from '@nestjs/swagger';
import { GENDERS, PLAN_MONTHS } from '../../domain/catalog-types';

// OpenAPI schemas for the catalog read models (the generated app/web clients are built from these).

export class GymDto {
  @ApiProperty() id!: string;
  @ApiProperty() nameEn!: string;
  @ApiProperty() nameAr!: string;
  @ApiProperty({ enum: ['LISTED', 'PARTNER'] }) status!: string;
}

export class OfferViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ description: 'SAR' }) price!: number;
  @ApiProperty({ description: 'SAR, shown struck through' }) wasPrice!: number;
  @ApiProperty({ type: String, format: 'date-time' }) endsAt!: Date;
}

export class PlanViewDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: PLAN_MONTHS }) months!: number;
  @ApiProperty({ description: 'Regular price, SAR' }) price!: number;
  @ApiProperty({ description: 'Price booking locks today (offer if live), SAR' })
  effectivePrice!: number;
  @ApiProperty({ description: '"That\'s X SAR a month"' }) monthlyPrice!: number;
  @ApiProperty() renewalPrice!: number;
  @ApiProperty() joiningFee!: number;
  @ApiProperty() freezeDays!: number;
  @ApiProperty() refundDays!: number;
  @ApiProperty({ description: 'Joining + first term + renewals for 12 months' })
  twelveMonthCost!: number;
  @ApiProperty({ type: String, format: 'date-time' }) verifiedAt!: Date;
  @ApiProperty() verifiedDaysAgo!: number;
  @ApiProperty({ description: 'Show "price may be outdated"' }) isPriceStale!: boolean;
  @ApiProperty({ type: OfferViewDto, nullable: true }) offer!: OfferViewDto | null;
}

export class BranchSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: GymDto }) gym!: GymDto;
  @ApiProperty() district!: string;
  @ApiProperty() city!: string;
  @ApiProperty({ enum: GENDERS }) gender!: string;
  @ApiProperty() lat!: number;
  @ApiProperty() lng!: number;
  @ApiProperty({ type: String, nullable: true }) photo!: string | null;
  @ApiProperty({ type: Number, nullable: true }) distanceMeters!: number | null;
  @ApiProperty({ description: 'Partner gym: booking enabled' }) bookable!: boolean;
  @ApiProperty() hasOffer!: boolean;
  @ApiProperty({ type: PlanViewDto, nullable: true }) featuredPlan!: PlanViewDto | null;
}

export class BranchDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: GymDto }) gym!: GymDto;
  @ApiProperty() district!: string;
  @ApiProperty() city!: string;
  @ApiProperty({ enum: GENDERS }) gender!: string;
  @ApiProperty() lat!: number;
  @ApiProperty() lng!: number;
  @ApiProperty({ type: [String] }) photos!: string[];
  @ApiProperty() bookable!: boolean;
  @ApiProperty() hasOffer!: boolean;
  @ApiProperty({ type: [PlanViewDto] }) plans!: PlanViewDto[];
}

export class ComparedBranchDto {
  @ApiProperty({ type: BranchDetailDto }) branch!: BranchDetailDto;
  @ApiProperty({ type: PlanViewDto, nullable: true }) cheapestPlan!: PlanViewDto | null;
}

export class ComparisonDto {
  @ApiProperty({ type: [ComparedBranchDto] }) branches!: ComparedBranchDto[];
  @ApiProperty({ type: String, nullable: true }) bestValueBranchId!: string | null;
}
