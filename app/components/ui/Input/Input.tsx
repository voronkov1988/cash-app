import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export const Input = ({ icon, className = '', ...props }: InputProps) => {
  return (
    <div className={styles.inputWrapper}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input 
        className={[styles.input, icon && styles.withIcon, className].filter(Boolean).join(' ')}
        {...props}
      />
    </div>
  );
};
