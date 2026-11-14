import './App.css';
import { lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import Home from './pages/home';
import Contact from './pages/contact';
import NotFound from './pages/NotFound';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';

// About and project pages pull in heavy deps (react-day-picker, headlessui,
// projectData.json), so they load as separate chunks.
const loadAbout = () => import('./pages/about');
const loadProjectPage = () => import('./pages/projects/projects-page');
const About = lazy(loadAbout);
const ProjectPage = lazy(loadProjectPage);

// Page transitions reveal the new route on a fixed timer, so prefetch the
// lazy chunks once the browser is idle to avoid a blank flash on navigation.
function usePrefetchRoutes() {
  useEffect(() => {
    const prefetch = () => {
      void loadAbout();
      void loadProjectPage();
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 2000);
    return () => clearTimeout(id);
  }, []);
}

function ProjectPageWrapper() {
  const params = useParams<{ id: string }>();
  return <ProjectPage params={{ id: params.id ?? '' }} />;
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
            <Route path='/projects/:id' element={<ProjectPageWrapper />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
