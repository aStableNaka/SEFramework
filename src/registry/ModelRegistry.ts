import {Registry} from "./Registry";
import {GLTFResource} from "../loader/GLTFResource";
import {ResourceLoader} from "../loader/ResourceLoader";
import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";
import { Resource } from "../loader/Resource";
import { Geometry } from "../environment/blocks/Block";
import * as THREE from "three";
import {BufferGeometryUtils} from "../utils/THREE/jsm/utils/BufferGeometryUtils";
import { Layer } from "../environment/world/region/Layer";
import {Model} from "../models/Model";

/**
 * @example
 * let mr = new ModelRegistry("assets/models");
 * mr.queue( new UniformModel("cube", "Cube.gltf") )
 */
export class ModelRegistry implements Registry{
	entries:Map<string,Model> = new Map<string,Model>();
	loader:ResourceLoader;
	list:Model[] = [];
	tickTable:Model[] = [];
	constructor(resourcePath:string){
		this.loader = new ResourceLoader(resourcePath);
	}

	register( model:Model,forceRegister:boolean=false ):string{
		if(this.entries.has(model.name)&&!forceRegister){
			throw new Error(`[ModelRegistry] could not register model ${model.name}. Model already registered.`);
		}
		model.assignRegistry(this);
		this.entries.set(model.name,model);
		this.list.push(model);

		// For models that require some data update
		if(model.usesTick){
			this.tickTable.push( model );
		}

		return model.name;
	}

	get(key:string){
		key = key.split(":")[0]; // In case the model key has a discriminiator
		if(!this.entries.has(key)){
			throw new Error(`[ModelRegistry] model:${key} is not registered.`);
		}
		return this.entries.get(key);
	}

	checkReady(ready:()=>void){
		this.loader.load(()=>{
			ready();
		})
	}

	tick( n:number ){
		this.tickTable.map( ( model )=>{
			model.tick( n );
		});
	}
}