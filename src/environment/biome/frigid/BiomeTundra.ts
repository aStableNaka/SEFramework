import * as Biome from "../Biome";
import {Noise2D} from "open-simplex-noise";
import { Vector3 } from "three";
import { BlockData } from "../../blocks/Block";

export class BiomeTundra extends Biome.Biome{

	private mountainFactor: number = 0.1;

	constructor( name: string ){
		super( name, new Vector3(
			Biome.BIOME_TEMPERATURE.FRIGID,
			Biome.BIOME_WETNESS.MODERATE,
			Biome.BIOME_FERTILITY.FERTILE
		));
	}

	/**
	 * Floor layer
	 */
	public generateLayer0( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		let block = this.br.createBlockData( "base:BlockGround", 5 );
		return block;
	}

	/**
	 * Content layer
	 */
	public generateLayer1( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		let block  = this.br.createBlockData( "base:BlockEmpty" );
		return block;
	}
}