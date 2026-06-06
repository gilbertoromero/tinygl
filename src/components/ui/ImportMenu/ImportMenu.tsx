import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import HeaderButton from '../HeaderButton/HeaderButton';
import { SvgIcon } from '../icons/SvgIcon';
import archiveUrl from '../../../assets/icons/archive.svg';
import dragDropUrl from '../../../assets/icons/drag-drop.svg';
import folderUrl from '../../../assets/icons/folder.svg';
import './ImportMenu.css';

interface Props {
  /** Fired when the drag-and-drop option is chosen. */
  onDragDrop?: () => void;
  /** Fired with the file the user located via the OS picker. */
  onLocateFile?: (file: File) => void;
}

/**
 * Header import menu. The trigger is a DOM button; opening it reveals two
 * option buttons stacked below, both reusing HeaderButton so they share the
 * trigger's floating panel background. Hybrid reveal: opens on hover *or* click
 * (click pins it for touch/keyboard); closes on mouse-leave, Escape, outside
 * click, or after a pick.
 *
 * Actions: (1) drag-and-drop import, (2) locate a file via the OS picker. The
 * trigger icon is a placeholder (ArchiveIcon) until one is chosen.
 */
export default function ImportMenu({ onDragDrop, onLocateFile }: Props) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setHovered(false);
    setPinned(false);
  };

  const chooseDragDrop = () => {
    (onDragDrop ?? (() => console.log('[ImportMenu] drag & drop requested')))();
    close();
  };

  // "Locate file in folder" → open the native file picker.
  const chooseLocateFile = () => {
    fileInputRef.current?.click();
    close();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      (onLocateFile ?? ((f: File) => console.log('[ImportMenu] located file:', f.name)))(file);
    e.target.value = ''; // allow re-picking the same file
  };

  // While open, close on Escape or a click/tap outside (covers pinned + touch).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="tg-importmenu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HeaderButton
        icon={<SvgIcon src={archiveUrl} size={52} />}
        title="Import"
        label="Import a file"
        active={open}
        onClick={() => setPinned((p) => !p)}
      />

      {open && (
        <div className="tg-importmenu__options">
          <HeaderButton
            icon={<SvgIcon src={dragDropUrl} size={52} />}
            title="Drag & drop"
            label="Drag and drop a file"
            onClick={chooseDragDrop}
          />
          <HeaderButton
            icon={<SvgIcon src={folderUrl} size={52} />}
            title="Locate in folder"
            label="Locate file in folder"
            onClick={chooseLocateFile}
          />
        </div>
      )}

      <input ref={fileInputRef} type="file" hidden onChange={onFileChange} />
    </div>
  );
}
