import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { type AccessTokenClaims } from '../../auth/domain/access-token-claims';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { ListSavedGymsUseCase } from '../application/list-saved-gyms.use-case';
import { SaveGymUseCase } from '../application/save-gym.use-case';
import { UnsaveGymUseCase } from '../application/unsave-gym.use-case';
import { type SavedGymView } from '../domain/saved-gym-view';
import { SaveGymDto } from './dto/save-gym.dto';
import { SavedGymDto } from './dto/saved-gym.dto';

@ApiTags('saved')
@ApiBearerAuth()
@Controller('me/saved')
export class SavedGymsController {
  constructor(
    private readonly listSaved: ListSavedGymsUseCase,
    private readonly saveGym: SaveGymUseCase,
    private readonly unsaveGym: UnsaveGymUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: [SavedGymDto] })
  list(@CurrentUser() caller: AccessTokenClaims): Promise<SavedGymView[]> {
    return this.listSaved.execute(caller.userId);
  }

  @Put(':branchId')
  @ApiOkResponse({ type: SavedGymDto })
  @ApiBadRequestResponse({ type: ApiErrorDto, description: 'ALERT_BELOW_REQUIRED' })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'BRANCH_NOT_FOUND' })
  save(
    @CurrentUser() caller: AccessTokenClaims,
    @Param('branchId') branchId: string,
    @Body() body: SaveGymDto,
  ): Promise<SavedGymView> {
    return this.saveGym.execute(caller.userId, branchId, body);
  }

  @Delete(':branchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() caller: AccessTokenClaims,
    @Param('branchId') branchId: string,
  ): Promise<void> {
    await this.unsaveGym.execute(caller.userId, branchId);
  }
}
