import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import {
  TPuppeteerModuleOptions,
  PUPPETEER_CONFIG,
  TPuppeteerModuleAsyncOptions,
} from './types';

@Module({})
export class PuppeteerModule {
  static forRoot(options: TPuppeteerModuleOptions): DynamicModule {
    return {
      module: PuppeteerModule,
      providers: [
        {
          provide: PUPPETEER_CONFIG,
          useValue: options,
        },
        PuppeteerService,
      ],
      exports: [PuppeteerService],
    };
  }

  private static createAsyncOptionsProvider(
    options: TPuppeteerModuleAsyncOptions
  ): Provider {
    return {
      provide: PUPPETEER_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  static async forRootAsync(
    asyncOptions: TPuppeteerModuleAsyncOptions
  ): Promise<DynamicModule> {
    return {
      module: PuppeteerModule,
      imports: asyncOptions.imports,
      providers: [
        this.createAsyncOptionsProvider(asyncOptions),
        PuppeteerService,
      ],
      exports: [PuppeteerService],
    };
  }
}
