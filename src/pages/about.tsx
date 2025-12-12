'use client';

import DesignCounter from '@/components/DesignCounter';

export default function About() {
  const socialLinks = [
    {
      label: 'See my CV',
      href: 'https://drive.google.com/file/d/1r2jqilfmB_IEjn0m0e2fb13FWa9k1gEh/view?usp=drive_link',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/santiago-mejia-mora/',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/SantiMejia99',
    },
  ];

  return (
    <div className='bg-background'>
      <main className='container mx-auto pt-30 pb-10'>
        {/* Hero Section - 2 Column Grid */}
        <section className='mb-20'>
          <div className='grid md:grid-cols-[2fr_1fr] gap-2 items-start'>
            {/* Left Column - Description */}
            <div className='space-y-6 mask-r-from-35%'>
              <p className='text-4xl text-muted-foreground tracking-tighter leading-tight text-left'>
                I am a visual designer with 5 years of experience specializing in branding, design flexibility, and
                automation systems. Merging minimalism with structured design to build timeless, accessible, and
                reusable solutions.
              </p>
            </div>

            {/* Right Column - Social Links */}
            <div className='flex flex-col items-end'>
              <div className='items-start space-y-6'>
                <h3 className='text-sm uppercase tracking-wider text-muted-foreground/60 mb-6 font-normal'>
                  Find me online
                </h3>
                <div className='space-y-3'>
                  {socialLinks.map(link => (
                    <a
                      key={link.label}
                      target='_blank'
                      href={link.href}
                      rel='noopener noreferrer'
                      className='block text-foreground/70 hover:text-foreground transition-colors duration-200 group'
                    >
                      <span className='flex gap-2'>
                        {link.label}
                        <span className='transform group-hover:translate-x-1 transition-transform duration-200'>
                          ↗
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className='w-full h-px my-10 bg-gray-300 opacity-30 '></div>

        {/* Design Activity Section */}
        <section className='mt-10'>
          <DesignCounter />
        </section>
      </main>
    </div>
  );
}
