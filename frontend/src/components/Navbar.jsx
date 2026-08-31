export default function Navbar({ cartCount, onCartClick }) {
  return (
    <header className="navbar">
      <div className="logo">Sherriez</div>
      <nav className="nav-links">
        <a href="#">Home</a>
        <a href="#">Shop</a>
        <a href="#">Categories</a>
        <a href="#">Contact</a>
      </nav>
      <button className="cart-btn" onClick={onCartClick}>
        🛒 Cart ({cartCount})
      </button>
    </header>
  )
}
