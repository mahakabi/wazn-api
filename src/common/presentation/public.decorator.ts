import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opts a route out of the global access-token guard. Everything else requires sign-in. */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
