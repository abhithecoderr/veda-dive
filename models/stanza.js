import mongoose from "mongoose";

const StanzaSchema = new mongoose.Schema(
  {
    stanza_num: {
      type: Number,
      required: [true, "Stanza number is required"],
    },
    hymn_num: {
      type: Number,
      required: [true, "Hymn number is required"],
    },

    mandala_num: {
      type: Number,
      required: [true, "Mandala number is required"],
    },

    location_index: {
      type: String,
      required: [true, "Canonical location (M.H.S) is required"],
      unique: true,
      trim: true,
    }, // Id References

    mandala_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandala",
      required: [true, "Mandala reference is required"],
    },

    hymn_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hymn",
      required: [true, "Hymn reference is required"],
    },

    text_sanskrit: {
      type: [String], // Raw Sanskrit text (Devanagari), each element is a line
      default: [],
    },

    transliterations: {
      type: [
        {
          id: { type: String, required: true, trim: true }, // e.g., 'version_lubotsky'
          source: { type: String, trim: true }, // e.g., 'Lubotsky (Zurich)'
          language: { type: String, default: "san-Latn-x-ISO-15919" }, // The transliteration standard
          form: { type: [String], default: [] }, // The transliterated text (array of lines/padas)
          metricalData: { type: [String], default: [] }, // Optional: metrical information
        },
      ],
      default: [],
    },

    translations: {
      type: [
        {
          id: { type: String, required: true, trim: true }, // e.g., 'translation_griffith'
          source: { type: String, required: true, trim: true }, // e.g., 'Griffith'
          language: { type: String, default: "eng" }, 
          form: { type: [String], default: [] }, // The translated text (array of lines/sentences)
        },
      ],
      default: [],
    },

    pada_list: {
      type: [
        {
          id: { type: String, required: true },
          index: { type: Number },
          words: {
            type: [
              {
                form: { type: String, required: true },
                lemma: { type: String, required: true },
                lemma_type: { type: String },
                index: { type: Number },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
      required: true,
    },

    stanza_words: {
      type: [
        {
          form: { type: String, required: true },
          lemma: { type: String, required: true },
          lemma_type: { type: String },
          pada_index: { type: String },
          word_index: { type: Number },
          props: { type: Object },
          sanskrit_text: { type: String },
          word_meaning: { type: String },
        },
      ],
      default: [],
      required: true,
    },

    stanza_meter: {
      type: String,
      trim: true,
    },

    syllable_count: {
      type: [Number],  // e.g. [8, 8, 8, 8]
      default: [],
    },

    pada_count: {
      type: Number,
      required: true,
    },

    line_count: {
      type: Number,
      required: true,
    },

    stanza_summary: {
      type: String,
      default: null,
    },
    label_sanskrit: {
      type: String,
      default: "Mantra",
      trim: true,
    },

    label_english: {
      type: String,
      default: "Stanza",
      trim: true,
    },
    audio_line_timings: [
      {
        line_num: { type: Number, required: true }, // Line number within stanza audio
        start_ms: { type: Number, required: true },
        end_ms: { type: Number, required: true },
        duration_ms: { type: Number, required: true },
      },
    ],

    audio_timings_global: {
      type: {
        start_ms: { type: Number, required: true }, // Stanza start time in HYMN audio
        end_ms: { type: Number, required: true }, // Stanza end time in HYMN audio
      },
      default: null, // Null if no global timing is available
    },
  },
  {
    collection: "stanzas",
    timestamps: true,
  }
);

StanzaSchema.index({ mandala_num: 1, hymn_num: 1, stanza_num: 1 });

StanzaSchema.index({
  text_sanskrit: "text",
});

const Stanza = mongoose.model("Stanza", StanzaSchema);

export default Stanza;
