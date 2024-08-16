import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SBR_WS_ENDPOINT: Joi.string().required(),
        CHROME_EXECUTABLE_PATH: Joi.string().required(),
        NODE_ENV: Joi.string().default('development'),
      }),
      envFilePath: ['.env'],
      cache: true,
      load: [appConfig],
    }),
  ],
  providers: [],
  exports: [ConfigModule],
})
export class CommonModule {}
