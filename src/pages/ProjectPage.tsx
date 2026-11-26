import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CodeSnippet } from '@/components/project/CodeSnippet';
import {
  BulletList,
  ProjectImage,
  ProjectImageList,
  SectionDivider,
  SectionHeader,
} from '@/components/project/ProjectSectionParts';
import TypographyPlayground from '@/components/project/TypographyPlayground';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import projectData from '@/data/projectData.json';
import type { ProjectDataMap } from '@/types';

const projects = projectData as ProjectDataMap;

export default function ProjectPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [isVisible, setIsVisible] = useState(false);

  // Fade the hero in shortly after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const project = projects[id];
  if (!id || !project) {
    return <div className='container mx-auto py-10 px-4'>Project not found.</div>;
  }

  const isTypographyProject =
    project.category?.toLowerCase().includes('type') || project.title?.toLowerCase().includes('typography');

  return (
    <div className='bg-background'>
      <main className='container mx-auto pt-22 md:pt-30 pb-16 px-4'>
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

            <ProjectImage
              project={project}
              index={project.heroImage}
              alt={`${project.title} hero image`}
              aspectRatio='natural'
              className='w-full h-200 object-cover rounded-none'
              wrapperClassName='mt-8'
            />
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
                  <MetaItem label='Role'>{project.role}</MetaItem>
                  <MetaItem label='Team'>{project.team}</MetaItem>
                  <MetaItem label='Duration'>{project.duration}</MetaItem>
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
            <ProjectImage
              project={project}
              index={project.overviewImage}
              alt={`${project.title} overview`}
              aspectRatio='natural'
              className='w-full h-200 object-cover rounded-none mt-10'
            />
          </div>

          <SectionDivider className='my-20 opacity-20' />

          {/* Context */}
          <div>
            <SectionHeader title='The Vision' details={project.accordionContextData} />
            <BulletList points={project.context} />
            <ProjectImage
              project={project}
              index={project.contextImage}
              alt={`${project.title} context`}
              aspectRatio='natural'
              className='w-full h-200 object-cover rounded-none mt-10'
              wrapperClassName='mt-6'
            />
          </div>

          <SectionDivider className='my-20 opacity-20' />

          {/* Problem */}
          <div>
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Problem</h2>
            <p className='text-muted-foreground/60'>{project.problem}</p>
            <ProjectImage
              project={project}
              index={project.problemImage}
              alt={`${project.title} problem`}
              aspectRatio='natural'
              className='w-full h-200 object-cover rounded-none'
              wrapperClassName='mt-2'
            />
          </div>

          <SectionDivider className='my-20 opacity-20' />

          {/* Research & Insights */}
          <div>
            <SectionHeader title='Research & Insights' details={project.accordionResearchData} />
            <BulletList points={project.research} />
            <ProjectImageList
              project={project}
              indexes={project.researchImage}
              altPrefix={`${project.title} solution`}
              wrapperClassName='mt-10'
            />
          </div>

          <SectionDivider className='my-20 opacity-20' />

          {/* Process */}
          <div>
            <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>Process</h2>
            <p className='text-muted-foreground/60'>{project.process}</p>
            <ProjectImage
              project={project}
              index={project.processImage}
              alt={`${project.title} process`}
              aspectRatio='natural'
              className='w-full h-200 object-cover rounded-none mt-10'
              wrapperClassName='mt-2'
            />
          </div>

          <SectionDivider className='mt-10 mb-20 opacity-20' />

          {/* Solution */}
          <div>
            <SectionHeader title='Solution' details={project.accordionSolutionData} />
            <BulletList points={project.solution} />
            <ProjectImageList
              project={project}
              indexes={project.solutionImage}
              altPrefix={`${project.title} solution`}
              wrapperClassName='mt-2'
            />

            {project.codeSnippet && (
              <div className='mt-12'>
                <CodeSnippet code={project.codeSnippet} />
              </div>
            )}
          </div>

          <SectionDivider className='my-20 opacity-30' />

          {/* Impact */}
          <div>
            {/* NOTE: shows the research dialogs, not accordionImpactData; kept as-is pending a content decision */}
            <SectionHeader title='Impact & Reflection' details={project.accordionResearchData} />
            <BulletList points={project.impact} />
            <ProjectImage
              project={project}
              index={project.impactImage}
              alt={`${project.title} impact`}
              aspectRatio='4/3'
              className='w-full h-full object-cover rounded-none mt-20'
              wrapperClassName='mt-6'
            />
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

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className='font-bold mb-2 tracking-tight text-muted-foreground'>{label}</div>
      <div className='text-muted-foreground/60'>{children}</div>
    </div>
  );
}
