// ---------------------------------------------------------------
// Portfolio content. Edit this file to add / remove / reorder work.
// Each project needs: slug, title, and either a `video` (YouTube ID)
// or a `cover` image. Everything else is optional.
// ---------------------------------------------------------------
const CDN = "https://images.squarespace-cdn.com/content/v1/5ba02f82c3c16adebf57f259/";

window.PROJECTS = [
  {
    slug: "doa",
    title: "Deck Of Anubis",
    video: "v4VqpaDzyKA",
    description: "Deck of the Dead is a game aimed at mobile. Work in progress.",
    featured: true,
    media: [
      { type: "image", src: CDN + "1751691981673-MW6TEJBYOIRCE9VFEFWK/image-asset.jpeg?format=2500w" },
      { type: "image", src: CDN + "1751691748744-5LOFFOAGQC1RPNSZANV1/image-asset.jpeg?format=2500w" }
    ]
  },
  {
    slug: "deck-of-anubis",
    title: "Deck Of Anubis",
    video: "3fpoVKd9-bE",
    media: [
      { type: "image", src: CDN + "1751692780706-MMOALNGPSBOAE1Y8TD5C/image-asset.jpeg?format=2500w" },
      { type: "image", src: CDN + "1751692809815-3P3A04W5WGDPF4J8HXQ6/image-asset.jpeg?format=2500w" }
    ]
  },
  {
    slug: "deck-of-anubis-1",
    title: "Deck Of Anubis",
    video: "xSgVNewENbM",
    media: [
      { type: "image", src: CDN + "1751762549569-UJ7C56KGKUVG6VJ80NZW/image-asset.jpeg?format=2500w" }
    ]
  },
  {
    slug: "steampunk-runner",
    title: "Steampunk Runner",
    video: "vJEb06B8At8",
    cover: CDN + "1678183694025-29150P1PDEQ16SOS11UN/ScreenShots2.jpg?format=1500w",
    description: "Solo-developed endless runner, stylized as a steampunk runner. Made using Unity, Blender, Maya and Substance Painter.",
    tools: ["Unity", "Blender", "Maya", "Substance Painter"],
    media: [
      { type: "image", src: CDN + "1678183327449-797JRK2RGZQ94CM0UTZ1/ScreenShots2.jpg?format=2500w" },
      { type: "image", src: CDN + "1678183337647-6ZZDM91EEKGECVABLBKY/ScreenShots.jpg?format=2500w" },
      { type: "image", src: CDN + "1678183373063-Y3HUNEVRAV6MBGNVDQI8/image-asset.jpeg?format=2500w" },
      { type: "image", src: CDN + "1678183341086-4MO2TQQVPCDN1ZGCP8LB/ScreenShots3.jpg?format=2500w" }
    ]
  },
  {
    slug: "ibeam",
    title: "iBeam",
    video: "hZ3JqpHr5as",
    description: "iBeam was a video-mapping project projecting a UI interface onto big screens. The mission was to create unique shaders that imitate space travel with the energy of electric impulses.",
    tools: ["Unity", "Shaders"]
  },
  {
    slug: "pirate-game",
    title: "Pirate Game",
    video: "l-_T1Tz5cpo",
    media: [
      { type: "image", src: CDN + "1703757058693-MSCRWJTRL4K0Y0PQC1PC/image-asset.jpeg?format=2500w" }
    ]
  },
  {
    slug: "crowd-creator-unity-editor-tool",
    title: "Crowd Creator Unity Editor Tool",
    video: "yBdf7C7CI_o",
    description: "Made especially to deliver a convenient way to create, then design and manage, multiple crowd blocks in a scene.",
    tools: ["Unity Editor", "C#"],
    media: [
      { type: "image", src: CDN + "1718609111059-ICLJ0Y9CF98MF55JYU1F/image-asset.jpeg?format=2500w" }
    ]
  },
  {
    slug: "lost-pilot",
    title: "Lost Pilot",
    video: "rYHed875I6M",
    description: "In Lost Pilot you play a stranded pilot searching for your plane parts on a remote island. As the visual artist, I created the graphics that bring the game world to life.",
    media: [
      { type: "image", src: CDN + "1667376651712-FLULOVEOW8F9LMH52EMV/image-asset.png?format=2500w" }
    ]
  },
  {
    slug: "deck-of-anubis-2",
    title: "Deck Of Anubis",
    video: "VIYR8sNtm9w"
  }
];

window.SITE = {
  name: "Yinon Ezra",
  tagline: "Technical Artist, Unity Developer",
  email: "Yinon.Ezra@gmail.com",
  phone: "+972-547-802-082",
  about: [
    "Yinon Ezra is a designer, film director and game developer. He holds a BFA in Film Studies, and his first film, Free Radicals, was released through the Yes broadcasting network.",
    "He also runs his own type foundry, with typefaces available through the Monotype and Fontbit stores. For the past six years he has worked as a Lead Technical Artist, specialising in the Unity game engine."
  ]};
