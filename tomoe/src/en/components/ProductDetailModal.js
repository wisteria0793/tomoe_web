import React, { useState } from 'react';
import styles from '../../styles/ProductDetailModal.module.css';

function ProductDetailModal({ product, onClose, onPurchase, onQuantityChange, defaultQuantity }) {
  const [quantity, setQuantity] = useState(defaultQuantity);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
      onQuantityChange({ target: { value: quantity + 1 } });
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
      onQuantityChange({ target: { value: quantity - 1 } });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalLeft}>
          <img src={product.image} alt={product.description} className={styles.modalImage} />
        </div>
        <div className={styles.modalRight}>
          <h2 className={styles.title}>{product.name_en}</h2>
          <h2 className={styles.description}>{product.description_en}</h2>
          <p><strong>Genre:</strong> {product.genres && product.genres.length > 0 ? (
            product.genres.map((g) => g.name_ja).join(', ')
          ) : (
            <span className={styles.genreTag}>No genre</span>
          )}</p>
          <p><strong>Price:</strong> ¥{Math.floor(product.price)}</p>

          <div className={styles.quantitySelector}>
            <label>Quantity:</label>
            <button onClick={handleDecrement}>&lt;</button>
            <input 
              type="number" 
              min="0" 
              max={product.stock} 
              value={quantity} 
              onChange={(e) => {
                const newQuantity = Math.max(0, Math.min(product.stock, Number(e.target.value)));
                setQuantity(newQuantity);
                onQuantityChange({ target: { value: newQuantity } });
              }} 
              className={styles.quantityInput}
            />
            <button onClick={handleIncrement}>&gt;</button>
          </div>

          <button className={styles.purchaseButton} onClick={() => onPurchase(quantity)}>Add to cart</button>
          <button className={styles.closeButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal; 
