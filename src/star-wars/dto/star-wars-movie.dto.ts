import { ApiProperty } from '@nestjs/swagger';

export class StarWarsMovieDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  episode_id: number;

  @ApiProperty()
  opening_crawl: string;

  @ApiProperty()
  director: string;

  @ApiProperty()
  producer: string;

  @ApiProperty()
  release_date: Date;

  @ApiProperty()
  url: string;

  @ApiProperty({ type: [String] })
  characters: string[];

  @ApiProperty({ type: [String] })
  planets: string[];

  @ApiProperty({ type: [String] })
  starships: string[];

  @ApiProperty({ type: [String] })
  vehicles: string[];

  @ApiProperty({ type: [String] })
  species: string[];
}