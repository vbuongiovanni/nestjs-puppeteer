import { Controller, Get, Query } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';

@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get('')
  getApartments(@Query('location') location: string) {
    return this.apartmentsService.getApartments(location);
  }

  @Get('zipcode')
  getStateZipCodes(@Query('state') state: string) {
    return this.apartmentsService.getStateZipCodes(state);
  }

  @Get('detail')
  getApartmentDetails(@Query('target') target: string) {
    return this.apartmentsService.getApartmentDetails(target);
  }
}
