import Logo from '../Logo/Logo';
import ShapeMenu from '../ShapeMenu/ShapeMenu';
import './HeaderBar.css';

/**
 * Transparent header bar (top-left): the floating tinygl logo plus the shape
 * picker toolbar.
 */
export default function HeaderBar() {
  return (
    <header className="tg-header">
      <Logo />
      <ShapeMenu />
    </header>
  );
}
