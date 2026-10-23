import {
  Blocks,
  Camera,
  Clapperboard,
  Image,
  Mountain,
  Palette,
  Pencil,
  Ribbon,
  Scissors,
  ScrollText,
  Smartphone,
  Sparkles,
  Trophy,
} from "lucide-react";

const ICONS = {
  blocks: Blocks,
  camera: Camera,
  clapperboard: Clapperboard,
  image: Image,
  mountain: Mountain,
  palette: Palette,
  pencil: Pencil,
  ribbon: Ribbon,
  scissors: Scissors,
  "scroll-text": ScrollText,
  smartphone: Smartphone,
  sparkles: Sparkles,
  trophy: Trophy,
};

export default function Icon({ name = "image", className = "w-5 h-5 inline-block" }) {
  const LucideIcon = ICONS[name] || Image;
  return <LucideIcon className={className} aria-hidden="true" />;
}
