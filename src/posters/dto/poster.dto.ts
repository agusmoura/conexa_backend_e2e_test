import { ApiProperty } from '@nestjs/swagger';

export class PosterDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  original_title: string;

  @ApiProperty()
  poster_path: string;
}