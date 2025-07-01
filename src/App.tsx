import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Work from './pages/work';
import About from './pages/about';
import Contact from './pages/contact';
import SagoNavigation from './components/NavigationMenu';
import ProjectPage from './pages/projects/projects-page';
import { useParams } from 'react-router-dom';
function ProjectPageWrapper() {
  const params = useParams<{ id: string }>();
  return <ProjectPage params={{ id: params.id ?? '' }} />;
}

function App() {
  return (
    <Router basename="/">
      <SagoNavigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects/:id" element={<ProjectPageWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;