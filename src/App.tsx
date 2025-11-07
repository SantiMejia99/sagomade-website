import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about';
import Contact from './pages/contact';
import SagoNavigation from './components/NavigationMenu';
import ProjectPage from './pages/projects/projects-page';
import NotFound from "./pages/NotFound";
import { useParams } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import { SpeedInsights } from '@vercel/speed-insights/react';

function ProjectPageWrapper() {
  const params = useParams<{ id: string }>();
  return <ProjectPage params={{ id: params.id ?? '' }} />;
}

function App() {
  return (
    <>
      <SpeedInsights />
      <CustomCursor />
      <Router basename='/'>
        <SagoNavigation />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/projects/:id' element={<ProjectPageWrapper />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
