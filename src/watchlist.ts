// A curated set of institutions the public emotionally trusts — the ones where
// "anyone can send email pretending to be them" actually lands as a story. The
// cron checks these and surfaces the spoofable ones. Add your own.

export interface Org {
  name: string;
  domain: string;
  category: string;
}

export const CATEGORIES: { key: string; label: string }[] = [
  { key: "childrens-hospital", label: "Children's hospitals" },
  { key: "charity", label: "Charities" },
  { key: "university", label: "Universities" },
  { key: "school-district", label: "School districts" },
  { key: "government", label: "Government" },
];

export const WATCHLIST: Org[] = [
  // children's hospitals
  { name: "St. Jude Children's Research Hospital", domain: "stjude.org", category: "childrens-hospital" },
  { name: "Boston Children's Hospital", domain: "childrenshospital.org", category: "childrens-hospital" },
  { name: "Children's Hospital of Philadelphia", domain: "chop.edu", category: "childrens-hospital" },
  { name: "Cincinnati Children's", domain: "cincinnatichildrens.org", category: "childrens-hospital" },
  { name: "Seattle Children's", domain: "seattlechildrens.org", category: "childrens-hospital" },
  { name: "Texas Children's Hospital", domain: "texaschildrens.org", category: "childrens-hospital" },
  { name: "Children's Healthcare of Atlanta", domain: "choa.org", category: "childrens-hospital" },
  { name: "Lurie Children's", domain: "luriechildrens.org", category: "childrens-hospital" },
  { name: "Nationwide Children's", domain: "nationwidechildrens.org", category: "childrens-hospital" },
  { name: "Children's National (DC)", domain: "childrensnational.org", category: "childrens-hospital" },
  // charities
  { name: "American Red Cross", domain: "redcross.org", category: "charity" },
  { name: "The Salvation Army", domain: "salvationarmyusa.org", category: "charity" },
  { name: "United Way", domain: "unitedway.org", category: "charity" },
  { name: "Habitat for Humanity", domain: "habitat.org", category: "charity" },
  { name: "Feeding America", domain: "feedingamerica.org", category: "charity" },
  { name: "Doctors Without Borders (US)", domain: "doctorswithoutborders.org", category: "charity" },
  { name: "Save the Children", domain: "savethechildren.org", category: "charity" },
  { name: "Goodwill", domain: "goodwill.org", category: "charity" },
  { name: "ASPCA", domain: "aspca.org", category: "charity" },
  { name: "Make-A-Wish", domain: "wish.org", category: "charity" },
  { name: "World Wildlife Fund (US)", domain: "worldwildlife.org", category: "charity" },
  { name: "St. Jude (ALSAC)", domain: "alsac.org", category: "charity" },
  // universities
  { name: "Harvard University", domain: "harvard.edu", category: "university" },
  { name: "MIT", domain: "mit.edu", category: "university" },
  { name: "Stanford University", domain: "stanford.edu", category: "university" },
  { name: "UC Berkeley", domain: "berkeley.edu", category: "university" },
  { name: "University of Michigan", domain: "umich.edu", category: "university" },
  { name: "University of Texas at Austin", domain: "utexas.edu", category: "university" },
  { name: "Ohio State University", domain: "osu.edu", category: "university" },
  { name: "Penn State", domain: "psu.edu", category: "university" },
  { name: "Arizona State University", domain: "asu.edu", category: "university" },
  { name: "University of Florida", domain: "ufl.edu", category: "university" },
  // school districts
  { name: "Los Angeles Unified", domain: "lausd.net", category: "school-district" },
  { name: "NYC Public Schools", domain: "schools.nyc.gov", category: "school-district" },
  { name: "Chicago Public Schools", domain: "cps.edu", category: "school-district" },
  { name: "Miami-Dade Schools", domain: "dadeschools.net", category: "school-district" },
  { name: "Clark County (Las Vegas)", domain: "ccsd.net", category: "school-district" },
  { name: "Houston ISD", domain: "houstonisd.org", category: "school-district" },
  { name: "Broward County Schools", domain: "browardschools.com", category: "school-district" },
  { name: "Hillsborough County Schools", domain: "hcps.net", category: "school-district" },
  // government
  { name: "IRS", domain: "irs.gov", category: "government" },
  { name: "Social Security Administration", domain: "ssa.gov", category: "government" },
  { name: "USPS", domain: "usps.com", category: "government" },
  { name: "Medicare", domain: "medicare.gov", category: "government" },
  { name: "FEMA", domain: "fema.gov", category: "government" },
  { name: "Veterans Affairs", domain: "va.gov", category: "government" },
  { name: "CDC", domain: "cdc.gov", category: "government" },
  { name: "FTC", domain: "ftc.gov", category: "government" },
];
