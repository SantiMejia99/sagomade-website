import { useState, useEffect, useMemo } from 'react';
// import { ArrowLeft } from 'lucide-react';
// import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import TypographyPlayground from '@/components/ui/font-playground';
import projectData from '@/data/projectData.json';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { DetailDialog } from '@/components/ui/detail-dialog';
import { ChapterScrubber, type Chapter } from '@/components/ui/chapter-scrubber';

// Define the TypeScript type
type ProjectData = Record<
  string,
  {
    title: string;
    content: string;
    subtitle: string;
    overview?: string; // Optional
    context: string[];
    problem?: string; // Optional
    research: string[];
    process?: string; // Optional
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
    accordionContextData?: {
      title: string;
      content: string;
    }[];
    accordionResearchData?: {
      title: string;
      content: string;
    }[];
    accordionSolutionData?: {
      title: string;
      content: string;
    }[];
    accordionImpactData?: {
      title: string;
      content: string;
    }[];
  }
>;

// imported data to type
const typedProjectData = projectData as ProjectData;

/** Section titles, in the order they appear down the case study. */
const PROJECT_SECTIONS: { id: string; title: string }[] = [
  { id: 'project-details', title: 'Project Details' },
  { id: 'overview', title: 'Overview' },
  { id: 'vision', title: 'The Vision' },
  { id: 'problem', title: 'Problem' },
  { id: 'research', title: 'Research & Insights' },
  { id: 'process', title: 'Process' },
  { id: 'solution', title: 'Solution' },
  { id: 'impact', title: 'Impact & Reflection' },
];

/**
 * Flatten a section's markup into one line for the scrubber card.
 * List items are stored as HTML, and the card only has room for plain text.
 */
