import { BlockFactory, Geometry, BlockData } from "../Block";
import {BlockVariantData} from "./BlockVariantData";
import * as THREE from "three";

export class BlockGround extends BlockFactory{
	static model:string = "base:model:Tile";
	static noModel = false;

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData( variant?:number|null ):BlockData{
		if(variant==null || variant==undefined){
			variant = Math.floor(Math.random()*16);
		}
		return new BlockVariantData( this, variant, 0 );
	}

	static getModelKey( blockData:BlockVariantData ):string{
			return `${this.model}:${blockData.uniqueData.variant%(16*16)}`;
	}

	static getMinimapColor( blockData:BlockData ){
		return [10,100,50,255];
	}
}