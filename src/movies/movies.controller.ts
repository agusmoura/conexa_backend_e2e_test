import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { MoviesService } from '@/movies/movies.service';
import { MovieDto } from './dto/movie.dto';
import { Roles } from '@/users/roles.decorator';
import { UserRole } from '@/users/users.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/users/roles.guard';
import { Response as ExpressResponse} from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todas las películas' })
    @ApiResponse({ status: 200, description: 'Películas obtenidas exitosamente', type: [MovieDto] })
    @ApiResponse({ status: 404, description: 'No se encontraron películas' })
    async getAllMovies(@Res() res: ExpressResponse): Promise<Object> {
        const movies = await this.moviesService.findAll();
        return res.status(HttpStatus.OK).json(movies);
    }

    @Get(':title')
    @ApiOperation({ summary: 'Obtener una película por título' })
    @ApiParam({ name: 'title', type: String, description: 'Título de la película' })
    @ApiResponse({ status: 200, description: 'Película obtenida exitosamente', type: MovieDto })
    @ApiResponse({ status: 404, description: 'Película no encontrada' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER)
    async getMovieByTitle(@Param('title') title: string, @Res() res: ExpressResponse): Promise<Object> {
        try {
            const movie = await this.moviesService.findOne(title);
            return res.status(HttpStatus.OK).json(movie);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: 404,
                    message: 'Película no encontrada',
                    error: 'Not Found'
                });
            }
            throw error;
        }
    }

    @Get(':title/characters')
    @ApiOperation({ summary: 'Obtener los personajes de una película por título' })
    @ApiParam({ name: 'title', type: String, description: 'Título de la película' })
    @ApiResponse({ status: 200, description: 'Personajes obtenidos exitosamente'})
    @ApiResponse({ status: 404, description: 'Personajes no encontrados' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER)
    async getCharactersByMovieTitle(@Param('title') title: string, @Res() res: ExpressResponse): Promise<Object> {
        const characters = await this.moviesService.getCharactersByMovieTitle(title);
        return res.status(HttpStatus.OK).json(characters);
    }

    @Get(':title/planets')
    @ApiOperation({ summary: 'Obtener los planetas de una película por título' })
    @ApiParam({ name: 'title', type: String, description: 'Título de la película' })
    @ApiResponse({ status: 200, description: 'Planetas obtenidos exitosamente'})
    @ApiResponse({ status: 404, description: 'Planetas no encontrados' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER)
    async getPlanetsByMovieTitle(@Param('title') title: string, @Res() res: ExpressResponse): Promise<Object> {
        const planets = await this.moviesService.getPlanetsByMovieTitle(title);
        return res.status(HttpStatus.OK).json(planets);
    }

    @Get(':title/starships')
    @ApiOperation({ summary: 'Obtener las naves espaciales de una película por título' })
    @ApiParam({ name: 'title', type: String, description: 'Título de la película' })
    @ApiResponse({ status: 200, description: 'Naves espaciales obtenidas exitosamente'})
    @ApiResponse({ status: 404, description: 'Naves espaciales no encontradas' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER)
    async getStarshipsByMovieTitle(@Param('title') title: string, @Res() res: ExpressResponse): Promise<Object> {
        const starships = await this.moviesService.getStarshipsByMovieTitle(title);
        return res.status(HttpStatus.OK).json(starships);
    }

    @Post('sync')
    @ApiOperation({ summary: 'Sincronizar el listado de películas - (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Listado de películas sincronizado exitosamente' })
    @ApiResponse({ status: 400, description: 'Error en la sincronización del listado de películas' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async syncMovies(@Res() res: ExpressResponse): Promise<Object> {
        await this.moviesService.syncMoviesList();
        return res.status(HttpStatus.OK).json({ message: 'Listado de películas sincronizado exitosamente' });
    }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva película - (ADMIN)' })
    @ApiBody({ type: MovieDto })
    @ApiResponse({ status: 201, description: 'Película creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Error en la creación de la película' })
    @ApiResponse({ status: 409, description: 'Ya existe una película con este título' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async createMovie(@Body() movie: MovieDto, @Res() res: ExpressResponse): Promise<Object> {
        const movieCreated = await this.moviesService.create(movie);
        return res.status(HttpStatus.CREATED).json(movieCreated);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una película existente - (ADMIN)' })
    @ApiBody({ type: MovieDto })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la película' })
    @ApiResponse({ status: 200, description: 'Película actualizada exitosamente' })
    @ApiResponse({ status: 400, description: 'Error en la actualización de la película' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateMovie(@Param('id') id: number, @Body() movie: MovieDto, @Res() res: ExpressResponse): Promise<Object> {
        const movieUpdated = await this.moviesService.update(id, movie);
        return res.status(HttpStatus.OK).json(movieUpdated);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una película - (ADMIN)' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la película' })
    @ApiResponse({ status: 200, description: 'Película eliminada exitosamente' })
    @ApiResponse({ status: 400, description: 'Error en la eliminación de la película' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteMovie(@Param('id') id: number, @Res() res: ExpressResponse): Promise<Object> {
        await this.moviesService.delete(id);
        return res.status(HttpStatus.NO_CONTENT).send();
    }
}

