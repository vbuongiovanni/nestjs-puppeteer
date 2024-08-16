import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../common';
import { Browser } from 'puppeteer-core';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

type TStateZipCodes = { zipcode: string; url: string };

type TApartmentInfo = {
  url: string;
  propertyName: string;
  address: string;
  cityStateZipcode: string;
  priceRange: string;
  bedsRange: string;
  phone: string;
};

type TSummaryDetail = {
  monthlyRentRange: string;
  bedsRange: string;
  bathsRange: string;
  sqftRange: string;
};

type TApartmentDetail = {
  propertyName: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  summaryDetail: TSummaryDetail;
  apartmentFeatures: string[];
  communityFeatures: string[];
};

@Injectable()
export class ApartmentsService {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  async getStateZipCodes(state: string) {
    let browser: Browser;
    let results: TStateZipCodes[] = [];

    try {
      browser = await this.puppeteerService.getBrowser();

      const page = await this.puppeteerService.getPage(
        browser,
        `https://www.apartments.com/sitemap/${state}/zip-codes/`
      );

      const extractionCallback = (elements: Element[]) => {
        return elements.map((element) => {
          const url = element.querySelector('a').href;
          const zipcode = element
            .querySelector('a')
            .textContent.replace(/\D/g, '');

          return { url, zipcode };
        });
      };

      results = await this.puppeteerService.scrape<TStateZipCodes[]>(
        page,
        '.linkGrid ul li.zip',
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

  async getApartments(location: string) {
    let browser: Browser;
    let results: TApartmentInfo[] = [];

    try {
      browser = await this.puppeteerService.getBrowser();

      // 3.23 mbs w/ stuff removed
      const page = await this.puppeteerService.getPage(
        browser,
        `https://www.apartments.com/${location}`
      );

      const pageCountExtractionCallback = (elements: Element[]) => {
        return elements.map((_, i) => i);
      };

      const numPages = await this.puppeteerService.scrape<string>(
        page,
        'nav#paging ol',
        pageCountExtractionCallback
      );

      let currentPage = 1;
      const finalPage = numPages.length;

      const extractionCallback = (elements: Element[]) => {
        return elements.map((element) => {
          const url = element.getAttribute('data-url') || 'N/A';
          const address = element.getAttribute('data-streetaddress') || 'N/A';

          const propertyName =
            element.querySelector('.property-title span.title')?.textContent ||
            element.querySelector('.property-title')?.getAttribute('title') ||
            'N/A';

          const cityStateZipcode =
            element
              .querySelector('.property-address')
              ?.textContent.replace(address, '')
              .replace(/, /, '') || 'N/A';

          const priceRange =
            element.querySelector('.property-pricing')?.textContent ||
            element
              .querySelector('.price-range')
              ?.textContent?.replace(/^\s*|\s*$|\\n/g, '') ||
            'N/A';

          const bedsRange =
            element.querySelector('.property-beds')?.textContent ||
            element
              .querySelector('.bed-range')
              ?.textContent?.replace(/^\s*|\s*$|\\n/g, '') ||
            'N/A';

          const phone =
            element.querySelector('.property-actions .phone-link span')
              ?.textContent || 'N/A';

          return {
            url,
            propertyName,
            address,
            cityStateZipcode,
            priceRange,
            bedsRange,
            phone,
          };
        });
      };

      results = await this.puppeteerService.scrape<TApartmentInfo[]>(
        page,
        '#placardContainer ul li article',
        extractionCallback
      );

      while (currentPage < finalPage) {
        const targetPage = currentPage + 1;
        // await delay(15000);
        await this.puppeteerService.clickElement(
          page,
          `a[data-page="${targetPage}"]`
        );
        const pageNResults = await this.puppeteerService.scrape<
          TApartmentInfo[]
        >(page, '#placardContainer ul li article', extractionCallback);

        // await delay(10000);
        results = [...results, ...pageNResults];
        currentPage++;
      }
    } catch (ex) {
      console.log('Error getting browser', ex);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return results;
  }

  async getApartmentDetails(apartmentEndpoint: string) {
    let browser: Browser;
    let results: Partial<TApartmentDetail> = {};

    try {
      browser = await this.puppeteerService.getBrowser();

      const page = await this.puppeteerService.getPage(
        browser,
        `https://www.apartments.com/${apartmentEndpoint}`
      );

      const textContentExtraction = (elements: Element[]) => {
        return elements.map((element) => element.textContent || 'N/A');
      };

      const summaryDetailExtractionCallback = (elements: Element[]) => {
        const summaryDetail: TSummaryDetail = {
          monthlyRentRange: 'N/A',
          bedsRange: 'N/A',
          bathsRange: 'N/A',
          sqftRange: 'N/A',
        };
        elements.forEach((element) => {
          const key =
            element.querySelector('div p.rentInfoLabel')?.textContent || 'N/A';
          const value =
            element.querySelector('div p.rentInfoDetail')?.textContent || 'N/A';
          if (key === 'Monthly Rent') {
            summaryDetail.monthlyRentRange = value;
          } else if (key === 'Bedrooms') {
            summaryDetail.bedsRange = value;
          } else if (key === 'Bathrooms') {
            summaryDetail.bathsRange = value;
          } else if (key === 'Square Feet') {
            summaryDetail.sqftRange = value;
          }
        });
        return summaryDetail;
      };

      const [
        [phone],
        [propertyName],
        [address],
        [county],
        [city],
        uniqueFeatures,
        apartmentFeatures,
        communityFeatures,
        summaryDetail,
      ] = await Promise.all([
        this.puppeteerService.scrape<string>(
          page,
          'span.phoneNumber',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string>(
          page,
          'div.propertyNameRow > h1.propertyName',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string>(
          page,
          'span.delivery-address',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string>(
          page,
          '#breadcrumbs-container span a[data-type="county"]',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string>(
          page,
          '#breadcrumbs-container span a[data-type="city"]',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string[]>(
          page,
          'li.uniqueAmenity span',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string[]>(
          page,
          'ul.combinedAmenitiesList li span',
          textContentExtraction
        ),
        this.puppeteerService.scrape<string[]>(
          page,
          'div.amenityCard p.amenityLabel',
          textContentExtraction
        ),
        this.puppeteerService.scrape<TSummaryDetail>(
          page,
          'ul.priceBedRangeInfo li.column',
          summaryDetailExtractionCallback
        ),
      ]);

      results.phone = phone;
      results.propertyName =
        propertyName?.replace(/^\s*|\s*$|\\n/g, '') || 'N/A';
      results.address = address;
      results.county = county;
      results.city = city;

      results.apartmentFeatures = [
        ...uniqueFeatures,
        ...apartmentFeatures,
      ].filter((feature) => !communityFeatures.includes(feature));

      results.communityFeatures = communityFeatures;
      results.summaryDetail = summaryDetail;
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
