import { BlockRegistry } from "./BlockRegistry";
import { BlockEmpty } from "../environment/blocks/base/BlockEmpty";
import { BlockNull } from "../environment/blocks/base/BlockNull";
import { BlockGround } from "../environment/blocks/base/BlockGround";

/**
 * The block registry for all blocks
 */
export const baseBlockRegistry = new BlockRegistry();

baseBlockRegistry.register( BlockEmpty );
baseBlockRegistry.register( BlockNull );
baseBlockRegistry.register( BlockGround );