import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { GetCurrentUserUseCase } from '../application/get-current-user.use-case';
import { UpdateProfileUseCase } from '../application/update-profile.use-case';
import { type AccessTokenClaims } from '../domain/access-token-claims';
import { type AuthUser } from '../domain/auth-user';
import { CurrentUser } from './current-user.decorator';
import { AuthUserDto } from './dto/auth-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('me')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ApiErrorDto, description: 'UNAUTHENTICATED' })
@Controller('me')
export class MeController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: AuthUserDto })
  get(@CurrentUser() caller: AccessTokenClaims): Promise<AuthUser> {
    return this.getCurrentUser.execute(caller.userId);
  }

  @Patch()
  @ApiOkResponse({ type: AuthUserDto })
  @ApiBadRequestResponse({ type: ApiErrorDto, description: 'INVALID_PHONE, VALIDATION_FAILED' })
  @ApiConflictResponse({ type: ApiErrorDto, description: 'PHONE_IN_USE' })
  update(
    @CurrentUser() caller: AccessTokenClaims,
    @Body() body: UpdateProfileDto,
  ): Promise<AuthUser> {
    return this.updateProfile.execute(caller.userId, body);
  }
}
