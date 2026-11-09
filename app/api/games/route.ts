import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PricingConfig from "@/models/PricingConfig";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ================= IMAGES ================= */
const MLBB_MAIN_IMAGE = "/game-assets/mlbbindia.jpg";

const MLBB_SMALL_IMAGE = "/game-assets/mlbb-ph-small.jpg";

const MLBB_DOUBLE_IMAGE = "/game-assets/double-dias.jpg";

const MLBB_MY_IMAGE = "/game-assets/all-region.jpg";

const MLBB_RUSSIA_IMAGE = "/game-assets/mlbb-russia.jpg";
const MLBB_INDO_IMAGE = "/game-assets/mlbb-indo.jpg";

const MAGIC_IMAGE = "/game-assets/magicchess.jpg";

const HOK_IMAGE = "/game-assets/hok.jpg";


const GENSIN_IMAGE = "/game-assets/genshin.jpg";
const COC_IMAGE = "/game-assets/coc_logo.png";
const STARLIGHT_IMAGE = "/game-assets/starkight.webp";
const WEEKLY_MONTHLY_IMAGE = "/game-assets/weekly-monthly-bundle.jpg";
const UNIPIN_IMAGE = "/game-assets/unipin.png";
const RANK_BOOST_IMAGE = "/game-assets/rankboost.jpg";
const BGMI_IMAGE = "/game-assets/bgmi_india.png";


/* ================= OTT SECTION ================= */
const OTTS = [
  {
    gameName: "YouTube Premium",
    slug: "youtube-premium",
    image: "/ott/youtube.webp",
    gameFrom: "Google",
    category: "OTT",
    available: true,
    isManual: true,
  },
  {
    gameName: "Netflix",
    slug: "netflix",
    image: "/ott/netflix.webp",
    gameFrom: "Netflix Inc.",
    category: "OTT",
    available: true,
    isManual: true,
  },
  {
    gameName: "Spotify Premium",
    slug: "spotify",
    image: "/ott/spotify.webp",
    gameFrom: "Spotify",
    category: "OTT",
    available: false,
    isManual: true,
  },
];
/* ================= MEMBERSHIP SECTION ================= */
const MEMBERSHIPS = [
  {
    gameName: "Membership",
    slug: "silver-membership",
    image: "/membership/silver-m.png",
    gameFrom: "MLBB Topup",
    type: "silver",
    category: "Membership",
    available: true,
    isManual: true,
  },
  {
    gameName: "Reseller",
    slug: "reseller-membership",
    image: "/membership/reseller-m.png",
    gameFrom: "MLBB Topup",
    type: "reseller",
    category: "Membership",
    available: true,
    isManual: true,
  },
];

/* ================= VOUCHER SECTION ================= */
const VOUCHERS = [
  {
    gameName: "UniPin Voucher",
    slug: "unipin-voucher",
    image: UNIPIN_IMAGE,
    gameFrom: "UniPin",
    category: "Voucher",
    available: true,
    isManual: true,
  },
];

/* ================= SERVICE SECTION ================= */
const SERVICES = [
  {
    gameName: "MLBB Rank Boost",
    slug: "rank-boost",
    image: RANK_BOOST_IMAGE,
    gameFrom: "Elite Boosters",
    category: "Service",
    available: true,
    isManual: true,
  },
  {
    gameName: "Starlight Card",
    slug: "starlight-card-manual",
    image: STARLIGHT_IMAGE,
    gameFrom: "Moonton",
    category: "Service",
    available: true,
    isManual: true,
  },
];


