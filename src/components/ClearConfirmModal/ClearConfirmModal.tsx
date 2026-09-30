import React from 'react';
import { Modal } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { getT } from '@/utils';
import styles from './ClearConfirmModal.module.css';

interface ClearConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isNepali: boolean;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  opened,
  onClose,
  onConfirm,
  isNepali,
}) => {
  const t = getT(isNepali);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      radius="lg"
      padding="lg"
      size="sm"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 4,
      }}
    >
      <div className={styles.modalContent}>
        {/* Warning Icon Badge */}
        <div className={styles.iconWrapper}>
          <Trash2 size={26} strokeWidth={2.2} />
        </div>

        {/* Modal Title */}
        <h3 className={styles.title}>{t.clearModalTitle}</h3>

        {/* Modal Description */}
        <p className={styles.description}>{t.clearModalDescription}</p>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} autoFocus>
            {t.clearModalCancel}
          </button>
          <button
            className={styles.confirmBtn}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 size={16} />
            <span>{t.clearModalConfirm}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
