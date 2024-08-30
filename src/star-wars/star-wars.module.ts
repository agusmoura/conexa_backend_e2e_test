import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StarWarsService } from './star-wars.service';

@Module({
  imports: [HttpModule],
  providers: [StarWarsService],
  exports: [StarWarsService],
})
export class StarWarsModule {}
