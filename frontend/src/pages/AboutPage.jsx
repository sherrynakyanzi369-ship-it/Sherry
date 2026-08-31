import { useSeo } from '../hooks';
import { Icon } from '../components/ui/Icon';

export default function AboutPage() {
  useSeo({ title: 'About Us' });
  return (
    <div className="container about-page">
      <h1>About Sherriez Scents</h1>
      <div className="about-content">
        <p className="about-lead">Premium fragrances crafted to tell your story.</p>
        <p>Sherriez Scents was born from a belief that fragrance is the most personal form of self-expression. Every scent we create is a composition — a carefully balanced blend of top, heart, and base notes that unfolds on your skin throughout the day.</p>
        <p>We source the finest ingredients from around the world: Taif roses from Saudi Arabia, Cambodian oud, Italian bergamot, and Madagascan vanilla. Each bottle is filled with integrity, tested for longevity, and designed to leave an unforgettable impression.</p>
        <div className="about-values">
          <div className="about-value"><Icon name="droplet" size={28} /><h3>Crafted with Care</h3><p>Every fragrance is blended in small batches to ensure quality.</p></div>
          <div className="about-value"><Icon name="shield" size={28} /><h3>100% Authentic</h3><p>We guarantee every product is genuine and sourced ethically.</p></div>
          <div className="about-value"><Icon name="leaf" size={28} /><h3>Clean Beauty</h3><p>Cruelty-free, responsibly sourced, and skin-safe formulas.</p></div>
          <div className="about-value"><Icon name="heart" size={28} /><h3>Made with Love</h3><p>Designed for people who want to feel confident and unforgettable.</p></div>
        </div>
      </div>
    </div>
  );
}
