import './HamburgerMenu.css';

export default function HamburgerMenu({ isOpen, onToggle }) {
  return (
    <button 
      className={`hamburger-button ${isOpen ? 'open' : ''}`}
      onClick={onToggle}
      aria-label="Menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}
