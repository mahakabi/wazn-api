import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const ID_MAX_LENGTH = 64;

export class CreateBookingDto {
  @ApiProperty({ description: "Plan to book; today's price (or live offer) is locked" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_MAX_LENGTH)
  planId!: string;
}
