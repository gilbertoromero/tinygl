import Logo from '../Logo/Logo';
import HeaderButton from '../HeaderButton/HeaderButton';
import { CubeIcon } from '../icons/CubeIcon';
import './HeaderBar.css';

/**
 * Transparent header bar (top-left): the floating tinygl logo plus the toolbar
 * buttons. Only the first button (add cube) is defined for now.
 */
export default function HeaderBar() {
  return (
    <header className="tg-header">
      <Logo />
      <div className="tg-header__actions">
        <HeaderButton icon={<CubeIcon rotate={20} size={52} />} title="Add cube" label="Add cube" />
      </div>
    </header>
  );
}
