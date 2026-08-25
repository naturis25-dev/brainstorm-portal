const express = require('express');
const router = express.Router();

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida",
  "Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
  "Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia"
];

const CA_PROVINCES = [
  "Ontario","Quebec","British Columbia","Alberta","Manitoba","Saskatchewan","Nova Scotia",
  "New Brunswick","Newfoundland and Labrador","Prince Edward Island","Northwest Territories","Yukon","Nunavut"
];

const STEEL_TYPES = [
  "Structural Steel Detailing","Connection Design","Miscellaneous Steel Detailing",
  "Steel Fabrication Drawings","BIM Modeling (Tekla)","Erection Drawings","Shop Drawings",
  "Advance Steel Modeling","Rebar Detailing","Staircase & Railing Detailing"
];

const BUILDING_TYPES = [
  "Warehouse","Industrial Plant","Commercial Tower","Bridge Structure","Parking Structure",
  "Manufacturing Facility","Data Center","Retail Mall","Hospital Building","School Campus",
  "Airport Terminal","Sports Stadium","Oil & Gas Refinery","Power Plant","Miscellaneous Steel Structure"
];

const CATEGORY_MAP = {
  "Warehouse":"Warehouse",
  "Industrial Plant":"Industrial",
  "Commercial Tower":"Commercial",
  "Bridge Structure":"Bridge",
  "Parking Structure":"Commercial",
  "Manufacturing Facility":"Manufacturing",
  "Data Center":"Data Center",
  "Retail Mall":"Commercial",
  "Hospital Building":"Healthcare",
  "School Campus":"Institutional",
  "Airport Terminal":"Airport",
  "Sports Stadium":"Stadium",
  "Oil & Gas Refinery":"Oil & Gas",
  "Power Plant":"Power Plant",
  "Miscellaneous Steel Structure":"Misc Steel"
};

const CATEGORIES = ["All","Industrial","Commercial","Healthcare","Airport","Warehouse","Stadium","Institutional","Manufacturing","Data Center","Oil & Gas","Power Plant","Bridge","Misc Steel"];

const STOCK_IMAGES = [
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/f09a395931a49cdfe18e7b8e3642719a948a8161.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5f66f61784639f8ca3fdc72688d0a359db9a2e10.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/10704adff79c658bcde85afa6a5368001b5a04b1.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a60dd51048a0fa1501a96ec8772ea8a96bca15b5.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/e24989209420ce6d2a866cec21a972013030311b.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4feda5df429a625b1f042e7ac02702e51eee69bd.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/714cbb495c4ce9a2956e2c5fe9a035c94a1770fc.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/3f3b7b6bea89c28d508ab32d1bbe079d0e7e43fb.jpg",
  "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/b37cc0001cd13e50f060f3a1a71ba70d5fc695aa.jpg"
];

// GET /api/metadata
router.get('/', (req, res) => {
  res.json({
    usStates: US_STATES,
    caProvinces: CA_PROVINCES,
    steelTypes: STEEL_TYPES,
    buildingTypes: BUILDING_TYPES,
    categoryMap: CATEGORY_MAP,
    categories: CATEGORIES,
    stockImages: STOCK_IMAGES
  });
});

module.exports = {
  router,
  US_STATES,
  CA_PROVINCES,
  STEEL_TYPES,
  BUILDING_TYPES,
  CATEGORY_MAP,
  CATEGORIES,
  STOCK_IMAGES
};
