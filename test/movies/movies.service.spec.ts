import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '@/movies/movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '@/movies/movies.entity';
import { StarWarsService } from '@/star-wars/star-wars.service';
import { PostersService } from '@/posters/posters.service';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('MoviesService', () => {
    let service: MoviesService;
    let movieRepository: Repository<Movie>;
    let starWarsService: StarWarsService;
    let postersService: PostersService;

    const mockMovies: Movie[] = [{
        id: 1,
        title: 'Test Movie',
        episode_id: 1,
        opening_crawl: 'Test crawl',
        director: 'Test Director',
        producer: 'Test Producer',
        release_date: new Date('2023-01-01'),
        url: 'https://swapi.dev/api/films/1/',
        characters: ['https://swapi.dev/api/people/1/', 'https://swapi.dev/api/people/2/'],
        planets: ['https://swapi.dev/api/planets/1/', 'https://swapi.dev/api/planets/2/'],
        starships: ['https://swapi.dev/api/starships/1/', 'https://swapi.dev/api/starships/2/'],
        vehicles: ['https://swapi.dev/api/vehicles/1/', 'https://swapi.dev/api/vehicles/2/'],
        species: ['https://swapi.dev/api/species/1/', 'https://swapi.dev/api/species/2/'],
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-01T00:00:00Z'),
        deleted_at: null,
        poster: 'https://example.com/poster.jpg'
    }];

    const mockMovie: Movie = {
        id: 2,
        title: 'Single Test Movie',
        episode_id: 2,
        opening_crawl: 'Single test crawl',
        director: 'Single Test Director',
        producer: 'Single Test Producer',
        release_date: new Date('2023-02-01'),
        url: 'https://swapi.dev/api/films/2/',
        characters: ['https://swapi.dev/api/people/3/', 'https://swapi.dev/api/people/4/'],
        planets: ['https://swapi.dev/api/planets/3/', 'https://swapi.dev/api/planets/4/'],
        starships: ['https://swapi.dev/api/starships/3/', 'https://swapi.dev/api/starships/4/'],
        vehicles: ['https://swapi.dev/api/vehicles/3/', 'https://swapi.dev/api/vehicles/4/'],
        species: ['https://swapi.dev/api/species/3/', 'https://swapi.dev/api/species/4/'],
        created_at: new Date('2023-02-01T00:00:00Z'),
        updated_at: new Date('2023-02-01T00:00:00Z'),
        deleted_at: null,
        poster: 'https://example.com/single_poster.jpg'
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MoviesService,
                {
                    provide: getRepositoryToken(Movie),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                        preload: jest.fn(), // Añadir esta línea
                    },
                },
                {
                    provide: StarWarsService,
                    useValue: {
                        getStarWarsMovies: jest.fn(),
                    },
                },
                {
                    provide: PostersService,
                    useValue: {
                        getPosterByTitle: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MoviesService>(MoviesService);
        movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
        starWarsService = module.get<StarWarsService>(StarWarsService);
        postersService = module.get<PostersService>(PostersService);
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('debería devolver un array de películas', async () => {
            jest.spyOn(movieRepository, 'find').mockResolvedValue(mockMovies);

            const result = await service.findAll();
            expect(result).toEqual({
                message: 'Películas obtenidas exitosamente',
                data: mockMovies,
            });
        });

        it('debería devolver un error 404 si no hay películas', async () => {
            jest.spyOn(movieRepository, 'find').mockResolvedValue([]);

            await expect(service.findAll()).rejects.toThrow(NotFoundException);
            await expect(service.findAll()).rejects.toThrowError('No se encontraron películas');
        });
    });

    describe('findOne', () => {
        it('debería devolver una película por título', async () => {
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(mockMovies[0]);

            const result = await service.findOne('Test Movie');
            expect(result).toEqual({
                message: 'Película obtenida exitosamente',
                data: mockMovies[0],
            });
        });

        it('debería lanzar NotFoundException si la película no existe', async () => {
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne('Nonexistent Movie')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('debería crear una nueva película', async () => {
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(movieRepository, 'create').mockReturnValue(mockMovie);
            jest.spyOn(movieRepository, 'save').mockResolvedValue(mockMovie);

            const result = await service.create(mockMovie);
            expect(result).toEqual({
                message: 'Película creada exitosamente',
                data: mockMovie,
            });
        });

        it('debería lanzar ConflictException si la película ya existe', async () => {
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue({ id: 1, title: 'Existing Movie' } as Movie);
            jest.spyOn(movieRepository, 'create').mockReturnValue({ title: 'Existing Movie' } as Movie);

            await expect(service.create({ title: 'Existing Movie' } as Movie)).rejects.toThrow(ConflictException);
        });
    });

    describe('update', () => {
        it('debería actualizar una película existente', async () => {
            const updatedMovie = { ...mockMovie, title: 'Updated Movie' };
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(mockMovie);
            jest.spyOn(movieRepository, 'preload').mockResolvedValue(updatedMovie);
            jest.spyOn(movieRepository, 'save').mockResolvedValue(updatedMovie);

            const result = await service.update(2, updatedMovie);
            expect(result).toEqual({
                message: 'Película actualizada exitosamente',
                data: updatedMovie,
            });
        });

        it('debería lanzar NotFoundException si la película no existe', async () => {
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

            await expect(service.update(999, {} as Movie)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('debería eliminar una película existente', async () => {
            const mockMovie: Movie = { id: 1, title: 'Movie to Delete' } as Movie;
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(mockMovie);
            jest.spyOn(movieRepository, 'remove').mockResolvedValue(mockMovie);

            await service.delete(1);
            expect(movieRepository.remove).toHaveBeenCalledWith(mockMovie);
        });

        it('debería lanzar NotFoundException si la película no existe', async () => {
            jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('syncMoviesList', () => {
        it('debería sincronizar la lista de películas', async () => {
            const mockStarWarsMovies = [{ title: 'Star Wars Movie' }];
            jest.spyOn(starWarsService, 'getStarWarsMovies').mockResolvedValue(mockStarWarsMovies);
            jest.spyOn(postersService, 'getPosterByTitle').mockResolvedValue('poster-url');
            jest.spyOn(movieRepository, 'save').mockResolvedValue({} as Movie);

            await service.syncMoviesList();
            expect(starWarsService.getStarWarsMovies).toHaveBeenCalled();
            expect(postersService.getPosterByTitle).toHaveBeenCalled();
            expect(movieRepository.save).toHaveBeenCalled();
        });
    });
});