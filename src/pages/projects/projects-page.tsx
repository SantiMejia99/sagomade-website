import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import TypographyPlayground from '@/components/ui/font-playground';
import projectData from '@/data/projectData.json';

// Define the TypeScript type
type ProjectData = Record<
  string,
  {
    title: string;
    content: string;
    subtitle: string;
    overview: string;
    context: string;
    problem: string;
    research: string;
    process: string;
    solution: string;
    impact: string;
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
  }
>;

// imported data to type
const typedProjectData = projectData as ProjectData;

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const { id } = params;

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

  if (!id || !typedProjectData[id]) {
    return <div className='container mx-auto py-10 px-4'>Project not found.</div>;
  }

  const project = typedProjectData[id];
  const isTypographyProject =
    project.category?.toLowerCase().includes('type') || project.title?.toLowerCase().includes('typography');

  return (
    <div className='bg-background'>
      <main className='container mx-auto pt-30 pb-16 px-4'>
        {/* Back Navigation */}
        <div className='mb-4'>
          <Link
            to='/'
            className='inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group'
          >
            <ArrowLeft className='h-4 w-4 transform group-hover:-translate-x-1 transition-transform duration-200' />
            <span>Back to work</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section
          className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className='space-y-4'>
            <div className='space-y-2 text-center mb-20'>
              <h1 className='text-4xl md:text-6xl font-bold tracking-tighter leading-tight'>{project.title}</h1>
              <div className='inline-flex items-center space-x-3 text-muted-foreground mt-4'>
                <span>{project.subtitle}</span>
                <span>■</span>
                <span>{project.year}</span>
                <span>■</span>
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
                <h3 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Project Details</h3>
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
                <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Overview</h2>
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
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Context</h2>
            <p className='text-muted-foreground/60 mb-6 leading-relaxed whitespace-pre-line'>{project.context}</p>

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
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Problem</h2>
            <p className='text-muted-foreground/60'>{project.problem}</p>

            {/* Problem Image */}
            {project.problemImage !== undefined && project.images[project.problemImage] && (
              <div className='mt-6'>
                <Image
                  src={project.images[project.problemImage]}
                  alt={`${project.title} problem`}
                  aspectRatio='natural'
                  className='w-full h-200 object-cover rounded-none mt-10'
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-full h-px my-20 bg-gray-300 opacity-20'></div>

          {/* Research & Insights*/}
          <div>
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Research & Insights</h2>
            <p className='text-muted-foreground/60 mb-6 leading-relaxed whitespace-pre-line'>{project.research}</p>
            {/* Research Image */}
            {project.researchImage !== undefined && project.researchImage.length > 0 && (
              <div className='mt-20'>
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
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Process</h2>
            <p className='text-muted-foreground/60'>{project.process}</p>

            {/* Process Image */}
            {project.processImage !== undefined && project.images[project.processImage] && (
              <div className='mt-6'>
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
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Solution</h2>
            <p className='text-muted-foreground/60 mb-6 leading-relaxed whitespace-pre-line'>{project.solution}</p>
            {/* Solution Image */}
            {project.solutionImage !== undefined && project.solutionImage.length > 0 && (
              <div className='mt-20'>
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
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Impact & Reflection</h2>
            <p className='text-muted-foreground/60 mb-6 leading-relaxed whitespace-pre-line'>{project.impact}</p>
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

          {/* Links */}
          <div className='space-y-3'>
            {project.liveUrl && (
              <Button asChild variant='outline' className='justify-start'>
                <a href={project.liveUrl} target='_blank' rel='noopener noreferrer'>
                  <ExternalLink className='h-4 w-4' /> Download My Catalogue
                </a>
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
