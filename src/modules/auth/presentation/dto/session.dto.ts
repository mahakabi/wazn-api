import { ApiProperty } from '@nestjs/swagger';
import { type Session } from '../../domain/session';
import { AuthUserDto } from './auth-user.dto';

export class SessionDto implements Session {
  @ApiProperty({ description: 'JWT. Send as `Authorization: Bearer <token>`' })
  accessToken!: string;

  @ApiProperty({ example: 900, description: 'Seconds' })
  accessTokenExpiresIn!: number;

  @ApiProperty({ description: 'Opaque, single use. Replace it with the one from every refresh.' })
  refreshToken!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  refreshTokenExpiresAt!: Date;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ description: 'True on first sign-in: the app can ask for a first name' })
  isNewUser!: boolean;
}
