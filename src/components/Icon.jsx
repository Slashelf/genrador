import {
  Apple,
  Blocks,
  Bot,
  Camera,
  Citrus,
  Clapperboard,
  Hand,
  Image,
  Landmark,
  Medal,
  Mountain,
  Palette,
  Pencil,
  Ribbon,
  Scissors,
  ScrollText,
  Smartphone,
  Snowflake,
  Sparkles,
  Trophy,
} from "lucide-react";

const ICONS = {
  apple: Apple,
  blocks: Blocks,
  bot: Bot,
  camera: Camera,
  citrus: Citrus,
  clapperboard: Clapperboard,
  hand: Hand,
  image: Image,
  landmark: Landmark,
  medal: Medal,
  mountain: Mountain,
  palette: Palette,
  pencil: Pencil,
  ribbon: Ribbon,
  scissors: Scissors,
  "scroll-text": ScrollText,
  smartphone: Smartphone,
  snowflake: Snowflake,
  sparkles: Sparkles,
  trophy: Trophy,
};

export default function Icon({ name = "image", className = "w-5 h-5 inline-block" }) {
  const LucideIcon = ICONS[name] || Image;
  return <LucideIcon className={className} aria-hidden="true" />;
}
