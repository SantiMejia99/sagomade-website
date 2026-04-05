'use client';

import { useEffect, useState } from 'react';
import { CalendarHeatmap } from '@/components/calendar-heatmap';
import activitiesData from '@/data/designActivities.json';

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

type Activity = { date: string; weight: number; entry: string };

const activities: Activity[] = activitiesData;

const latestActivity = activities.reduce((a, b) => (a.date > b.date ? a : b));
const activityMap = new Map(activities.map(a => [a.date, a]));
const weightedDates = activities.map(a => ({
  date: new Date(a.date + 'T12:00:00'),
  weight: a.weight,
}));

export default function About() {
  const numberOfMonths = useMonths();
  const [activeEntry, setActiveEntry] = useState<Activity>(latestActivity);

  const socialLinks = [
    { label: 'CV', href: 'https://drive.google.com/file/d/1r2jqilfmB_IEjn0m0e2fb13FWa9k1gEh/view?usp=drive_link' },
    {
      label: 'Portfolio',
      href: 'https://drive.google.com/file/d/1tW86KZ8NNzjFCEwM_KmDk92ou4kqWE_P/view?usp=drive_link',
    },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/santiago-mejia-mora/' },
    { label: 'GitHub', href: 'https://github.com/SantiMejia99' },
  ];

  const variantClassnames = [
    '!text-white hover:text-white bg-green-400 hover:bg-green-500 rounded-md',
    '!text-white hover:text-white bg-green-600 hover:bg-green-700 rounded-md',
    '!text-white hover:text-white bg-green-800 hover:bg-green-900 rounded-md',
  ];

  const handleDayMouseEnter = (day: Date) => {
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    console.log('hovered key:', key);
    console.log('found:', activityMap.get(key));
    const activity = activityMap.get(key);
    if (activity) {
      setActiveEntry(activity);
    }
  };

  const handleDayMouseLeave = () => {
    setActiveEntry(latestActivity);
  };

  const displayDate = new Date(activeEntry.date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className='bg-background'>
      <main className='container mx-auto pt-30 pb-5'>
        {/* Hero Section */}
        <section className='mb-20'>
          <div className='grid md:grid-cols-[3.2fr_1fr] gap-2 items-start'>
            <div className='space-y-6'>
              <p className='text-2xl md:text-3xl font-sans text-left leading font-normal'>
                I am a multidisciplinary designer specializing in branding, design flexibility, and automation systems.
                By merging minimalism with structured design, I build timeless and accessible solutions that are
                inherently reusable. I craft bold, scalable brand identities and automate the boring stuff, slashing
                production time so we can focus on the magic.
              </p>
            </div>
            <div className='md:flex md:flex-col md:items-end mt-6 md:mt-0'>
              <div className='items-start'>
                <h3 className='text-sm uppercase tracking-wider text-muted-foreground/60 mb-4 md:mb-6 font-normal'>
                  Find me online
                </h3>
                <div className='flex flex-row flex-wrap gap-x-5 gap-y-1 md:flex-col md:space-y-2'>
                  {socialLinks.map(link => (
                    <a
                      key={link.label}
                      target='_blank'
                      href={link.href}
                      rel='noopener noreferrer'
                      className='text-foreground/70 hover:text-foreground transition-colors duration-200 group'
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
        <section className='mt-5 border border-gray-400/30 px-4 py-4 sm:px-4 sm:py-4 md:px-8 md:py-8 rounded-4xl'>
          <h3 className='text-base text-muted-foreground/60 mb-2 font-bold'>Design Uptime</h3>

          {/* Journal display */}
          <div className='mb-1 min-h-[48px] transition-all duration-300'>
            <p className='text-sm text-muted-foreground/60 font-medium transition-opacity duration-200'>
              <span className='text-muted-foreground/40 mr-2'>{displayDate} —</span>
              {activeEntry.entry}
            </p>
          </div>

          <CalendarHeatmap
            numberOfMonths={numberOfMonths}
            weightedDates={weightedDates}
            variantClassnames={variantClassnames}
            onDayMouseEnter={handleDayMouseEnter}
            onDayMouseLeave={handleDayMouseLeave}
          />
        </section>
      </main>
    </div>
  );
}
