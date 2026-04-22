import TextBlock from "./components/TextBlock";
import TextBlockFields from "./components/TextBlockFields";
import { TEXT_BLOCK_DEFAULTS, TEXT_BLOCK_TYPE } from "./models/textBlockModel";

const textBlock = {
  type: TEXT_BLOCK_TYPE,
  label: "Text",
  icon: "T",
  defaults: TEXT_BLOCK_DEFAULTS,
  Block: TextBlock,
  Fields: TextBlockFields,
};

export default textBlock;
