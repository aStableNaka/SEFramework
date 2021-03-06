import { FrostedFlakes } from "../../rendering/FrostedFlakes";
import {Player} from "../entity/Player";
import {Storable} from "../../io/Storable";
import { Region } from "./region/Region";
import { Grid } from "../../utils/collections/Spaces";
import { object } from "prop-types";
import { TickScheduler } from "../TickScheduler"; 
import { BlockData } from "../blocks/Block";
import { Vector2, Vector3, Vector4, Group } from "three";
import { Layer } from "./region/Layer";
import { regHub } from "../../registry/RegistryHub";
import { Model } from "../../models/Model";
import { config } from "@config";
import { Entity } from "../entity/Entity";
import { EntityActor } from "../entity/EntityActor";
import { Verbose } from "../../utils/Verboosie";
import { BlockNull } from "../blocks/base/BlockNull";
import { BlockRegistry } from "../../registry/BlockRegistry";
import {TickProfiler} from "@TickProfiler";

/**
 * True modulo. For all operations of x mod m
 * where x is any real number.
 * @param x number 
 * @param m modulo
 */
function mod( x:number, m:number ){
	return ( x % m + m ) % m;
};


export class World extends Storable{
	
	tickProfilerWorld:TickProfiler = new TickProfiler("world");
	tickProfilerRegions: TickProfiler;
	tickProfilerEntities: TickProfiler;
	tickProfilerUpdate: TickProfiler;
	
	
	ff: FrostedFlakes;
	regions!: Grid<Region>
	regionUpdateQueue: Region[] = [];
	limboMeshGroup: Group = new Group();

	worldSize = 4;
	regionSize = 16;

	tickLoggingLength: number = 10;
	tickSkip = this.tickLoggingLength*2;
	tickTime: number = 0;
	tickCount: number = 0;
	desiredTPS: number = config.tick.ps;
	tickDeltas: number[] = new Array<number>(this.tickLoggingLength).fill(1000/this.desiredTPS);
	tickScheduler!: TickScheduler;
	tickInterval!: NodeJS.Timeout;
	tps: number = 0;

	tickComputeTime: number = 0;
	tickComputeDateLast: number = 0;

	fps: number = 0;
	frameLastTS: number = 0;

	meshUpdates:number = 6000; // unused
	
	ready = false;

	entities: Set<Entity> = new Set();
	itemEntities: Set<Entity> = new Set();
	

	constructor( ff:FrostedFlakes ){
		super();
		this.ff = ff;

		this.tickProfilerEntities = new TickProfiler("entities", this.tickProfilerWorld);
		this.tickProfilerRegions = new TickProfiler("regions", this.tickProfilerWorld);
		this.tickProfilerUpdate = new TickProfiler("update", this.tickProfilerWorld);

		Verbose.log(`Initializing`, 'World', 0x8);
		
		this.setupDefaultFF();
		this.setupDefaultTicks();

		Verbose.log( this, "World", 0x20);

	}

	setupDefaultFF(){
		this.ff.add( this.limboMeshGroup );
	}

	setupDefaultTicks(){
		const self = this;
		this.tickScheduler = new TickScheduler( this );
		this.tickInterval = setInterval( ()=>{
			self.tick();
		}, 1000/this.desiredTPS);

		this.tickScheduler.after( 50, ()=>{
			self.test();
		}, "World-TEST" );
	}

		/**
	 * Any test methods: put in here
	 */
	test(){
		
	}

	/**
	 * Converts ms to ticks
	 */
	msToTicks( ms:number ): number {
		return 1000/this.desiredTPS*ms;
	}

