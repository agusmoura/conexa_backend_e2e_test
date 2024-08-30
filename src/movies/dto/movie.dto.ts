import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional, IsArray } from 'class-validator';

export class MovieDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'El id no puede estar vacío' })
    @IsNumber({}, { message: 'id debe ser un número' })
    id: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @IsString({ message: 'El título debe ser una cadena de texto' })
    title: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'El episode_id no puede estar vacío' })
    @IsNumber({}, { message: 'episode_id debe ser un número' })
    episode_id: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'El opening_crawl no puede estar vacío' })
    @IsString({ message: 'El opening_crawl debe ser una cadena de texto' })
    opening_crawl: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'El director no puede estar vacío' })
    @IsString({ message: 'El director debe ser una cadena de texto' })
    director: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'El productor no puede estar vacío' })
    @IsString({ message: 'El productor debe ser una cadena de texto' })
    producer: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'La fecha de lanzamiento no puede estar vacía' })
    @IsDate({ message: 'La fecha de lanzamiento debe ser una fecha válida' })
    release_date: Date;

    @ApiProperty()
    @IsNotEmpty({ message: 'La url no puede estar vacía' })
    @IsString({ message: 'La url debe ser una cadena de texto' })
    url: string;

    @ApiProperty({ nullable: true })
    @IsOptional({ message: 'El poster puede estar vacío' })
    @IsString({ message: 'El poster debe ser una cadena de texto' })
    poster: string;

    @ApiProperty({ type: [String], nullable: true })
    @IsNotEmpty({ message: 'Los personajes no pueden estar vacíos' })
    @IsArray({ message: 'Los personajes deben ser un array de cadenas de texto' })
    characters: string[];

    @ApiProperty({ type: [String], nullable: true })
    @IsNotEmpty({ message: 'Los planetas no pueden estar vacíos' })
    @IsArray({ message: 'Los planetas deben ser un array de cadenas de texto' })
    planets: string[];

    @ApiProperty({ type: [String], nullable: true })
    @IsNotEmpty({ message: 'Las naves espaciales no pueden estar vacías' })
    @IsArray({ message: 'Las naves espaciales deben ser un array de cadenas de texto' })
    starships: string[];

    @ApiProperty({ type: [String], nullable: true })
    @IsNotEmpty({ message: 'Los vehículos no pueden estar vacíos' })
    @IsArray({ message: 'Los vehículos deben ser un array de cadenas de texto' })
    vehicles: string[];

    @ApiProperty({ type: [String], nullable: true })
    @IsNotEmpty({ message: 'Las especies no pueden estar vacías' })
    @IsArray({ message: 'Las especies deben ser un array de cadenas de texto' })
    species: string[];

    @ApiProperty()
    @IsNotEmpty({ message: 'La fecha de creación no puede estar vacía' })
    @IsDate({ message: 'La fecha de creación debe ser una fecha válida' })
    created_at: Date;

    @ApiProperty({ nullable: true })
    @IsOptional({ message: 'La fecha de actualización puede estar vacía' })
    @IsDate({ message: 'La fecha de actualización debe ser una fecha válida' })
    updated_at: Date;

    @ApiProperty({ nullable: true })
    @IsOptional({ message: 'La fecha de eliminación puede estar vacía' })
    @IsDate({ message: 'La fecha de eliminación debe ser una fecha válida' })
    deleted_at: Date;
}