
import express from "express";
import Mandala from "../models/mandala.js";
import Entity from "../models/entity.js";
import Rishi from "../models/rishi.js";
import Hymn from "../models/hymn.js";

const router = express.Router();

async function renderReadPage(req, res, viewSegment) {
  const activeViewMode = viewSegment || "mandalas";

  try {
    const [mandalas, rishis, entities] = await Promise.all([
      Mandala.find({}).sort({ mandala_num: 1 }).lean(),
      Rishi.find({ name_sanskrit: { $ne: "Others" } }).sort({ hymn_count: -1 }).lean(),
      Entity.find({
        category: { $in: ["Deity", "Concept", "Animal", "Object", "Human"] },
      })
        .sort({ hymn_count: -1 })
        .lean(),
    ]);

    res.render("read/index", {
      title: "Read | Explore the Vedas",
      activeNav: "Read",
      mandalas: mandalas,
      rishis: rishis,
      entities: entities,
      activeViewMode: activeViewMode,
    });
  } catch (err) {
    console.error("Error fetching all data for Read page:", err);
    res
      .status(500)
      .send("Server Error: Failed to load data for the Read section.");
  }
}

router.get("/", async (req, res) => {
  await renderReadPage(req, res, "mandalas");
});

router.get("/:viewType", async (req, res) => {
  const viewSegment = req.params.viewType.toLowerCase();
  await renderReadPage(req, res, viewSegment);
});

router.get("/mandala/:num", async (req, res) => {
  const mandalaNum = Number(req.params.num);

  const [mandala, hymns] = await Promise.all([
    Mandala.findOne({ mandala_num: mandalaNum }).lean(),
    Hymn.find({ mandala_num: mandalaNum }).sort({ hymn_num: 1 }).lean(),
  ]);

  if (!mandala) {
      return res.status(404).render("error/404", {
          title: "Mandala Not Found",
          message: `Mandala ${mandalaNum} could not be found.`,
          activeNav: "Read",
      });
  }

  res.render("read/hymn_list", {
    title: `Mandala ${req.params.num} Hymns`,
    pageTitle: `Hymns of Mandala ${req.params.num}`,
    activeNav: "Read",
    mandala: mandala,
    hymns: hymns,
    backUrlSegment: 'mandalas'
  });
});

async function renderEntityHymnList(req, res, category, paramName) {
  const entityNameParam = req.params[paramName];
  const entityName = decodeURIComponent(entityNameParam);

  try {
    const entity = await Entity.findOne({
      category: category,
      name_sanskrit: entityName,
    }).lean();

    if (!entity) {
      return res.status(404).render("error/404", {
        title: `${category} Not Found`,
        message: `The ${category.toLowerCase()} with the name '${entityName}' could not be found.`,
        activeNav: "Read",
      });
    }

    const hymns = await Hymn.find({
      associated_entities: {
        $elemMatch: {
          entity_id: entity._id,
        },
      },
    })
      .sort({ mandala_num: 1, hymn_num: 1 })
      .lean();

    let backUrlSegment;
    if (category === "Deity") {
        backUrlSegment = 'deities'; // Special case for 'Deity'
    } else if (category === "Human") {
        backUrlSegment = 'humans'; // Special case for 'Human'
    } else {
        backUrlSegment = `${category.toLowerCase()}s`; // General pluralization
    }

    res.render("read/entity_hymn_list", {
      title: `${entity.name_sanskrit} Hymns`,
      pageTitle: `Hymns dedicated to ${entity.name_sanskrit}`,
      activeNav: "Read",
      entity: entity,
      hymns: hymns,
      backUrlSegment: backUrlSegment // Use the corrected segment
    });
  } catch (err) {
    console.error(`Error fetching hymns for ${category} ${entityName}:`, err);
    res.status(500).send(`Server Error: Failed to load ${category.toLowerCase()} hymns.`);
  }
}


router.get("/deity/:deity", async (req, res) => {
  await renderEntityHymnList(req, res, "Deity", "deity");
});

router.get("/concept/:concept", async (req, res) => {
  await renderEntityHymnList(req, res, "Concept", "concept");
});

router.get("/object/:object", async (req, res) => {
	await renderEntityHymnList(req, res, "Object", "object");
});

router.get("/animal/:animal", async (req, res) => {
  await renderEntityHymnList(req, res, "Animal", "animal");
});

router.get("/human/:human", async (req, res) => {
	await renderEntityHymnList(req, res, "Human", "human");
});


router.get("/rishi/:rishi", async (req, res) => {
  const rishiNameParam = req.params.rishi;
  const rishiName = decodeURIComponent(rishiNameParam);

  try {
    const rishi = await Rishi.findOne({
      name_sanskrit: rishiName,
    }).lean();

    if (!rishi) {
      return res.status(404).render("error/404", {
        title: "Rishi Not Found",
        message: `The rishi with the name '${rishiName}' could not be found.`,
        activeNav: "Read",
      });
    }

    const hymns = await Hymn.find({
      associated_rishis: {
        $elemMatch: {
          rishi_id: rishi._id,
        },
      },
    })
      .sort({ mandala_num: 1, hymn_num: 1 })
      .lean();

    res.render("read/rishi_hymn_list", {
      title: `${rishi.name_sanskrit} Hymns`,
      pageTitle: `Hymns by ${rishi.name_sanskrit}`,
      activeNav: "Read",
      rishi: rishi,
      hymns: hymns,
      backUrlSegment: 'rishis' 
    });
  } catch (err) {
    console.error(`Error fetching hymns for rishi ${rishiName}:`, err);
    res.status(500).send("Server Error: Failed to load rishi hymns.");
  }
});


export default router;