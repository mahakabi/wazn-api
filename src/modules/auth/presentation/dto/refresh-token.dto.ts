import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { REFRESH_TOKEN_MAX_LENGTH } from './auth-dto.constants';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(REFRESH_TOKEN_MAX_LENGTH)
  refreshToken!: string;
}
