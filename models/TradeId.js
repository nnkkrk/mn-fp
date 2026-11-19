import mongoose from "mongoose";

const TradeIdSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    stockStatus: {
      type: String,
      enum: ["in_stock", "unstocked", "sold", "reserved"],
      default: "in_stock",
      index: true,
    },
    rent: {
      available: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        default: 0,
      },
      durationHours: {
        type: Number,
        default: 24,
      },
      isRented: {
        type: Boolean,
        default: false,
      },
      rentedAt: {
        type: Date,
        default: null,
      },
      availableAgainAt: {
        type: Date,
        default: null,
      },
      renterContact: {
        type: String,
        default: "",
      },
      renterNotes: {
        type: String,
        default: "",
      },
      conditions: {
        type: [String],
        default: [
          "No email / Moonton rebind",
          "Login only, no changes allowed",
          "Auto logout after rental period",
        ],
      },
    },
    rank: {
      current: { type: String, default: "Mythic" },
      highest: { type: String, default: "Mythic Glory" },
      stars: { type: Number, default: 0 },
    },
    account: {
      game: { type: String, default: "Mobile Legends: Bang Bang" },
      server: { type: String, default: "India" },
      accountAgeYears: { type: Number, default: 1 },
      loginType: { type: String, default: "Moonton" },
      rebindable: { type: Boolean, default: true },
    },
    game: {
      type: String,
      enum: ["mlbb", "coc", "bgmi", "freefire", "valorant", "other"],
      default: "mlbb",
      index: true,
    },
    gameName: {
      type: String,
      default: "Mobile Legends: Bang Bang",
      trim: true,
    },
    specs: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    bulletPoints: {
      type: [String],
      default: [],
    },
    heroes: {
      total: { type: Number, default: 0 },
    },
    skins: {
      total: { type: Number, default: 0 },
    },
    collection: {
      tier: { type: String, default: "" },
      points: { type: Number, default: 0 },
    },
    tags: {
      type: [String],
      default: [],
    },
    details: {
      type: String,
      default: "",
    },
    availability: {
      status: { type: String, default: "available" },
      holdAllowed: { type: Boolean, default: true },
    },
    dealer: {
      owner: { type: String, default: "TK" },
      contact: {
        whatsapp: { type: String, default: "" },
        telegram: { type: String, default: "" },
        instagram: { type: String, default: "" },
      },
    },
    media: {
      images: {
        type: [String],
        default: ["/logo.png"],
      },
      fallbackImage: {
        type: String,
        default: "/logo.png",
      },
    },
    meta: {
      verifiedByAdmin: { type: Boolean, default: true },
      views: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      featured: { type: Boolean, default: false },
    },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

TradeIdSchema.index({ "rent.available": 1 });
TradeIdSchema.index({ "rent.isRented": 1 });
TradeIdSchema.index({ "rent.availableAgainAt": 1 });

if (mongoose.models.TradeId) {
  delete mongoose.models.TradeId;
}

export default mongoose.model("TradeId", TradeIdSchema);
