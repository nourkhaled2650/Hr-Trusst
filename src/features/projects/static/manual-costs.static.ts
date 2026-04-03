import type { ManualCostEntry, CostCategory } from "../types/projects.types";

// PLACEHOLDER: static data used until GET /api/admin/projects/{id}/manual-costs is implemented
export const STATIC_MANUAL_COSTS: ManualCostEntry[] = [
  {
    costId:      1,
    projectId:   1,
    categoryId:  2,
    description: "Flight and hotel for client kick-off meeting in Cairo",
    amount:      1800,
    costDate:    "2026-01-14",
    createdAt:   "2026-01-15T09:30:00",
  },
  {
    costId:      2,
    projectId:   1,
    categoryId:  5,
    description: "Figma Pro annual subscription — design team",
    amount:      600,
    costDate:    "2026-01-20",
    createdAt:   "2026-01-20T11:00:00",
  },
  {
    costId:      3,
    projectId:   1,
    categoryId:  7,
    description: "Freelance UX review and accessibility audit",
    amount:      2400,
    costDate:    "2026-02-10",
    createdAt:   "2026-02-10T14:15:00",
  },
  {
    costId:      4,
    projectId:   1,
    categoryId:  3,
    description: "Team training workshop — agile delivery",
    amount:      1600,
    costDate:    "2026-02-24",
    createdAt:   "2026-02-24T10:45:00",
  },
];

// PLACEHOLDER: static data used until GET /api/admin/projects/cost-categories is implemented
export const STATIC_COST_CATEGORIES: CostCategory[] = [
  { categoryId: 1,  categoryName: "Equipment & Hardware",  active: true },
  { categoryId: 2,  categoryName: "Travel & Accommodation", active: true },
  { categoryId: 3,  categoryName: "Training & Development", active: true },
  { categoryId: 4,  categoryName: "Marketing & Advertising", active: true },
  { categoryId: 5,  categoryName: "Software Licenses",      active: true },
  { categoryId: 6,  categoryName: "Legal & Compliance",     active: true },
  { categoryId: 7,  categoryName: "Consulting & Freelance", active: true },
  { categoryId: 8,  categoryName: "Infrastructure & Hosting", active: true },
  { categoryId: 9,  categoryName: "Office Supplies",        active: true },
  { categoryId: 10, categoryName: "Miscellaneous",          active: true },
];
