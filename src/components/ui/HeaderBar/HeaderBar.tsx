import Logo from '../Logo/Logo';
import ShapeMenu from '../ShapeMenu/ShapeMenu';
import ImportMenu from '../ImportMenu/ImportMenu';
import MaterialsMenu from '../MaterialsMenu/MaterialsMenu';
import './HeaderBar.css';

/**
 * Transparent header bar (top-left): the floating tinygl logo plus the shape
 * picker, import, and materials toolbars.
 */
export default function HeaderBar() {
  return (
    <header className="tg-header">
      <Logo />
      <ShapeMenu />
      <ImportMenu />
      <MaterialsMenu />
    </header>
  );
}
