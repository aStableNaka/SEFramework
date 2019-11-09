import { Block, baseClass } from "./Block";

export class RegistryComponent{
	baseClass:baseClass;
	forceRegister:boolean;
	identities:baseClass[];

	constructor( baseClass:baseClass, forceRegister:boolean ){
		this.baseClass = baseClass;
		this.forceRegister = forceRegister;
		this.identities = [];
	}

	replaceIdentity( newbaseClass:baseClass ){
		this.addIdentity( this.baseClass );
		this.baseClass = newbaseClass;
	}

	addIdentity( baseClass:baseClass ){
		this.identities.push( baseClass );
	}
}
/**
 * The block registry is used to assign block to their typeName
 */
export class BlockRegistry{
	blocks:any = {};
	name:string;
	constructor( name:string="anonymous" ){
		this.name = name;
	}

	get logTag():string{
		return `[ BlockRegistry:${this.name} ]`;
	}

	/**
	 * Register a block inside the block registry
	 * @param baseClass {baseClass} 
	 * @param forceRegister force the registry to override the old block
	 */
	register( baseClass: baseClass, forceRegister:boolean=false ){
		let blockID:string = baseClass.blockId;

		if( this.blocks[blockID] ){
			// If a block has already been registered and forceRegister is false
			if(!forceRegister){
				console.warn( `${this.logTag} ${blockID} has already been registered, it will not be replaced.` );
				this.blocks[blockID].addIdentity( baseClass );
			}else{
				console.warn( `${this.logTag} ${blockID} has already been registered, it will be replaced.` );
				this.blocks[blockID].replaceIdentity( baseClass );
			}
			return;
		}
		console.log(`${this.logTag} ${blockID} has been registered.`);
		this.blocks[blockID] = new RegistryComponent( baseClass, forceRegister );
		
	}

	get( blockID:string ):baseClass{
		if( this.blocks[blockID] ){
			return this.blocks[blockID];
		}else{
			// Check again in case blockID is in shorthand, return the first result or throw if a block is not available
			let searchResults = Object.keys( this.blocks ).filter( ( name )=>{
				return name.split(':')[1]==blockID;
			})
			if(!searchResults[0]){
				throw new Error( `${this.logTag} block "${blockID}" has not been registered.` );
			}
			return this.blocks[searchResults[0]];
		}
	}
}