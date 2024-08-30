import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PosterDto } from './dto/poster.dto';

@Injectable()
export class PostersService {
    private readonly baseUrl = 'https://api.themoviedb.org/3';
    private readonly apiKey = process.env.POSTER_API_KEY;
    private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    async getPosterByTitle(title: string): Promise<string> {
        const response = await axios.get(`${this.baseUrl}/search/movie`, {
            params: {
                api_key: this.apiKey,
                query: title,
            },
        });
        const movie = response.data.results.find((poster: PosterDto) => poster.title.toLowerCase() === title.toLowerCase() || poster.original_title.toLowerCase() === title.toLowerCase());
        if (movie?.poster_path === null) {
            return null;
        }
        const composedPosterPath = `${this.imageBaseUrl}/${movie?.poster_path}`;
        return movie ? composedPosterPath : null;
    }

}