/* ================= API ================= */
export async function GET() {
  try {
    const response = await fetch("https://game-off-ten.vercel.app/api/v1/game", {
      method: "GET",
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
    });

    const data = await response.json();

    /* ================= NORMALIZE GAME ================= */
    const normalizeGame = (game: any) => {
      let updatedGame = { ...game };

      // Rename MLBB SMALL/PHP → MLBB SMALL
      if (updatedGame.gameName === "MLBB SMALL/PHP") {
        updatedGame.gameName = "MLBB SMALL";
      }

      // Fix wrong publisher spelling
      if (updatedGame.gameFrom === "Moneyton") {
        updatedGame.gameFrom = "Moonton";
      }

      // Replace Mobile Legends main image
      if (updatedGame.gameSlug === "mobile-legends114") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_MAIN_IMAGE,
        };
      }

      // Replace MLBB SMALL image
      if (updatedGame.gameName === "MLBB SMALL") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_SMALL_IMAGE,
        };
      }
      if (updatedGame.gameName === "MLBB Double") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_DOUBLE_IMAGE,
        };
      }
      if (updatedGame.gameName === "SG/MY Mlbb") {
        updatedGame.gameName = "MLBB All Region";
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_MY_IMAGE,
        };
      }
      if (updatedGame.gameName === "MLBB RUSSIA") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_RUSSIA_IMAGE,
        };
      }
      if (updatedGame.gameName === "MLBB INDO") {
        updatedGame.gameName = "MLBB INDONESIA";
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_INDO_IMAGE,
        };
      }

      if (updatedGame.gameSlug === "magic-chess-gogo-india924") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MAGIC_IMAGE,
        };
      }
      if (updatedGame.gameSlug === "genshin-impact265") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: GENSIN_IMAGE,
        };
      }
      if (updatedGame.gameSlug === "honor-of-kings57") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: HOK_IMAGE,
        };
      }
      if (updatedGame.gameSlug === "weeklymonthly-bundle646") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: WEEKLY_MONTHLY_IMAGE,
        };
      }
      if (updatedGame.gameSlug === "bgmi226" || updatedGame.gameName?.toLowerCase().includes("bgmi")) {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: BGMI_IMAGE,
        };
      }



      return updatedGame;
    };

    /* ================= FILTER GAMES ================= */
    const ALLOWED_SLUGS = [
      "mobile-legends114",
      "mlbb-double332",
      "sgmy-mlbb893",
      // "magic-chess-gogo-india924",
      // "mlbb-indo42",
      // "mlbb-russia953",
      "pubg-mobile138",
      "mlbbtr112",
      "mlbbglobal202",
      "mlbbbr178",

      "genshin-impact265",
      "honor-of-kings57",
      "wuthering-of-waves464",
      "where-winds-meet280",
      "mlbb-smallphp980",
      "weeklymonthly-bundle646",
      "asphalt9877",
      "value-pass-ml838",
      "8ballpool498",
      "mobile-legends-exclusive952",

      "mobile-legends-philippines888",
      "bgmi226",
       "mlbb-russia46",
         "mobile-legends-united-states41",
           "roblox7",
       "mlbbph643",

       "flash-weekly621"

    ];

    await connectDB();
    const userPricing = await PricingConfig.findOne({ userType: "user" }).lean();
    const rawOosSlugs: string[] = (userPricing as any)?.gameConfigs
      ?.filter((gc: any) => gc.isOutOfStock)
      ?.map((gc: any) => gc.gameSlug) || [];

    // Expand known game aliases (e.g. pubg-mobile135 / pubg-mobile138, bgmi226 / bgmi-manual)
    const oosSet = new Set<string>(rawOosSlugs);
    if (rawOosSlugs.some((s) => s.startsWith("pubg-mobile") || s === "pubg")) {
      oosSet.add("pubg-mobile135");
      oosSet.add("pubg-mobile138");
      oosSet.add("pubg");
    }
    if (rawOosSlugs.some((s) => s.startsWith("bgmi"))) {
      oosSet.add("bgmi226");
      oosSet.add("bgmi-manual");
      oosSet.add("bgmi");
    }
    const manualOosList = [
      "silver-membership",
      "reseller-membership",
      "unipin-voucher",
      "rank-boost",
      "starlight-card-manual",
    ];
    manualOosList.forEach((slug) => oosSet.add(slug));
    const outOfStockSlugs = Array.from(oosSet);

    const filteredGames =
      data?.data?.games
        ?.filter(
          (game: any) => ALLOWED_SLUGS.includes(game.gameSlug) && !outOfStockSlugs.includes(game.gameSlug)
        )
        ?.map(normalizeGame) || [];


    /* ================= FILTER CATEGORY GAMES ================= */
    const filteredCategories =
      data?.data?.category?.map((cat: any) => ({
        ...cat,
        gameId:
          cat.gameId
            ?.filter((game: any) => game.gameSlug !== "test-1637")
            ?.map(normalizeGame) || [],
      })) || [];

    /* ================= EXTRA SECTIONS ================= */

    // Featured games
    const featuredGames = filteredGames.filter((g: any) =>
      ["mobile-legends114", "pubg-mobile138", "genshin-impact265"].includes(
        g.gameSlug
      )
    );

    // MLBB family
    const mlbbVariants = filteredGames.filter(
      (g: any) =>
        // g.gameSlug.includes("mlbb") ||
        // g.gameName.toLowerCase().includes("mlbb") ||
        g.gameSlug.toLowerCase().includes("legends270") ||
        g.gameSlug.toLowerCase().includes("sgmy-mlbb893") ||
        g.gameSlug.toLowerCase().includes("mlbb-double332") ||
        g.gameSlug.toLowerCase().includes("mlbbglobal202") ||

        g.gameSlug.toLowerCase().includes("mobile-legends-exclusive") ||
        g.gameSlug.toLowerCase().includes("weeklymonthly-bundle")||
        g.gameSlug.toLowerCase().includes("mobile-legends-philippines888")


    );

    // Available only
    const availableGames = filteredGames.filter(
      (g: any) => g.gameAvailablity === true
    );

    // Group by publisher
    const publishers = filteredGames.reduce((acc: any, game: any) => {
      const key = game.gameFrom || "Unknown";
      acc[key] = acc[key] || [];
      acc[key].push(game);
      return acc;
    }, {});

    // Group by region tag
    const regionalGames = filteredGames.reduce((acc: any, game: any) => {
      const region = game.tagId?.tagName || "Global";
      acc[region] = acc[region] || [];
      acc[region].push(game);
      return acc;
    }, {});

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      ...data,
      data: {
        ...data.data,

        games: filteredGames,
        // category: filteredCategories,
        totalGames: filteredGames.length,

        // 🔥 GAME SECTIONS
        featuredGames,
        mlbbVariants,
        // availableGames,
        // publishers,
        // regionalGames,

        // 🔥 OTT SECTION
        // otts: {
        //   title: "OTT Subscriptions",
        //   items: OTTS.filter((o) => o.available),
        //   total: OTTS.filter((o) => o.available).length,
        // },
        outOfStockSlugs,

        // 🔥 MEMBERSHIP SECTION
        memberships: {
          title: "Memberships & Passes",
          items: MEMBERSHIPS.map((m) => ({
            ...m,
            available: !manualOosList.includes(m.slug),
            isOutOfStock: manualOosList.includes(m.slug),
          })),
          total: MEMBERSHIPS.length,
        },

        // 🔥 VOUCHER SECTION
        vouchers: {
          title: "Premium Vouchers",
          items: VOUCHERS.map((v) => ({
            ...v,
            available: !manualOosList.includes(v.slug),
            isOutOfStock: manualOosList.includes(v.slug),
          })),
          total: VOUCHERS.length,
        },

        // 🔥 SERVICE SECTION
        services: {
          title: "Premium Services",
          items: SERVICES.map((s) => ({
            ...s,
            available: !manualOosList.includes(s.slug),
            isOutOfStock: manualOosList.includes(s.slug),
          })),
          total: SERVICES.length,
        },

      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error("GAME API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch game list",
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  }
}
