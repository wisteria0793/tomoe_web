import React from 'react';
import styles from '../../styles/Payment.module.css';

const InputField = ({ label, name, placeholder, value, onChange, error }) => {
  return (
    <label>
      {label}
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.inputField}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </label>
  );
};

export default InputField; 
