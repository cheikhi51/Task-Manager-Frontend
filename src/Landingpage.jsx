import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
function Landingpage() {
  return (
    <div>
        <Navbar />
        <Home />
        <About />
        <Services />
        <Contact />
        <Footer />
    </div>
  );
}
export default Landingpage;