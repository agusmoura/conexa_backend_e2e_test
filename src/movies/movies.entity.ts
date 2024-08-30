import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    episode_id: number;

    @Column('text')
    opening_crawl: string;

    @Column()
    director: string;

    @Column()
    producer: string;

    @Column()
    release_date: Date;

    @Column()
    url: string;

    @Column({ nullable: true })
    poster: string;

    @Column('simple-array', { nullable: true })
    characters: string[];

    @Column('simple-array', { nullable: true })
    planets: string[];

    @Column('simple-array', { nullable: true })
    starships: string[];

    @Column('simple-array', { nullable: true })
    vehicles: string[];

    @Column('simple-array', { nullable: true })
    species: string[];

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;

    @Column({ nullable: true })
    deleted_at: Date;
}