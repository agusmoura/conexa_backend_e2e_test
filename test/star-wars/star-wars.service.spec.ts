import { Test, TestingModule } from '@nestjs/testing';
import { StarWarsService } from '@/star-wars/star-wars.service';
import { HttpService } from '@nestjs/axios';

describe('StarWarsService', () => {
  let service: StarWarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarWarsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StarWarsService>(StarWarsService);
  });

  describe('getStarWarsMovies', () => {
    it('debería devolver un array de películas de Star Wars', async () => {
      const mockMovies = [
        { title: 'Episode I - The Phantom Menace', episode_id: 1, opening_crawl: 'A long time ago in a galaxy far, far away...', director: 'George Lucas', producer: 'Rick McCallum', release_date: '1999-05-19', url: 'https://swapi.dev/api/films/1/' },
        { title: 'Episode II - Attack of the Clones', episode_id: 2, opening_crawl: 'Turmoil has engulfed the Galactic Republic. The taxation of trade routes to outlying star systems is in dispute.', director: 'George Lucas', producer: 'Rick McCallum', release_date: '2002-05-16', url: 'https://swapi.dev/api/films/2/' },
        { title: 'Episode III - Revenge of the Sith', episode_id: 3, opening_crawl: 'War! The Republic is crumbling under attacks by the ruthless Sith Lord, Count Dooku. There are heroes on both sides. Evil is everywhere.', director: 'George Lucas', producer: 'Rick McCallum', release_date: '2005-05-19', url: 'https://swapi.dev/api/films/3/' },
      ];
      jest.spyOn(service, 'getStarWarsMovies').mockResolvedValue(mockMovies);

      const movies = await service.getStarWarsMovies();
      expect(movies).toEqual(mockMovies);
    });

    it('debería lanzar un error si la obtención falla', async () => {
      jest.spyOn(service, 'getStarWarsMovies').mockRejectedValue(new Error('Failed to fetch movies'));

      await expect(service.getStarWarsMovies()).rejects.toThrow('Failed to fetch movies');
    });
  });
});




