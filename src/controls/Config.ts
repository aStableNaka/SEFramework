export const config: any = {};

/**
 * Debugging
 */
config.debug = {};
config.debug.enable = true;			// Enables debugging tools
config.debug.entityAmount = 1;
config.debug.tools = {
    profiler: true                  // Logs the time it takes for every single subtick to execute
}

config.control = {};
config.control.enableEdgeScrolling = false;
config.control.edgeScrollingSens = 10; // Pixel width edge scrolling region
config.control.edgeScrollingSpeed = 10;

/**
 * Internal operations
 */
config.int = {};
config.int.rcTag = "$ci";

/**
 * Graphics options
 */
config.graphics = {};
config.graphics.enableFPSLimit = true;
config.graphics.vSync = false;
config.graphics.FPSLimit = 60;

/**
 * World options
 */
config.world = {};
config.world.regionSize = 32;			// A single region contains 32x32 blocks
config.world.mapSizeSmall = 8;		// 256x256 map size
config.world.mapSizeMedium = 16;		// 512x512 map size
config.world.mapSizeLarge = 32;		// 1024x1024 map size
config.world.mapSizeExtreme = 64; 		// 2048x2048 map size, Not recommended
config.world.mapSizeDebug = 8;		// Map size for debugging
config.world.mapSize = config.world.mapSizeDebug;
config.world.bounded = true;			// Set to false for infinite world generation

config.world.biome = {}
config.world.biome.tempScale = 300;	// Default 1200
config.world.biome.wetScale = 300;		// Default 500
config.world.biome.fertScale = 300;		// Default 200

/**
 * Gameplay options
 */
config.gameplay = {};
config.gameplay.imrSize = 3;			// The square-radius of the regions in view	default 3


/**
 * Camera options
 */
config.camera = {};
config.camera.noZoomLimit = false;		// Disable zoom limit alltogether 	Default false
config.camera.maxZoom = 60; 			// How far the camera can go	 	Default 60
config.camera.minZoom = 5;			// How close the camera can go 			Default 5
config.camera.viewAngle = 32;		// The view angle						Default 35
config.camera.panSpeed = 5;			// Pan speed, per second				Default 5
/**
 * Tick task options
 */
config.tick = {};
config.tick.ps = 60; 				// Ticks per second					Default 20
config.tick.ts_region_load = 1;		// How often an unloaded region gets loaded	Default 1 tick
config.tick.ts_debug_info_update = 10;	// How often debugging information gets updated Default 10 ticks

/**
 * Entity Behaviors
 */
config.behavior = {};

config.behavior.idle = {};
config.behavior.idle.timeoutRange = 0;	// Timeout before initiating new action		Default 100 ticks
config.behavior.idle.range = 1; 		// Wandering range					Default 1 unit

