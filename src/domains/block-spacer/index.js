import SpacerBlock from "./components/SpacerBlock";
import SpacerBlockFields from "./components/SpacerBlockFields";
import {
  SPACER_BLOCK_DEFAULTS,
  SPACER_BLOCK_TYPE,
} from "./models/spacerBlockModel";

export default {
  type: SPACER_BLOCK_TYPE,
  label: "Spacer",
  icon: "↕",
  defaults: SPACER_BLOCK_DEFAULTS,
  Block: SpacerBlock,
  Fields: SpacerBlockFields,
};
