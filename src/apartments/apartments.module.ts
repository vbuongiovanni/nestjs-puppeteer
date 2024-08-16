import { Module } from '@nestjs/common';
import { ApartmentsController } from './apartments.controller';
import { ApartmentsService } from './apartments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuppeteerModule } from '../common/puppeteer-module';

@Module({
  imports: [
    ConfigModule,
    // PuppeteerModule.forRoot({
    //   puppeteerConfig: { executablePath: process.env.CHROME_EXECUTABLE_PATH },
    //   puppeteerConfig: { executablePath: process.env.SBR_WS_ENDPOINT },
    // }),
    PuppeteerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        puppeteerConfig: configService.get('puppeteerConfig'),
      }),
    }),
  ],
  providers: [ApartmentsService],
  controllers: [ApartmentsController],
})
export class ApartmentsModule {}