	queueUpdate( region:Region ): void {
		this.regionUpdateQueue.push(region);
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 * @abstract
	 */
	render(  ): void {
		this.defaultRender();
	}

	update(): void {

	}

	/**
	 * The default rendering cycle
	 */
	defaultRender(): void {
		let self = this;

		// FPS recording
		const date = new Date().getTime();
		this.fps = Math.round(1000/(date-this.frameLastTS));
		this.frameLastTS = date;

		this.renderEntities();
		if(config.graphics.enableFPSLimit){
			setTimeout( ()=>{
				self.render();
			}, 1000/config.graphics.FPSLimit );
		}else{
			window.requestAnimationFrame(()=>{
				self.render();
			});
		}
		
		try{
			self.ff.render();
		}catch(e){
			console.log(e);
		}
	}

	updateTickTimes(): void {
		let time = new Date().getTime();
		this.tickCount++;
		this.tickDeltas[this.tickCount%this.tickDeltas.length] = time-this.tickTime;
		this.tickTime = time;
	}

	/**
	 * Gets the average TPS (Ticks Per Second)
	 */
	getTPS(): number {
		let deltaSum = this.tickDeltas.reduce((pv, cv)=>{
			return pv+cv;
		});
		// Average interval between ticks
		let deltaAvg = deltaSum/this.tickLoggingLength;
		
		let tps = 1000 / deltaAvg;
		return tps;
	}

	/**
	 * Ideally, this will produce a value in MS
	 * that will keep our tps at ${desiredTPS} (probably 60)
	 */
	getNextTickDelay(): number {
		let idealTPS = this.desiredTPS; // ms
		let currentTPS = this.getTPS();
		return Math.min(1000/idealTPS, 1000/(idealTPS - (currentTPS - idealTPS)));
	}

	queueNextTick(): void {
		let nextDelay = this.getNextTickDelay()-3;
		this.tps = this.getTPS()
		//document.title = tps.toFixed(2) + " - - - " + this.tickCount + " - - - " + 1000/tps+" / "+1000/this.desiredTPS;
		let self = this;
		this.updateTickTimes();
		this.tickScheduler.tick( this.tickCount );
		/*setTimeout(()=>{
			self.tick();
		}, nextDelay);*/
	}

	getRegionAtVec2(vec2: THREE.Vector2): Region | null {
		let pos = vec2.clone().divideScalar(this.regionSize).floor();
		return this.regions.get(pos.x, pos.y);
	}

	
	/*
		Map manipulation
	*/

	/**
	 * Get a single block at a particular location
	 * @param x 
	 * @param y 
	 * @param layerZ 
	 */
	getBlock( x:number, y:number, layerZ:number):BlockData | null{
		let region = this.getRegionAtVec2(new Vector2(x,y));
		x = mod(x, this.regionSize);
		y = mod(y, this.regionSize);
		if(region){
			return region.getBlock(x,y,layerZ);
		}
		return null;
	}

	/**
	 * Get a block's visual transform ( tx, ty, tz, ry );
	 * @param location Location vector( x, y, zLayer)
	 */
	getBlockModelTransform( location: THREE.Vector3 ): THREE.Vector4;

	/**
	 * Get a block's visual transform ( tx, ty, tz, ry );
	 * @param x x Location
	 * @param y y location
	 * @param layerZ vertical location
	 */
	getBlockModelTransform( x: number , y: number, layerZ: number ): THREE.Vector4;
	
	getBlockModelTransform( numOrVectX: number | THREE.Vector3, yOrNull?:number, layerZorNull?:number ): Vector4{
		let [x,y,z] = [0,0,0];
		if( numOrVectX instanceof Vector3 ){
			[x,y,z] = numOrVectX.toArray();
		}else if( numOrVectX && yOrNull && layerZorNull ){
			[x,y,z] = [numOrVectX,yOrNull,layerZorNull]
		}
		// Grab z-offset and rotation of the block
		const block = this.getBlock(x, y, z);
		let [tz, ry] = [0,0]
		if(block){
			const model = <Model>(regHub.get( block.getModelKey() )) || {options:{}};
			[tz,ry] = [ model.options.zOffset || 0, block.getRotation() ];
		}

		return new Vector4( x, y, z+tz, ry);
	}

	/**
	 * Get a list of all blocks spanning the z (vertical) axis
	 * of a particular location
	 * @param x 
	 * @param y 
	 */
	getBlockColumn( x:number, y:number ):BlockData[]{
		let region = this.getRegionAtVec2(new Vector2(x,y));
		[x, y] = [ mod(x, this.regionSize), mod(y, this.regionSize)];
		if(region){
			return <BlockData[]> region.layers.map(( layer:Layer, i:number )=>{
				return ( <Region> region ).getBlock(x,y,i);
			}).filter( (blockData:BlockData|null)=>{
				return !!blockData;
			});
		}
		return [];
	}

	setBlock( blockData:BlockData, x:number, y:number, layerZ:number ): void {
		let region = this.getRegionAtVec2(new Vector2(x,y));
		if(!region) throw new Error(`[SimonsWorld] Attempted to set block out of bounds ${x},${y},${layerZ}`);
		this.regionUpdateQueue.push(region);
		
		// World space to region space conversion
		[x, y] = [ mod(x, this.regionSize), mod(y, this.regionSize)];
		region.setBlock(blockData,x,y,layerZ);

		// Lets the block know that it is placed
		// in the world
		blockData.blockDidMount( {position: new Vector3( x, y, layerZ)} );
	}

	/**
	 * Removes block from the world without a trace
	 */
	removeBlock(x: number, y: number, layerZ: number){
		this.setBlock( (<BlockRegistry>regHub.get("base:block")).createBlockData("base:BlockEmpty"), x, y, layerZ );
	}

	tickEntities(): void {
		this.tickProfilerEntities.start();
		for( let entity of this.entities ){
			entity.tick();
		}
		this.tickProfilerEntities.end();
	}

	renderEntities():void{
		for( let entity of this.entities ){
			entity.render();
		}
		for( let entity of this.itemEntities ){
			entity.render();
		}
	}

	/**
	 * Tick will do a few things
	 * 	1 ) Update mesh transforms
	 * 	2 ) Update region states
	 */
	tick(): void {
		this.tickProfilerWorld.start();
		this.queueNextTick();
		if(this.tickSkip){
			this.tickSkip--;
		}else{
			this.tickProfilerUpdate.start();
			this.update();
			this.tickProfilerUpdate.end();

			this.tickProfilerRegions.start();
			while(this.regionUpdateQueue.length){
				let region = this.regionUpdateQueue.pop();
				if(!region) return;
				region.update()
			}
			this.tickProfilerRegions.end();

			
			this.tickEntities();
			
		}
		this.tickProfilerWorld.end();
	}
}