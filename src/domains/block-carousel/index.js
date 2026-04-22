import CarouselBlock from "./components/CarouselBlock";
import CarouselBlockFields from "./components/CarouselBlockFields";
import {
  CAROUSEL_BLOCK_DEFAULTS,
  CAROUSEL_BLOCK_TYPE,
} from "./models/carouselBlockModel";

export default {
  type: CAROUSEL_BLOCK_TYPE,
  label: "Carousel",
  icon: "🎠",
  defaults: CAROUSEL_BLOCK_DEFAULTS,
  Block: CarouselBlock,
  Fields: CarouselBlockFields,
};
