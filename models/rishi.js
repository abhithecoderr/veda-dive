import mongoose from "mongoose";

const RishiSchema = new mongoose.Schema(
  {
    name_sanskrit: {
      type: String,
      required: [true, "Sanskrit name is required"],
      unique: true,
      trim: true,
    },

    // The family or lineage this Rishi belongs to (e.g., 'Viśvāmitra' for Viśvāmitra Gāthin)
    family: {
      type: String,
      default: '',
      trim: true,
    },

    // The name of the father or predecessor Rishi (for genealogical context)
    son_of: {
      type: String,
      default: '',
      trim: true,
    },

    // A brief scholarly biography or introduction to the Rishi.
    bio_summary: {
      type: String,
      default: '',
    },

    // An array of Mandala numbers this Rishi is primarily associated with.
    associated_mandalas: {
      type: [Number],
      default: [],
    },

    associated_hymns: {
        type: [String],
        default: []
    },

    // A flag to identify major figures or family heads (e.g., Vasiṣṭha, Agastya)
    is_family_head: {
      type: Boolean,
      default: false,
    },

    // Total count of hymns specifically attributed to this Rishi
    hymn_count: {
      type: Number,
      default: 0,
    },

    // The formal Sanskrit label for the entity (e.g., 'Rishi')
    label_sanskrit: {
      type: String,
      default: "Rishi",
      trim: true,
    },

    // The universal English label for the entity (e.g., 'Seer' or 'Composer')
    label_english: {
      type: String,
      default: "Composer",
      trim: true,
    },
    image_url: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    collection: "rishis",
    timestamps: true,
  }
);

RishiSchema.index({ hymn_count: -1 });

RishiSchema.index({
    name_sanskrit: 'text',
    family: 'text',
    son_of: 'text',
});

const Rishi = mongoose.model("Rishi", RishiSchema);

export default Rishi;
