import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

const CODE_MAX_LENGTH = 16;

export class VerifyCodeDto {
  @ApiProperty({ example: 'WZ-7K42', description: 'Typed or scanned; "7k42" also works' })
  @IsString()
  @MaxLength(CODE_MAX_LENGTH)
  code!: string;
}
