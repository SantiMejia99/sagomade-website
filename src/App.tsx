import { lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';

// Secondary routes are split into their own chunks (react-day-picker, headlessui, etc.)
const loadAbout = () => import('@/pages/About');
const loadContact = () => import('@/pages/Contact');
const loadProjectPage = () => import('@/pages/ProjectPage');
const loadNotFound = () => import('@/pages/NotFound');

const About = lazy(loadAbout);
const Contact = lazy(loadContact);
const ProjectPage = lazy(loadProjectPage);
const NotFound = lazy(loadNotFound);

/** Warm the route chunks once the browser is idle so pixel-transition navigations never wait on the network. */
function usePrefetchRoutes() {
  useEffect(() => {
    const prefetch = () => [loadAbout, loadContact, loadProjectPage, loadNotFound].forEach(load => void load());
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 1000);
    return () => clearTimeout(id);
  }, []);
}

function App() {
  usePrefetchRoutes();

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Router basename='/'>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/projects/:id' element={<ProjectPage />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
