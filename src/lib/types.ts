export type Format = "Live online" | "In person";

export type Grade = "K–5" | "6–8" | "9–12";

export const GRADES: Grade[] = ["K–5", "6–8", "9–12"];

export const FORMATS: Format[] = ["Live online", "In person"];

export const CATEGORIES = [
  "Literacy",
  "EdTech & AI",
  "ESL & ELL",
  "Special education",
  "Classroom management",
  "Leadership",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Which illustration to draw when a listing has no uploaded image. */
export type CoverType = "books" | "tech" | "language" | "classroom" | "inclusive" | "leadership";

export interface Course {
  id: number;
  title: string;
  category: Category;
  trainer: string;
  role: string;
  format: Format;
  hours: number;
  /** Price per participant, in USD. */
  price: number;
  grades: Grade[];
  tags: string[];
  description: string;
  outcomes: string[];
  color: string;
  accent: string;
  type: CoverType;
  image?: string;
}

export interface BookingRequest {
  id: number;
  courseId: number;
  course: string;
  trainer: string;
  name: string;
  email: string;
  audience: string;
  participants: number;
  school: string;
  date: string;
  message: string;
}

export interface CatalogFilters {
  query: string;
  category: Category | "All topics";
  formats: Format[];
  grade: Grade | "";
  duration: "" | "short" | "long";
  maxPrice: number | null;
  sort: "recommended" | "low" | "high" | "duration";
  savedOnly: boolean;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  query: "",
  category: "All topics",
  formats: [],
  grade: "",
  duration: "",
  maxPrice: null,
  sort: "recommended",
  savedOnly: false,
};
