import { Injectable, InternalServerErrorException} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
@Injectable()
export class StarWarsService  {
  constructor(private readonly httpService: HttpService) {}

  async getStarWarsMovies() {
    try {
      const response = await axios.get('https://swapi.dev/api/films/'); 
      return response.data.results; 
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las películas de Star Wars');
    }
  }


}