import { DetailDialog } from '@/components/ui/detail-dialog';
import { Image } from '@/components/ui/image';
import type { DetailItem, ProjectDetail } from '@/types';

type AspectRatio = React.ComponentProps<typeof Image>['aspectRatio'];

/** Horizontal rule between case-study sections. */
export function SectionDivider({ className }: { className: string }) {
  return <div className={`w-full h-px bg-gray-300 ${className}`}></div>;
}

/** Section heading with optional "read more" dialog buttons on the right. */
export function SectionHeader({ title, details }: { title: string; details?: DetailItem[] }) {
  return (
    <div className='flex items-center justify-between w-full'>
      <h2 className='text-2xl font-bold mb-4 tracking-tight text-muted-foreground'>{title}</h2>
      {details && (
        <div className='mb-4 space-y-2'>
          {details.map((item, index) => (
            <DetailDialog key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Square-bulleted list; each point may contain inline HTML (e.g. <strong>) from projectData.json. */
export function BulletList({ points }: { points: string[] }) {
  return (
    <ul className='space-y-6 mb-8 list-none mt-6 text-base'>
      {points.map((point, index) => (
        <li key={index} className='flex items-start gap-3'>
          <span className='text-xs text-muted-foreground/40 shrink-0 flex items-center justify-center h-6 w-4'>■</span>
          <div
            className='text-muted-foreground/60 leading-relaxed [&>strong]:text-foreground [&>strong]:font-bold'
            dangerouslySetInnerHTML={{ __html: point }}
          />
        </li>
      ))}
    </ul>
  );
}

interface ProjectImageProps {
  project: ProjectDetail;
  /** Index into project.images; nothing renders when undefined or out of range. */
  index: number | undefined;
  alt: string;
  aspectRatio: AspectRatio;
  className: string;
  /** When set, the image is wrapped in a div with this class. */
  wrapperClassName?: string;
}

/** A single case-study image referenced by index. */
export function ProjectImage({ project, index, alt, aspectRatio, className, wrapperClassName }: ProjectImageProps) {
  if (index === undefined || !project.images[index]) return null;
  const image = <Image src={project.images[index]} alt={alt} aspectRatio={aspectRatio} className={className} />;
  return wrapperClassName ? <div className={wrapperClassName}>{image}</div> : image;
}

/** A stack of case-study images referenced by index. */
export function ProjectImageList({
  project,
  indexes,
  altPrefix,
  wrapperClassName,
}: {
  project: ProjectDetail;
  indexes: number[] | undefined;
  altPrefix: string;
  wrapperClassName: string;
}) {
  if (indexes === undefined || indexes.length === 0) return null;
  return (
    <div className={wrapperClassName}>
      {indexes.map(
        (imageIndex, idx) =>
          project.images[imageIndex] && (
            <Image
              key={idx}
              src={project.images[imageIndex]}
              alt={`${altPrefix} ${idx + 1}`}
              aspectRatio='natural'
              className='w-full h-full object-cover rounded-none mt-4'
            />
          )
      )}
    </div>
  );
}
