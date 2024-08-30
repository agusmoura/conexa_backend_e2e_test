import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { StarWarsModule } from '@/star-wars/star-wars.module';
import { PostersService } from '@/posters/posters.service';
import { Movie } from './movies.entity';
import { HttpModule } from '@nestjs/axios';
import { MoviesController } from './movies.controller';
import { StarWarsService } from '@/star-wars/star-wars.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Movie]),
        HttpModule,
        StarWarsModule,
    ],
    controllers: [MoviesController],
    providers: [MoviesService, StarWarsService, PostersService],
    exports: [MoviesService],
})
export class MoviesModule {}