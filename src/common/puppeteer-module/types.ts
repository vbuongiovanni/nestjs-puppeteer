import { ModuleMetadata } from '@nestjs/common';

export const PUPPETEER_CONFIG = 'PUPPETEER_CONFIG';

export type TLocalBrowserConfig = {
  executablePath: string;
};

export type TWebSocketBrowserConfig = {
  browserWSEndpoint: string;
};

export type TPuppeteerModuleOptions = {
  puppeteerConfig: TLocalBrowserConfig | TWebSocketBrowserConfig;
  userAgents?: string[];
  referers?: string[];
};

export interface TPuppeteerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject: any[];
  useFactory: (
    ...args: any[]
  ) => TPuppeteerModuleOptions | Promise<TPuppeteerModuleOptions>;
}
