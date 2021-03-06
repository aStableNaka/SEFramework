import {Noise2D} from "open-simplex-noise";
import {BlockData} from "../blocks/Block";
import { regHub } from "../../registry/RegistryHub";
import { BlockRegistry } from "../../registry/BlockRegistry";
import { Vector3 } from "three";

// Mapping [-1, 1]
export enum NOISE_GENERATOR_LABELS{
	TERRAIN, 		// [DEEP, ELEVATED]
	RESOLUTION_1,	// [-1, 1]
	RESOLUTION_2,	// [-1, 1]
	RESOLUTION_3,	// [-1, 1]
	BIOME_TEMPERATURE,// [COLD, HOT]
	BIOME_WETNESS,	// [FLOODED, ARID]
	BIOME_FERTILITY,	// [INFERTILE, FERTILE]
	BIOME_SELECTION	// [-1, 1]
}

export enum BIOME_TEMPERATURE{
	FRIGID,
	COLD,
	TEMPERATE,
	SUBTROPICS,
	HOT
}

export enum BIOME_WETNESS{
	FLOODED,
	WET,
	MODERATE,
	DRY,
	ARID
}

export enum BIOME_FERTILITY{
	INFERTILE,
	HOSTILE,
	MODERATE,
	ARABLE,
	FERTILE
}

export type BiomeVector = [BIOME_TEMPERATURE, BIOME_WETNESS, BIOME_FERTILITY];
export const boringBiome: Vector3 = new Vector3( BIOME_TEMPERATURE.TEMPERATE, BIOME_WETNESS.MODERATE, BIOME_FERTILITY.MODERATE );

/**
 * Biomes dictate the rules of world
 * generation.
 */
export class Biome{
	
	private ncx: number = 0;
	private ncy: number = 0;
	private noiseCacheValue: number = 0;

	public name: string;
	public vector: Vector3;

	private blockRegistry!: BlockRegistry;

	/**
	 * 
	 * @param name 
	 * @param vector where this biome lies 
	 */
	constructor( name: string, vector: Vector3 = boringBiome ){
		this.name = name || "BiomeNoName";
		this.vector = vector;
	}

	public get br(){
		if(!this.blockRegistry){
			this.blockRegistry = regHub.get("base:block");
		}
		return this.blockRegistry;
	}

	/**
	 * Not the most efficient way to do this
	 * but it caches terrain values for a single
	 * point and references that for "optimization"
	 * @param x 
	 * @param y 
	 * @param noiseGen 
	 */
	public terrainNoise(x: number, y: number, noiseGen:Noise2D[]): number{
		if( this.ncx == x && this.ncy == y ){
			return this.noiseCacheValue;
		}
		this.ncx = x;
		this.ncy = y;
		this.noiseCacheValue = (noiseGen[NOISE_GENERATOR_LABELS.TERRAIN](x/200,y/200)+1)/2;
		return this.noiseCacheValue;
	}

	/**
	 * Floor layer
	 */
	public generateLayer0( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		return this.br.createBlockData( "base:BlockEmpty" );
	}

	/**
	 * Content layer
	 */
	public generateLayer1( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		return this.br.createBlockData( "base:BlockEmpty" );
	}

	public generate( x: number, y: number, zLevel: number, noiseGen:Noise2D[] ): BlockData{
		switch( zLevel ){
			case 0:
				return this.generateLayer0( x, y, noiseGen );
			case 1:
				return this.generateLayer1( x, y, noiseGen );
			default:
				return this.br.createBlockData( "base:BlockEmpty" );
		}
	}
}