import './Logo.css';

/**
 * tinygl wordmark in its own dark-theme pill. Floats on the (transparent)
 * header bar; the "gl" is accented teal.
 */
export default function Logo() {
  return (
    <div className="tg-logo">
      <span className="tg-logo__text">
        tiny<span className="tg-logo__accent">gl</span>
      </span>
    </div>
  );
}