function plainExcerpt(value: string | undefined, max = 140): string | undefined {
  if (!value) return undefined;
  const text = value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/**
 * One chapter per rendered heading, so the rail stays in lockstep with the page
 * no matter which project is open. Problem and Process are image-led and often
 * have no body copy; those cards show the title alone.
 */
function buildProjectChapters(project: ProjectData[string]): Chapter[] {
  const descriptionFor: Record<string, string | undefined> = {
    'project-details': [project.role, project.duration, project.year].filter(Boolean).join(' · '),
    overview: plainExcerpt(project.overview),
    vision: plainExcerpt(project.context[0]),
    problem: plainExcerpt(project.problem),
    research: plainExcerpt(project.research[0]),
    process: plainExcerpt(project.process),
    solution: plainExcerpt(project.solution[0]),
    impact: plainExcerpt(project.impact[0]),
  };

  return PROJECT_SECTIONS.map((section, index) => ({
    id: section.id,
    title: section.title,
    description: descriptionFor[section.id],
    meta: String(index + 1).padStart(2, '0'),
  }));
}

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { id } = params;
  const project = id ? typedProjectData[id] : undefined;
  const chapters = useMemo(() => (project ? buildProjectChapters(project) : []), [project]);

  console.log('ProjectPage rendered with id:', id);
  console.log('Available project IDs:', Object.keys(typedProjectData));
  console.log('Project data for this id:', typedProjectData[id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // The tick marked "current" is whichever section title has crossed the
  // reading line. Resize covers late-loading images shifting those titles.
  useEffect(() => {
    if (chapters.length === 0) return;

    const sectionIds = chapters.map(chapter => chapter.id);

    const sync = () => {
      // The last heading sits near the bottom of the page, so a high reading
      // line never reaches it. Drop the line once the user is at the end.
      const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const line = window.innerHeight * (distanceFromBottom < 160 ? 0.72 : 0.33);
      let next = 0;
      sectionIds.forEach((sectionId, index) => {
        const heading = document.getElementById(sectionId);
        if (heading && heading.getBoundingClientRect().top <= line) next = index;
      });
      setCurrentIndex(prev => (prev === next ? prev : next));
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [chapters]);

  if (!project) {
    return <div className='container mx-auto py-10 px-4'>Project not found.</div>;
  }

  const scrollToChapter = (chapter: Chapter) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(chapter.id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };
  const isTypographyProject =
    project.category?.toLowerCase().includes('type') || project.title?.toLowerCase().includes('typography');

  return (
    <div className='bg-background'>
      {/* Fixed to the viewport so the rail stays put while the case study scrolls.
          The card opens inward; the ticks themselves stay in the left gutter. */}
      <aside className='fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 lg:block xl:left-6'>
        <ChapterScrubber
          chapters={chapters}
          currentIndex={currentIndex}
          side='right'
          rowHeight={18}
          label='Project sections'
          onSelect={scrollToChapter}
        />
      </aside>
      <main className='container mx-auto pt-22 md:pt-30 pb-16 px-4'>
        {/* Back Navigation
        <div className='mb-4 flex justify-center'>
          <Link
            to='/'
            className='inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group'
          >
            <ArrowLeft className='h-4 w-4 transform group-hover:-translate-x-1 transition-transform duration-200' />
            <span>Back to work</span>
          </Link>
        </div> */}

        {/* Hero Section */}
        <section
          className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className='space-y-4'>
            <div className='space-y-2 text-center mb-16'>
              <h1 className='text-4xl font-bold tracking-tighter leading-tight'>{project.title}</h1>
              <div className='inline-flex items-center space-x-3 text-muted-foreground mt-2'>
                <span>{project.subtitle}</span>
                <span className='text-sm'>■</span>
                <span>{project.year}</span>
                <span className='text-sm'>■</span>
                <span>{project.category}</span>
              </div>
            </div>

            {/* Hero Image */}
            {project.heroImage !== undefined && project.images[project.heroImage] && (
              <div className='mt-8'>
                <Image
                  src={project.images[project.heroImage]}
                  alt={`${project.title} hero image`}
                  aspectRatio='natural'
                  className='w-full h-200 object-cover rounded-none'
                />
              </div>
            )}
          </div>
        </section>

        {/* Project Details - 2 COLUMNS */}
        <section className='mb-16 text-left'>
          <div className='grid md:grid-cols-2 gap-12'>
            {/* Left Column: Project Metadata */}
            <div className='space-y-8'>
              <div>
                <h3
                  id='project-details'
                  className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'
                >
                  Project Details
                </h3>
                <div className='space-y-4'>
                  <div>
                    <div className='font-bold mb-2 tracking-tight text-muted-foreground'>Role</div>
                    <div className='text-muted-foreground/60'>{project.role}</div>
                  </div>
                  <div>
                    <div className='font-bold mb-2 tracking-tight text-muted-foreground'>Team</div>
                    <div className='text-muted-foreground/60'>{project.team}</div>
                  </div>
                  <div>
                    <div className='font-bold mb-2 tracking-tight text-muted-foreground'>Duration</div>
                    <div className='text-muted-foreground/60'>{project.duration}</div>
                  </div>
                  <div>
                    <div className='font-bold mb-2 tracking-tight text-muted-foreground'>Tools & Technologies</div>

                    <div className='text-muted-foreground/60 space-y-2'>
                      {project.technologies.map((tech, index) => {
                        const [category, ...details] = tech.split(':');
                        return (
                          <div key={index}>
                            <span className='font-semibold text-muted-foreground'>{category}:</span>{' '}
                            {details.join(':').trim()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Overview */}

            <div className='space-y-6'>
              <div>
                <h2 id='overview' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
                  Overview
                </h2>
                <p className='text-muted-foreground/60 mb-6 leading-relaxed whitespace-pre-line'>{project.overview}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Playground for Typography Projects */}
        {isTypographyProject && (
          <section className='mb-16'>
            <TypographyPlayground fontWeight='400' />
          </section>
        )}

        {/* FULL WIDTH SECTIONS */}
        <section className='space-y-12 text-left'>
          <div>
            {/* Overview Image */}
            {project.overviewImage !== undefined && project.images[project.overviewImage] && (
              <Image
                src={project.images[project.overviewImage]}
                alt={`${project.title} overview`}
                aspectRatio='natural'
                className='w-full h-200 object-cover rounded-none mt-10'
              />
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px my-20 bg-gray-300 opacity-20'></div>

          {/* Context */}
          <div>
            <div className='flex items-center justify-between w-full'>
              <h2 id='vision' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
                The Vision
              </h2>
              {/* Dialog Context Section */}
              {project.accordionContextData && (
                <div className='mb-4 space-y-2'>
                  {project.accordionContextData.map((item, index) => (
                    <DetailDialog key={index} item={item} />
                  ))}
                </div>
              )}
            </div>
            <ul className='space-y-6 mb-8 list-none mt-6 text-base'>
              {project.context.map((point, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='text-xs text-muted-foreground/40 shrink-0 flex items-center justify-center h-6 w-4'>
                    ■
                  </span>
                  <div
                    className='text-muted-foreground/60 leading-relaxed [&>strong]:text-foreground [&>strong]:font-bold'
                    dangerouslySetInnerHTML={{ __html: point }}
                  />{' '}
                </li>
              ))}
            </ul>
            {/* Context Image */}
            {project.contextImage !== undefined && project.images[project.contextImage] && (
              <div className='mt-6'>
                <Image
                  src={project.images[project.contextImage]}
                  alt={`${project.title} context`}
                  aspectRatio='natural'
                  className='w-full h-200 object-cover rounded-none mt-10'
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px my-20 bg-gray-300 opacity-20'></div>

          {/* Problem */}
          <div>
            <h2 id='problem' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
              Problem
            </h2>
            <p className='text-muted-foreground/60'>{project.problem}</p>

            {/* Problem Image */}
            {project.problemImage !== undefined && project.images[project.problemImage] && (
              <div className='mt-2'>
                <Image
                  src={project.images[project.problemImage]}
                  alt={`${project.title} problem`}
                  aspectRatio='natural'
                  className='w-full h-200 object-cover rounded-none'
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px my-20 bg-gray-300 opacity-20'></div>

          {/* Research & Insights*/}
          <div>
            <div className='flex items-center justify-between w-full'>
              <h2 id='research' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
                Research & Insights
              </h2>
              {/* Dialog Context Section */}
              {project.accordionResearchData && (
                <div className='mb-4 space-y-2'>
                  {project.accordionResearchData.map((item, index) => (
                    <DetailDialog key={index} item={item} />
                  ))}
                </div>
              )}
            </div>
            <ul className='space-y-6 mb-8 list-none mt-6 text-base'>
              {project.research.map((point, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='text-xs text-muted-foreground/40 shrink-0 flex items-center justify-center h-6 w-4'>
                    ■
                  </span>
                  <div
                    className='text-muted-foreground/60 leading-relaxed [&>strong]:text-foreground [&>strong]:font-bold'
                    dangerouslySetInnerHTML={{ __html: point }}
                  />{' '}
                </li>
              ))}
            </ul>
            {/* Research Image */}
            {project.researchImage !== undefined && project.researchImage.length > 0 && (
              <div className='mt-10'>
                {project.researchImage.map(
                  (imageIndex, idx) =>
                    project.images[imageIndex] && (
                      <Image
                        key={idx}
                        src={project.images[imageIndex]}
                        alt={`${project.title} solution ${idx + 1}`}
                        aspectRatio='natural'
                        className='w-full h-full object-cover rounded-none mt-4'
                      />
                    )
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px my-20 bg-gray-300 opacity-20'></div>

          {/* Process */}
          <div>
            <h2 id='process' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
              Process
            </h2>
            <p className='text-muted-foreground/60'>{project.process}</p>

            {/* Process Image */}
            {project.processImage !== undefined && project.images[project.processImage] && (
              <div className='mt-2'>
                <Image
                  src={project.images[project.processImage]}
                  alt={`${project.title} process`}
                  aspectRatio='natural'
                  className='w-full h-200 object-cover rounded-none mt-10'
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px mt-10 mb-20 bg-gray-300 opacity-20 '></div>

          {/* Solution */}
          <div>
            <div className='flex items-center justify-between w-full'>
              <h2 id='solution' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
                Solution
              </h2>
              {/* Dialog Context Section */}
              {project.accordionSolutionData && (
                <div className='mb-4 space-y-2'>
                  {project.accordionSolutionData.map((item, index) => (
                    <DetailDialog key={index} item={item} />
                  ))}
                </div>
              )}
            </div>
            <ul className='space-y-6 mb-8 list-none mt-6 text-base'>
              {project.solution.map((point, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='text-xs text-muted-foreground/40 shrink-0 flex items-center justify-center h-6 w-4'>
                    ■
                  </span>
                  <div
                    className='text-muted-foreground/60 leading-relaxed [&>strong]:text-foreground [&>strong]:font-bold'
                    dangerouslySetInnerHTML={{ __html: point }}
                  />{' '}
                </li>
              ))}
            </ul>
            {/* Solution Image */}
            {project.solutionImage !== undefined && project.solutionImage.length > 0 && (
              <div className='mt-2'>
                {project.solutionImage.map(
                  (imageIndex, idx) =>
                    project.images[imageIndex] && (
                      <Image
                        key={idx}
                        src={project.images[imageIndex]}
                        alt={`${project.title} solution ${idx + 1}`}
                        aspectRatio='natural'
                        className='w-full h-full object-cover rounded-none mt-4'
                      />
                    )
                )}
              </div>
            )}

            {/* Code Snippet, rendered if codeSnippet exists */}
            {project.codeSnippet && (
              <div className='mt-12'>
                {(() => {
                  const maxHeight = isCodeExpanded ? 'max-h-none' : 'max-h-120';

                  return (
                    <div className='relative'>
                      <div
                        className={`relative rounded-lg border bg-muted/50 overflow-hidden ${maxHeight} transition-all duration-300`}
                      >
                        <div className='px-4 py-2 border-b text-xs font-mono text-muted-foreground'>python</div>
                        <pre className='overflow-x-auto p-4'>
                          <code className='font-mono text-sm text-foreground whitespace-pre'>
                            {project.codeSnippet}
                          </code>
                        </pre>
                      </div>

                      {/* Gradient overlay when collapsed */}
                      {!isCodeExpanded && (
                        <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none' />
                      )}

                      {/* Expand/Collapse button */}
                      <div className='mt-4'>
                        <Button
                          variant='outline'
                          className='justify-start'
                          onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                        >
                          {isCodeExpanded ? 'Show less' : 'Expand to read more'}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px my-20 bg-gray-300 opacity-30 '></div>

          {/* Impact */}
          <div>
            <div className='flex items-center justify-between w-full'>
              <h2 id='impact' className='scroll-mt-32 text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>
                Impact & Reflection
              </h2>
              {/* Dialog Context Section */}
              {project.accordionResearchData && (
                <div className='mb-4 space-y-2'>
                  {project.accordionResearchData.map((item, index) => (
                    <DetailDialog key={index} item={item} />
                  ))}
                </div>
              )}
            </div>
            <ul className='space-y-6 mb-8 list-none mt-6 text-base'>
              {project.impact.map((point, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <span className='text-xs text-muted-foreground/40 shrink-0 flex items-center justify-center h-6 w-4'>
                    ■
                  </span>
                  <div
                    className='text-muted-foreground/60 leading-relaxed [&>strong]:text-foreground [&>strong]:font-bold'
                    dangerouslySetInnerHTML={{ __html: point }}
                  />
                </li>
              ))}
            </ul>
            {/* Impact Image */}
            {project.impactImage !== undefined && project.images[project.impactImage] && (
              <div className='mt-6'>
                <Image
                  src={project.images[project.impactImage]}
                  alt={`${project.title} impact`}
                  aspectRatio='4/3'
                  className='w-full h-full object-cover rounded-none mt-20'
                />
              </div>
            )}
          </div>

          {/* Link to Portfolio */}
          <div className='space-y-3 flex justify-center mb-6'>
            {project.liveUrl && (
              <InteractiveHoverButton href={project.liveUrl}>Download My Catalogue</InteractiveHoverButton>
            )}
          </div>
        </section>
      </main>
      {/* Blur overlay */}
      <ProgressiveBlur
        position='bottom'
        height='10%'
        className='fixed bottom-0 left-0 right-0 pointer-events-none hidden lg:block'
      />
    </div>
  );
}
