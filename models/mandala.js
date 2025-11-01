import mongoose from "mongoose";

const MandalaSchema = new mongoose.Schema(
  {
    mandala_num: {
      type: Number,
      required: [true, "Mandala number is required"],
      min: 1,
      max: 10,
      unique: true,
    },
    mandala_type: {
      type: String,
      default: "",
    },

    introduction_summary: {
      type: String,
      default: "",
    },

    // Total count of Hymns/Suktas in this Mandala
    hymn_count: {
      type: Number,
      default: 0,
    },

    associated_rishis: {
      type: [String], // Array of strings
      default: [], // Default is an empty array
    },

    associated_deities: {
      type: [String], // Array of strings
      default: [], // Default is an empty array
    },

    associated_deities_num: {
      type: Number,
      default: 0,
    },
    associated_rishis_num: {
      type: Number,
      default: 0,
    },
    label_sanskrit: {
      type: String,
      required: [true, "Sanskrit label is required"],
      default: "Mandala",
      trim: true,
    },

    label_english: {
      type: String,
      required: [true, "English label is required"],
      default: "Book",
      trim: true,
    },
  },
  {
    collection: "mandalas",
    timestamps: true,
  }
);

MandalaSchema.index({ mandala_num: 1 });

const Mandala = mongoose.model("Mandala", MandalaSchema);

export default Mandala;
