import React from 'react';
import { Popover, Tooltip } from '@mantine/core';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { getT } from '@/utils';
import styles from './ColorPicker.module.css';

const PALETTE = [
  '#26A69A',
  '#66BB6A',
  '#9CCC65',
  '#D4E157',
  '#FFCA28',
  '#FFA726',
  '#FF7043',
  '#8D6E63',
  '#BDBDBD',
  '#78909C',
  '#29B6F6',
  '#5C6BC0',
  '#7E57C2',
  '#EC407A',
  '#ef5350',
  '#607D8B',
  '#4CAF50',
  '#ff5252',
];

interface ColorPickerProps {
  isNepali?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ isNepali = true }) => {
  const { config, setBackgroundColor } = useAppStore();
  const [opened, setOpened] = React.useState(false);
  const t = getT(isNepali);

  return (
    <div className={styles.wrapper}>
      <Popover
        opened={opened}
        onChange={setOpened}
        position="top"
        withArrow
        shadow="md"
        radius="md"
        offset={12}
      >
        <Popover.Target>
          <Tooltip label={t.colorPickerTooltip} withArrow position="top">
            <button
              className={styles.triggerBtn}
              onClick={() => setOpened((o) => !o)}
              style={{ backgroundColor: config.backgroundColor }}
              aria-label={t.colorPickerTooltip}
            />
          </Tooltip>
        </Popover.Target>

        <Popover.Dropdown style={{ padding: '8px' }}>
          <div className={styles.paletteGrid}>
            {PALETTE.map((color) => {
              const isSelected = color === config.backgroundColor;
              return (
                <button
                  key={color}
                  className={clsx(styles.colorSwatch, isSelected && styles.selectedSwatch)}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setBackgroundColor(color);
                    setOpened(false);
                  }}
                  aria-label={`Select color ${color}`}
                >
                  {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};
