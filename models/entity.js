import mongoose from "mongoose";

const EntitySchema = new mongoose.Schema(
  {
    name_sanskrit: {
      type: String,
      required: [true, "Sanskrit name is required"],
      unique: true,
      trim: true,
    },

    name_english: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Deity", "Concept", "Human", "Object", "Animal"],
      trim: true,
    },


    bio_summary: {
      type: String,
      default: '',
    },

    associated_mandalas: {
      type: [Number],
      default: [],
    },

    associated_hymns: {
      type: [String],
      default: [],
    },
    // A list of the primary domains or concepts associated with the Deity (e.g., ['Fire', 'Sacrifice', 'Messenger'])
    primary_domains: {
      type: [String],
      default: [],
    },

    // Total count of hymns specifically addressed to this Deity
    hymn_count: {
      type: Number,
      default: 0,
    },

    label_sanskrit: {
      type: String,
      default: "Deva",
      trim: true,
    },

    label_english: {
      type: String,
      default: "Diety",
      trim: true,
    },

    image_url: {
      type: String,
      default: '',
      trim: true,
    },
    cloudinaryId: String,

    // --- NEW FIELDS FOR VIDEO ---
  video_url: {
    type: String,
    default: null
  },
  cloudinaryVideoId: String,
  },
  {
    collection: "entities",
    timestamps: true,
  }
);
EntitySchema.index({ hymn_count: -1 });

EntitySchema.index({
    name_sanskrit: 'text',
    name_english: 'text',
    primary_domains: 'text',
    category: 'text',
});

const Entity = mongoose.model("Entity", EntitySchema);

export default Entity;
