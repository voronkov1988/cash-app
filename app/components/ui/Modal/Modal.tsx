import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'lg' | 'xl'; // Добавляем поддержку разных размеров модального окна
}

export const Modal = ({ isOpen, onClose, title, children, size }: ModalProps) => {
  if (!isOpen) return null;

  // Определяем класс для размера модального окна
  const modalSizeClass = size ? `modal-${size}` : '';

  return (
    <>
      {/* Затемнение фона */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div 
          className={`modal-dialog ${modalSizeClass}`}
          onClick={e => e.stopPropagation()} // Предотвращаем закрытие при клике внутри модального окна
        >
          <div className="modal-content">
            {/* Заголовок модального окна */}
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            {/* Тело модального окна */}
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};