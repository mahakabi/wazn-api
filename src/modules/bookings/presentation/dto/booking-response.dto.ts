import { ApiProperty } from '@nestjs/swagger';
import { BOOKING_STATUSES } from '../../domain/booking-status';

export class BookingPlaceDto {
  @ApiProperty() branchId!: string;
  @ApiProperty() district!: string;
  @ApiProperty() gymNameEn!: string;
  @ApiProperty() gymNameAr!: string;
}

export class MemberBookingDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'WZ-7K42' }) code!: string;
  @ApiProperty({ description: 'Render as a QR code' }) qrPayload!: string;
  @ApiProperty({ enum: BOOKING_STATUSES }) status!: string;
  @ApiProperty({ description: 'SAR, locked at booking' }) lockedPrice!: number;
  @ApiProperty() offerApplied!: boolean;
  @ApiProperty() planId!: string;
  @ApiProperty() planMonths!: number;
  @ApiProperty({ type: String, format: 'date-time' }) expiresAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) confirmedAt!: Date | null;
  @ApiProperty({ type: BookingPlaceDto }) place!: BookingPlaceDto;
}

export class StaffBookingDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty({ enum: BOOKING_STATUSES }) status!: string;
  @ApiProperty({ description: 'SAR to charge at the desk' }) lockedPrice!: number;
  @ApiProperty() planMonths!: number;
  @ApiProperty({ type: String, format: 'date-time' }) expiresAt!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) confirmedAt!: Date | null;
  @ApiProperty({ type: String, nullable: true }) memberFirstName!: string | null;
  @ApiProperty({ type: String, nullable: true, example: '05XX XXX 412' })
  memberMaskedPhone!: string | null;
  @ApiProperty({ type: BookingPlaceDto }) place!: BookingPlaceDto;
}
