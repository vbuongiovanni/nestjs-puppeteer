import { Injectable } from '@nestjs/common';
import { Browser } from 'puppeteer-core';
import { PuppeteerService } from '../common';

type TProductInfo = {
  price: string;
  url: string;
  title: string;
};

@Injectable()
export class AmazonService {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  async getProducts(product: string) {
    let browser: Browser;
    let results: TProductInfo[] = [];

    try {
      browser = await this.puppeteerService.getBrowser();

      const page = await this.puppeteerService.getPage(
        browser,
        'https://www.amazon.com'
      );

      await this.puppeteerService.typeInput(
        page,
        '#twotabsearchtextbox',
        product
      );
      await this.puppeteerService.clickElement(
        page,
        '#nav-search-submit-button'
      );

      const extractionCallback = (elements: Element[]) => {
        return elements.map((element) => {
          const url = element.querySelector('a').href;
          const title = element.querySelector(
            '.s-title-instructions-style span'
          )?.textContent;
          const price = element.querySelector(
            '.a-price .a-offscreen'
          )?.textContent;
          return { url, title, price };
        });
      };

      results = await this.puppeteerService.scrape<TProductInfo[]>(
        page,
        '.s-card-container',
        extractionCallback
      );
    } catch (ex) {
      console.log('Error getting browser', ex);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return results;
  }
}
