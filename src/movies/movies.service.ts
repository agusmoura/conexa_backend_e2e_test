import { Injectable, NotFoundException , BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies.entity';
import { MovieDto } from './dto/movie.dto';
import { StarWarsService } from '@/star-wars/star-wars.service';
import { StarWarsMovieDto } from '@/star-wars/dto/star-wars-movie.dto';
import { PostersService } from '@/posters/posters.service';
import { Cron } from '@nestjs/schedule';
import { validate } from 'class-validator';

@Injectable()
export class MoviesService {
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        private readonly starWarsService: StarWarsService,
        private readonly postersService: PostersService,
    ) {}

    async findAll(): Promise<Object> {
        const movies = await this.movieRepository.find();
        if (movies.length === 0) {
            throw new NotFoundException('No se encontraron películas');
        }
        return {
            message: 'Películas obtenidas exitosamente',
            data: movies.map(movie => this.toDto(movie)),
        }
    }

    async findOne(title: string): Promise<Object> {
        const movie = await this.movieRepository.findOne({ where: { title } });
        if (!movie) {
            throw new NotFoundException('Película no encontrada');
        }
        return {
            message: 'Película obtenida exitosamente',
            data: this.toDto(movie),
        }
    }

    async getCharactersByMovieTitle(title: string): Promise<Object> {
        const movie = await this.movieRepository.findOne({ where: { title } });
        if (!movie) {
            throw new NotFoundException('Película no encontrada');
        }
      
        if (movie.characters.length === 0) {
            throw new NotFoundException('No se encontraron personajes para esta película');
        }

        return {
            message: 'Personajes obtenidos exitosamente',
            data: movie.characters,
        }
    }

    async getPlanetsByMovieTitle(title: string): Promise<Object> {
        const movie = await this.movieRepository.findOne({ where: { title } });
        if (!movie) {
            throw new NotFoundException('Película no encontrada');
        }

        if (movie.planets.length === 0) {
            throw new NotFoundException('No se encontraron planetas para esta película');
        }

        return {
            message: 'Planetas obtenidos exitosamente',
            data: movie.planets,
        }
    }

    async getStarshipsByMovieTitle(title: string): Promise<Object> {
        const movie = await this.movieRepository.findOne({ where: { title } });
        if (!movie) {
            throw new NotFoundException('Película no encontrada');
        }

        if (movie.starships.length === 0) {
            throw new NotFoundException('No se encontraron naves espaciales para esta película');
        }

        return {
            message: 'Naves espaciales obtenidas exitosamente',
            data: movie.starships,
        }
    }

    async create(movieDto: MovieDto): Promise<Object> {
        const movie = this.movieRepository.create(movieDto);
    
        const errors = await validate(movie);
        if (errors.length > 0) {
          const errorMessages = errors.map(error => Object.values(error.constraints)).flat();
          throw new BadRequestException(errorMessages);
        }
    
        try {
        const savedMovie = await this.movieRepository.save(movie);
        return {
            message: 'Película creada exitosamente',
            data: this.toDto(savedMovie),
        }
        } catch (error) {
          throw new BadRequestException('Error al crear la película: ' + error.message);
        }
      }

    async update(id: number, movieDto: MovieDto): Promise<Object> {
        const movie = await this.movieRepository.preload({ id, ...this.toEntity(movieDto) });
        if (!movie) {
            throw new NotFoundException('Película no encontrada');
        }
        const updatedMovie = await this.movieRepository.save(movie);

        const errors = await validate(updatedMovie);
        if (errors.length > 0) {
          const errorMessages = errors.map(error => Object.values(error.constraints)).flat();
          throw new BadRequestException(errorMessages);
        }

        return {
            message: 'Película actualizada exitosamente',
            data: this.toDto(updatedMovie),
        }
    }

    async delete(id: number): Promise<Object> {
        const movie = await this.movieRepository.findOne({ where: { id } });
        if (!movie) {
            throw new NotFoundException('Película no encontrada');
        }

        await this.movieRepository.remove(movie);
        return {
            message: 'Película eliminada exitosamente',
        }
    }
    
    async syncMoviesList() {
        const starWarsMovies = await this.starWarsService.getStarWarsMovies();
        await this.updateMoviesList(starWarsMovies);
        return {
            message: 'Listado de películas sincronizado exitosamente',
        }
    }

    async updateMoviesList(movies: StarWarsMovieDto[]) {
        const moviesData = await Promise.all(movies.map(async (movie: StarWarsMovieDto) => {
            const poster = await this.postersService.getPosterByTitle(movie.title);
            return {
                title: movie.title,
                episode_id: movie.episode_id,
                opening_crawl: movie.opening_crawl,
                director: movie.director,
                producer: movie.producer,
                release_date: movie.release_date,
                url: movie.url,
                characters: movie.characters,
                planets: movie.planets,
                starships: movie.starships,
                vehicles: movie.vehicles,
                species: movie.species,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                poster: poster,
            };
        }));

        await this.movieRepository.save(moviesData);
    }

    @Cron('0 0 * * *') // Ejecuta el cron cada día a las 00:00
    async handleCron() {
        const movies = await this.starWarsService.getStarWarsMovies();
        await this.updateMoviesList(movies);
    }

    private toDto(movie: Movie): MovieDto {
        return {
            id: movie.id,
            title: movie.title,
            episode_id: movie.episode_id,
            opening_crawl: movie.opening_crawl,
            director: movie.director,
            producer: movie.producer,
            release_date: movie.release_date,
            url: movie.url,
            poster: movie.poster,
            characters: movie.characters,
            planets: movie.planets,
            starships: movie.starships,
            vehicles: movie.vehicles,
            species: movie.species,
            created_at: movie.created_at,
            updated_at: movie.updated_at,
            deleted_at: movie.deleted_at,
        };
    }

    private toEntity(movieDto: MovieDto): Movie {
        const movie = new Movie();
        Object.assign(movie, movieDto);
        return movie;
    }
}
