import ButtonBlock from "./components/ButtonBlock";
import ButtonBlockFields from "./components/ButtonBlockFields";
import {
  BUTTON_BLOCK_DEFAULTS,
  BUTTON_BLOCK_TYPE,
} from "./models/buttonBlockModel";

export default {
  type: BUTTON_BLOCK_TYPE,
  label: "Button",
  icon: "▶",
  defaults: BUTTON_BLOCK_DEFAULTS,
  Block: ButtonBlock,
  Fields: ButtonBlockFields,
};
