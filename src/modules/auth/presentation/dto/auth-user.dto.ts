import { ApiProperty } from '@nestjs/swagger';
import { type AuthUser } from '../../domain/auth-user';
import { USER_ROLES, type UserRole } from '../../domain/user-role';

export class AuthUserDto implements AuthUser {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true, example: 'maha@example.com' })
  email!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '+966501234567' })
  phone!: string | null;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiProperty({ enum: USER_ROLES })
  role!: UserRole;

  @ApiProperty({ example: 'en' })
  locale!: string;

  @ApiProperty()
  whatsappOptIn!: boolean;
}
