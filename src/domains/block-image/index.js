import ImageBlock from "./components/ImageBlock";
import ImageBlockFields from "./components/ImageBlockFields";
import {
  IMAGE_BLOCK_DEFAULTS,
  IMAGE_BLOCK_TYPE,
} from "./models/imageBlockModel";

export default {
  type: IMAGE_BLOCK_TYPE,
  label: "Image",
  icon: "🖼",
  defaults: IMAGE_BLOCK_DEFAULTS,
  Block: ImageBlock,
  Fields: ImageBlockFields,
};
