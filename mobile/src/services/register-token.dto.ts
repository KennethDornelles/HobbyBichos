import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterTokenDto {
  @ApiProperty({
    description: 'Token de push notification (Expo Push Token)',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Tipo do dispositivo (android/ios)',
    example: 'android',
  })
  @IsString()
  @IsNotEmpty()
  deviceType: string;
}