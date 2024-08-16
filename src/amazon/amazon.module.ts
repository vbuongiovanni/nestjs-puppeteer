import { Module } from '@nestjs/common';
import { AmazonController } from './amazon.controller';
import { AmazonService } from './amazon.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuppeteerModule } from '../common';

@Module({
  imports: [
    ConfigModule,
    PuppeteerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        puppeteerConfig: configService.get('puppeteerConfig'),
      }),
    }),
  ],
  providers: [AmazonService],
  controllers: [AmazonController],
})
export class AmazonModule {}
