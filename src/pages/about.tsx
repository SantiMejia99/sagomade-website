'use client';

import { useEffect, useState } from 'react';
import DesignCounter from '@/components/DesignCounter';
import { CalendarHeatmap } from '@/components/calendar-heatmap';

function useMonths() {
  const [months, setMonths] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setMonths(4);
      else if (w >= 900) setMonths(3);
      else if (w >= 560) setMonths(2);
      else setMonths(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return months;
}

export default function About() {
  const numberOfMonths = useMonths();

  const socialLinks = [
    {
      label: 'CV',
      href: 'https://drive.google.com/file/d/1r2jqilfmB_IEjn0m0e2fb13FWa9k1gEh/view?usp=drive_link',
    },
    {
      label: 'Portfolio',
      href: 'https://drive.google.com/file/d/1tW86KZ8NNzjFCEwM_KmDk92ou4kqWE_P/view?usp=drive_link',
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

  // Example weighted dates — replace with your real data
  const activityDates = [
    { date: new Date(2026, 6, 3), weight: 1 }, // July
    { date: new Date(2026, 6, 10), weight: 3 },
    { date: new Date(2026, 6, 15), weight: 5 },
    { date: new Date(2026, 6, 22), weight: 2 },
    { date: new Date(2026, 7, 4), weight: 4 }, // August
    { date: new Date(2026, 7, 11), weight: 2 },
    { date: new Date(2026, 7, 19), weight: 5 },
    { date: new Date(2026, 8, 2), weight: 3 }, // September
    { date: new Date(2026, 8, 17), weight: 1 },
  ];

  // 4 intensity levels — customize these Tailwind classes to match your theme
  const variantClassnames = [
    '!text-white hover:text-white bg-green-400 hover:bg-green-400 rounded-md',
    '!text-white hover:text-white bg-green-500 hover:bg-green-500 rounded-md',
    '!text-white hover:text-white bg-green-700 hover:bg-green-700 rounded-md',
  ];

  return (
    <div className='bg-background'>
      <main className='container mx-auto pt-30 pb-5'>
        {/* Hero Section - 2 Column Grid */}
        <section className='mb-20'>
          <div className='grid md:grid-cols-[2fr_1fr] gap-2 items-start'>
            {/* Left Column - Description */}
            <div className='space-y-6'>
              <p className='text-4xl font-sans text-left uppercase'>
                I am a multidisciplinary designer with 5+ years of experience specializing in branding, design
                flexibility, and automation systems. Merging minimalism with structured design to build timeless,
                accessible, and reusable solutions.
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

        {/* Calendar Heatmap Section */}
        <section className='mt-5 border border-gray-400/30 px-10 py-10 rounded-4xl'>
          <h3 className='text-sm uppercase text-muted-foreground/60 mb-4 font-bold'>Design Uptime</h3>
          <div className='flex justify-center mb-1'>
            <CalendarHeatmap
              numberOfMonths={numberOfMonths}
              weightedDates={activityDates}
              variantClassnames={variantClassnames}
            />
          </div>
        </section>

        {/* Divider */}
        <div className='w-full h-px my-10 bg-gray-300 opacity-30 '></div>

        {/* Design Activity Section */}
        <section className='mt-10'>
          <DesignCounter />
        </section>

        {/* Divider */}
        <div className='w-full h-px my-10 bg-gray-300 opacity-30 '></div>
      </main>
    </div>
  );
}
