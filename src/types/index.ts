/** A titled block of (HTML) text shown in a DetailDialog. */
export interface DetailItem {
  title: string;
  content: string;
}

/**
 * One case study in `src/data/projectData.json`, keyed by project id.
 * Image fields are indexes into `images`. Bullet-list fields may contain inline HTML.
 */
export interface ProjectDetail {
  title: string;
  content: string;
  subtitle: string;
  overview?: string;
  context: string[];
  problem?: string;
  research: string[];
  process?: string;
  solution: string[];
  impact: string[];
  technologies: string[];
  role: string;
  duration: string;
  team: string;
  year: string;
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  images: string[];
  heroImage?: number;
  overviewImage?: number;
  galleryImages?: number[];
  contextImage?: number;
  problemImage?: number;
  researchImage?: number[];
  processImage?: number;
  solutionImage?: number[];
  impactImage?: number;
  codeSnippet?: string;
  accordionContextData?: DetailItem[];
  accordionResearchData?: DetailItem[];
  accordionSolutionData?: DetailItem[];
  accordionImpactData?: DetailItem[];
}

export type ProjectDataMap = Record<string, ProjectDetail>;

/** A tile on the home page grid (`src/data/homeProjects.json`). */
export interface HomeProject {
  id: number;
  header: string;
  type: string;
}

/** One logged day in `src/data/designActivities.json` (date is YYYY-MM-DD). */
export interface DesignActivity {
  date: string;
  weight: number;
  entry: string;
}
