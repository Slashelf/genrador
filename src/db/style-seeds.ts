import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prompts = JSON.parse(
  fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "style-prompts.json"), "utf8"),
) as Record<string, string>;

function withExtra(sourceFile: string, label: string) {
  return `${prompts[sourceFile].trim()}\n\n${label} {{extraDetails}}`;
}

const EPOCA_MENU = {
  label: "Época",
  options: [
    {
      value: "renacimiento",
      label: "Renacimiento",
      prompt: "Italian Renaissance, about 1500. Velvet, brocade and a white linen collar, or a dark doublet. Background is a marble loggia and a soft landscape. Heavy carved gold frame.",
    },
    {
      value: "roma",
      label: "Antigua Roma",
      prompt: "Ancient Rome. A white toga with a red border, or a stola and palla. Sunlit marble columns and a forum behind. Ornate gold frame.",
    },
    {
      value: "medieval",
      label: "Medieval",
      prompt: "Medieval court. A wool tunic and cloak, or a long gown and veil, in deep red and blue. A stone castle hall with a tapestry. Gothic gold frame.",
    },
    {
      value: "barroco",
      label: "Barroco",
      prompt: "Baroque portrait, about 1650. Dark satin, lace collar and a pearl, or a cloak and gold chain. A rich curtain and dramatic chiaroscuro. Thick sculpted gold frame.",
    },
    {
      value: "victoriana",
      label: "Victoriana",
      prompt: "Victorian era, about 1870. A high-collar gown with lace, or a frock coat and cravat. A parlor with velvet drapes and a gas lamp. Deep gold frame.",
    },
    {
      value: "egipto",
      label: "Antiguo Egipto",
      prompt: "Ancient Egypt. Linen robes, a broad collar and kohl-lined eyes, or a nemes headdress translated as clothing, not a mask over the face. Warm temple columns and golden light. Gold frame with a simple lotus motif.",
    },
  ],
};

const EPOCA_PROMPT = `Use the uploaded photo as the only person. Keep the face recognizable: same eyes, nose, jaw, age and skin tone.

Repaint that person as a museum oil portrait from this era:
{{choice}}

The picture is an old oil painting on canvas, with visible brushwork, and a golden frame around it. Clothing, background and frame must match the era. No modern clothes, no text, no logos.
{{extraDetails}}`;

const FRUTINOVELA_PROMPT = `Use the uploaded photo. Keep that person's face recognizable, including their expression, even after the costume change.

Turn them into a glossy fruit character from a TikTok frutinovela. They stand in front of jail bars and threaten Ricardo, a different fruit character locked behind the bars. Ricardo is not the uploaded person. Dramatic telenovela lighting, one hard spotlight, deep shadows, exaggerated shocked faces, soap-opera close-up. Vertical 9:16 frame. No text, no logos.
{{extraDetails}}`;

const FRUTA_PROMPT = `Use the uploaded photo. Keep that person's face and expression recognizable.

Turn them into a fruit character from a TikTok frutinovela, in the middle of a telenovela drama: glossy fruit costume, exaggerated emotion, hard spotlight, deep shadows, rich colors. No text, no logos.
{{extraDetails}}`;

const GRAN_PREMIO_PROMPT = `Use the uploaded photo as the winner. Keep that face recognizable and very happy.

A funny awards photo. The person stands on the highest podium step, first place, holding a large gold trophy. On the second step an elderly person cries inconsolably. On the third step a small child cries inconsolably. Both losers are clearly not the uploaded person. A crowd cheers, confetti fills the air, and the scene is bright and comedic. No text, no logos.
{{extraDetails}}`;

const OPTIMUS_PROMPT = "A realistic close-up of the giant Optimus Prime head, taken from a low right front angle, sharply highlights its mechanical details and color structure. The Optimus Prime has a sturdy and heroic appearance, with soft morning lighting from the top left, creating natural light gradients on the sides of its helmet and armor plates. A man from the uploaded image with 100% facial resemblance, somewhat athletic, wearing a red polo shirt over a plain white t-shirt, beige cargo pants, Optimus Prime toy keychain, a metal 'OP' letter keychain, rectangular white-framed glasses, gray hair, a dog tag necklace and white Nike Airmax sneakers, sits casually on the Optimus's right shoulder. His sitting position is calm, one leg dangling, the other bent, his hands resting on his knees, drinking coffee from a mug shaped like Optimus Prime robot head, he looks out to the horizon with a look of awe and serenity. The man's scale appears much smaller compared to the dimensions of the Prime, emphasizing the robot's colossal size. The natural lighting of the setting sun creates warm reflections on the Prime's armor. Details such as panels, technical logos, and mechanical warnings are captured with great clarity. The background features a black steel structure and a bright blue midday sky with fluffy clouds. The composition of the image leads the eye from the diagonal line of the shoulders up to the Prime's head and to the man above it, creating an epic and cinematic feel, as if the man were a pilot enjoying the view from atop his legendary mecha. The aspect ratio is 9:16. no blur, no cgi, no cartoon";

