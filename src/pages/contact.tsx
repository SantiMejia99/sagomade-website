'use client';

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={className} {...props} />
));
Textarea.displayName = 'Textarea';

export default function Contact() {
  const contactInfo = [
    {
      label: 'Email',
      value: 'santiagommora1999@gmail.com',
      href: 'mailto:santiagommora1999@gmail.com',
    },
    {
      label: 'Location',
      value: 'Toronto, CA',
      href: null,
    },
  ];

  const socialLinks = [
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
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto pt-32 pb-16 px-4 max-w-4xl'>
        {/* Hero Section */}
        <section className='mb-16'>
          <div className='space-y-8'>
            <div className='space-y-6 text-sm leading-relaxed'></div>
            <p className='text-muted-foreground/70 font-thin'>Explore how we can bring your ideas to life.</p>
          </div>
        </section>

        <div className='flex justify-center'>
          {/* Contact Information */}
          <section className='space-y-12'>
            {/* Direct Contact */}
            <div>
              <h2 className='text-2xl font-black mb-16 tracking-tight text-muted-foreground'>Get in touch</h2>
              <div className='space-y-6'>
                {contactInfo.map(info => (
                  <div key={info.label} className='space-y-1'>
                    <div className='text-sm text-muted-foreground/60 uppercase tracking-wider font-medium'>
                      {info.label}
                    </div>
                    {info.href ? (
                      <a
                        href={info.href}
                        className='text-foreground/80 hover:text-foreground transition-colors duration-200 block'
                      >
                        {info.value}
                      </a>
                    ) : (
                      <div className='text-foreground/80'>{info.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className='text-sm uppercase tracking-wider text-muted-foreground/60 mb-6 font-medium'>
                Find me online
              </h3>
              <div className='space-y-3'>
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block text-foreground/70 hover:text-foreground transition-colors duration-200 group'
                  >
                    <span className='inline-flex items-center gap-2'>
                      {link.label}
                      <span className='transform group-hover:translate-x-1 transition-transform duration-200'>↗</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className='text-sm uppercase tracking-wider text-muted-foreground/60 mb-6 font-medium'>
                Availability
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 rounded-full bg-green-500'></div>
                  <span className='text-foreground/70'>Available for new projects</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
