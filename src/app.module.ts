import { Module } from '@nestjs/common';
import { ApartmentsModule } from './apartments';
import { CommonModule } from './common';
import { AmazonModule } from './amazon';

@Module({
  imports: [CommonModule, ApartmentsModule, AmazonModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