const MINI_CHIBI_PROMPT = "A mini chibi version of the character in the uploaded image, with a big head and small body, sitting on an open left palm for realistic scale. A right hand gently pressing its cheek with an index finger. The character looks annoyed and pouty — puffed cheeks, slightly frowning, squinting eyes. Ultra-detailed chibi style, soft pastel colors, smooth texture, clean lighting, shallow depth of field, strong focus on facial expression and hand interaction, vertical composition 4:5 ratio.";

const TOKIO_PROMPT = "The person from the reference photo stands on a snowy Tokyo street at dusk, facing the camera, keeping their exact face, hairstyle, and clothing. Snowflakes and pink cherry blossom petals fall gently around them. Blurred crowds walk behind them. The camera stays in front of the person, handheld with a subtle natural shake, no rotation, no orbit, no camera turns. The person breathes calmly, blinks, and gives a soft smile. Soft warm lighting from shop signs, shallow depth of field, cinematic and peaceful winter mood. Realistic, natural movement.";

export const STYLE_SEEDS = [
  {
    id: "epoca-clasica",
    slug: "epoca-clasica",
    name: "Época clásica",
    description: "Retrato al óleo con la ropa, el fondo y el marco dorado de la época.",
    icon: "landmark",
    promptTemplate: EPOCA_PROMPT,
    detailsHint: "Un accesorio o un detalle del cuadro",
    selectOptions: JSON.stringify(EPOCA_MENU),
    referenceFile: null,
    aspectRatio: "1:1",
    requiresCelebrity: false,
    sortOrder: 1,
  },
  {
    id: "frutinovela-carcel",
    slug: "frutinovela-carcel",
    name: "Frutinovela: la amenaza en la cárcel",
    description: "Tu cara en una fruta, amenazando a Ricardo detrás de las rejas.",
    icon: "citrus",
    promptTemplate: FRUTINOVELA_PROMPT,
    detailsHint: "La fruta o el gesto de la amenaza",
    selectOptions: null,
    referenceFile: null,
    aspectRatio: "9:16",
    requiresCelebrity: false,
    sortOrder: 2,
  },
  {
    id: "personaje-frutinovela",
    slug: "personaje-frutinovela",
    name: "Personaje de frutinovela",
    description: "Tu cara y tu expresión, convertidas en una fruta de telenovela.",
    icon: "apple",
    promptTemplate: FRUTA_PROMPT,
    detailsHint: "La fruta o la emoción de la escena",
    selectOptions: null,
    referenceFile: null,
    aspectRatio: "9:16",
    requiresCelebrity: false,
    sortOrder: 3,
  },
  {
    id: "el-gran-premio",
    slug: "el-gran-premio",
    name: "El gran premio",
    description: "Primer lugar en el podio, con trofeo, confeti y público.",
    icon: "medal",
    promptTemplate: GRAN_PREMIO_PROMPT,
    detailsHint: "El premio o el lugar de la ceremonia",
    selectOptions: null,
    referenceFile: null,
    aspectRatio: "1:1",
    requiresCelebrity: false,
    sortOrder: 4,
  },
  {
    id: "optimus-prime",
    slug: "optimus-prime",
    name: "Encima de Optimus Prime",
    description: "Sentado en el hombro de Optimus Prime, con tu cara.",
    icon: "bot",
    promptTemplate: OPTIMUS_PROMPT,
    detailsHint: "Este estilo usa una escena fija",
    selectOptions: null,
    referenceFile: null,
    aspectRatio: "9:16",
    requiresCelebrity: false,
    sortOrder: 5,
  },
  {
    id: "mini-chibi-mano",
    slug: "mini-chibi-mano",
    name: "Mini chibi en la mano",
    description: "Un mini chibi enfadado, sentado en la palma de una mano.",
    icon: "hand",
    promptTemplate: MINI_CHIBI_PROMPT,
    detailsHint: "Este estilo usa una escena fija",
    selectOptions: null,
    referenceFile: null,
    aspectRatio: "3:4",
    requiresCelebrity: false,
    sortOrder: 6,
  },
  {
    id: "que-paso-ayer-fiesta",
    slug: "que-paso-ayer",
    name: "¿Qué pasó ayer?",
    description: "Foto espontánea de fiesta junto a una celebridad.",
    icon: "clapperboard",
    promptTemplate: prompts["imageGenerator.js"].replace(
      "${celebrityName || 'una celebridad'}",
      "{{celebrityName}}",
    ) + " {{extraDetails}}",
    detailsHint: "Detalles de la fiesta, ropa o lugar",
    requiresCelebrity: true,
    sortOrder: 7,
  },
  {
    id: "chibi-sticker",
    slug: "chibi-sticker",
    name: "Chibi Sticker",
    description: "Nueve stickers chibi en una cuadrícula.",
    icon: "sparkles",
    promptTemplate: withExtra("chibiGenerator.js", "Additional customization:"),
    detailsHint: "Expresiones o accesorios",
    requiresCelebrity: false,
    sortOrder: 8,
  },
  {
    id: "figure-collector",
    slug: "figure-collector",
    name: "Figure Collector",
    description: "Figura coleccionable a escala 1/7.",
    icon: "trophy",
    promptTemplate: withExtra("figureGenerator.js", "Additional customization:"),
    detailsHint: "Base, empaque o escena",
    requiresCelebrity: false,
    sortOrder: 9,
  },
  {
    id: "buzz-cut-street",
    slug: "buzz-cut",
    name: "Buzz Cut Street",
    description: "Corte buzz cut con luz de neón.",
    icon: "scissors",
    promptTemplate: withExtra("buzzCutGenerator.js", "Additional details:"),
    detailsHint: "Ropa o ambiente de la calle",
    requiresCelebrity: false,
    sortOrder: 10,
  },
  {
    id: "film-noir-portrait",
    slug: "film-noir",
    name: "Retrato siglo XIX",
    description: "Retrato histórico con textura de daguerrotipo.",
    icon: "scroll-text",
    promptTemplate: withExtra("filmNoirGenerator.js", "Additional historical details:"),
    detailsHint: "Época, vestuario o interior",
    requiresCelebrity: false,
    sortOrder: 11,
  },
  {
    id: "editorial-portrait",
    slug: "editorial-portrait",
    name: "Editorial Portrait B&W",
    description: "Retrato editorial en blanco y negro.",
    icon: "camera",
    promptTemplate: withExtra("editorialPortraitGenerator.js", "Additional artistic details:"),
    detailsHint: "Luz o encuadre",
    requiresCelebrity: false,
    sortOrder: 12,
  },
  {
    id: "yarn-doll",
    slug: "yarn-doll",
    name: "Yarn Doll Crochet",
    description: "Muñeco de crochet estilo amigurumi.",
    icon: "ribbon",
    promptTemplate: withExtra("yarnDollGenerator.js", "Additional handmade details:"),
    detailsHint: "Colores o accesorios tejidos",
    requiresCelebrity: false,
    sortOrder: 13,
  },
  {
    id: "pencil-sketch",
    slug: "pencil-sketch",
    name: "Pencil Sketch",
    description: "Boceto a lápiz sobre papel.",
    icon: "pencil",
    promptTemplate: withExtra("pencilSketchGenerator.js", "Additional artistic details:"),
    detailsHint: "Trazo o papel",
    requiresCelebrity: false,
    sortOrder: 14,
  },
  {
    id: "instagram-chibi",
    slug: "instagram-chibi",
    name: "Instagram Chibi",
    description: "Chibi 3D sentado en un marco.",
    icon: "smartphone",
    promptTemplate: withExtra("instagramChibiGenerator.js", "Additional creative details:"),
    detailsHint: "Colores o pose",
    requiresCelebrity: false,
    sortOrder: 15,
  },
  {
    id: "lego-collection",
    slug: "lego-collection",
    name: "LEGO Collection",
    description: "Minifigura en una vitrina.",
    icon: "blocks",
    promptTemplate: withExtra("legoCollectionGenerator.js", "Additional details:"),
    detailsHint: "Ropa o animal de compañía",
    requiresCelebrity: false,
    sortOrder: 16,
  },
  {
    id: "ghibli-style",
    slug: "ghibli-style",
    name: "Ghibli Style",
    description: "Dibujo con estética de animación pintada.",
    icon: "palette",
    promptTemplate: withExtra("ghibliStyleGenerator.js", "Additional scene details:"),
    detailsHint: "Escenario o clima",
    requiresCelebrity: false,
    sortOrder: 17,
  },
  {
    id: "polaroid-chibi",
    slug: "polaroid-chibi",
    name: "Polaroid Chibi",
    description: "Chibi 3D saliendo de una foto instantánea.",
    icon: "image",
    promptTemplate: withExtra("polaroidChibiGenerator.js", "Additional creative details:"),
    detailsHint: "Fondo o pose",
    requiresCelebrity: false,
    sortOrder: 18,
  },
  {
    id: "ghibli-classic",
    slug: "ghibli-classic",
    name: "Ghibli Classic",
    description: "Redibujo breve al estilo Ghibli.",
    icon: "mountain",
    promptTemplate: withExtra("ghibliClassicGenerator.js", "Additional creative details:"),
    detailsHint: "Detalles de la escena",
    requiresCelebrity: false,
    sortOrder: 19,
  },
  {
    id: "tokio-nevado",
    slug: "tokio-nevado",
    name: "Tokio nevado",
    description: "Tu cara en una calle nevada de Tokio, al atardecer.",
    icon: "snowflake",
    promptTemplate: TOKIO_PROMPT,
    detailsHint: "Este estilo usa una escena fija",
    selectOptions: null,
    referenceFile: null,
    aspectRatio: "9:16",
    requiresCelebrity: false,
    kind: "video",
    sortOrder: 20,
  },
];

export const ICON_OPTIONS = [
  "landmark",
  "citrus",
  "apple",
  "medal",
  "bot",
  "hand",
  "clapperboard",
  "sparkles",
  "trophy",
  "scissors",
  "scroll-text",
  "camera",
  "ribbon",
  "pencil",
  "smartphone",
  "blocks",
  "palette",
  "image",
  "mountain",
  "snowflake",
];
