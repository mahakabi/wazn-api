import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigService } from '../../config/app-config.service';
import { AuthenticateRequestUseCase } from './application/authenticate-request.use-case';
import { GetCurrentUserUseCase } from './application/get-current-user.use-case';
import { RefreshSessionUseCase } from './application/refresh-session.use-case';
import { RequestOtpUseCase } from './application/request-otp.use-case';
import { SessionIssuer } from './application/session-issuer';
import { SignOutUseCase } from './application/sign-out.use-case';
import { UpdateProfileUseCase } from './application/update-profile.use-case';
import { VerifyOtpUseCase } from './application/verify-otp.use-case';
import { ACCESS_TOKEN_SERVICE } from './domain/ports/access-token-service';
import { OPAQUE_TOKEN_GENERATOR } from './domain/ports/opaque-token-generator';
import { OTP_CODEC } from './domain/ports/otp-codec';
import { OTP_REQUEST_LIMITER } from './domain/ports/otp-request-limiter';
import { OTP_STORE } from './domain/ports/otp-store';
import { REFRESH_TOKEN_REPOSITORY } from './domain/ports/refresh-token-repository';
import { USER_REPOSITORY } from './domain/ports/user-repository';
import { HmacOpaqueTokenGenerator } from './infrastructure/hmac-opaque-token.generator';
import { HmacOtpCodec } from './infrastructure/hmac-otp.codec';
import { JwtAccessTokenService } from './infrastructure/jwt-access-token.service';
import { PrismaRefreshTokenRepository } from './infrastructure/prisma-refresh-token.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { RedisOtpRequestLimiter } from './infrastructure/redis-otp-request.limiter';
import { RedisOtpStore } from './infrastructure/redis-otp.store';
import { AccessTokenGuard } from './presentation/access-token.guard';
import { AUTH_THROTTLE } from './presentation/auth-throttle';
import { AuthController } from './presentation/auth.controller';
import { MeController } from './presentation/me.controller';
import { RolesGuard } from './presentation/roles.guard';

const JWT_ISSUER = 'wazn-api';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { algorithm: 'HS256', issuer: JWT_ISSUER },
        verifyOptions: { algorithms: ['HS256'], issuer: JWT_ISSUER },
      }),
    }),
    ThrottlerModule.forRoot([AUTH_THROTTLE]),
  ],
  controllers: [AuthController, MeController],
  providers: [
    // Application
    RequestOtpUseCase,
    VerifyOtpUseCase,
    RefreshSessionUseCase,
    SignOutUseCase,
    GetCurrentUserUseCase,
    UpdateProfileUseCase,
    AuthenticateRequestUseCase,
    SessionIssuer,
    // Ports → adapters
    { provide: OTP_STORE, useClass: RedisOtpStore },
    { provide: OTP_REQUEST_LIMITER, useClass: RedisOtpRequestLimiter },
    { provide: OTP_CODEC, useClass: HmacOtpCodec },
    { provide: OPAQUE_TOKEN_GENERATOR, useClass: HmacOpaqueTokenGenerator },
    { provide: ACCESS_TOKEN_SERVICE, useClass: JwtAccessTokenService },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: PrismaRefreshTokenRepository },
    // Every route requires a valid access token unless marked @Public(); then @Roles() is checked.
    // APP_GUARDs run in registration order.
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
