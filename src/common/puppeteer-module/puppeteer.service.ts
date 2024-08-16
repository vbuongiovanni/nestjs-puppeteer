import { Inject, Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import {
  TPuppeteerModuleOptions,
  TLocalBrowserConfig,
  TWebSocketBrowserConfig,
} from './types';
import { REFERERS, USER_AGENTS } from './constants';

@Injectable()
export class PuppeteerService {
  constructor(
    @Inject('PUPPETEER_CONFIG')
    private puppeteerOptions: TPuppeteerModuleOptions
  ) {}

  referer = this.getRandomItemFromArray(
    this.puppeteerOptions.referers || REFERERS
  );

  userAgent = this.getRandomItemFromArray(
    this.puppeteerOptions.userAgents || USER_AGENTS
  );

  getRandomItemFromArray(items: string[]) {
    return items[Math.floor(Math.random() * items.length)];
  }

  async getBrowser(isHeadless = true) {
    const puppeteerConfig = this.puppeteerOptions.puppeteerConfig;
    if (puppeteerConfig['executablePath']) {
      const typedConfig = puppeteerConfig as TLocalBrowserConfig;
      return await puppeteer.launch({
        ...typedConfig,
        headless: isHeadless,
      });
    } else {
      const typedConfig = puppeteerConfig as TWebSocketBrowserConfig;
      return await puppeteer.connect({
        ...typedConfig,
      });
    }
  }

  async getPage(
    browser: Browser,
    url: string,
    options = {
      blockImages: true,
      blockCss: true,
      referer: this.referer,
      userAgent: this.userAgent,
    }
  ) {
    const page = await browser.newPage();
    await page.setUserAgent(options.userAgent);
    page.setExtraHTTPHeaders({ referer: options.referer });
    if (Object.values(options).includes(true)) {
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' && options.blockImages) {
          req.abort();
        } else if (resourceType === 'stylesheet' && options.blockImages) {
          req.abort();
        } else if (resourceType === 'font' && options.blockImages) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }
    page.setDefaultTimeout(2 * 60 * 1000);
    // await delay(10000);
    await Promise.all([page.waitForNavigation(), page.goto(url)]);
    await page.setViewport({ width: 1920, height: 1080 });

    return page;
  }

  async typeInput(page: Page, selector: string, value: string) {
    await page.waitForSelector(selector);
    await page.type(selector, value);
  }

  async clickElement(page: Page, selector: string) {
    await page.waitForSelector(selector);
    await Promise.all([page.waitForNavigation(), page.click(selector)]);
  }

  async scrape<T>(
    page: Page,
    selector: string | string[],
    scapeCallback: (elements: Element[]) => unknown
  ) {
    const selectorString = Array.isArray(selector)
      ? selector.join(' ')
      : selector;

    return (await page.$$eval(selectorString, scapeCallback)) as T;
  }
}
