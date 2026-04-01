import React, { useState } from 'react';
import styles from '../styles/ProductDetailModal.module.css';
import { useTranslation } from 'react-i18next';

function ProductDetailModal({ product, onClose, onPurchase, onQuantityChange, defaultQuantity }) {
  const { t, i18n } = useTranslation();
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
          <h2 className={styles.title}>{product.name_ja}</h2>
          <h2 className={styles.description}>{product.description_ja}</h2>
          <p><strong>{i18n.language === 'ja' ? "ジャンル:" : "Genre:"}</strong> {product.genres && product.genres.length > 0 ? (
            product.genres.map((g) => g.name_ja).join(', ')
          ) : (
            <span className={styles.genreTag}>{i18n.language === 'ja' ? "ジャンルなし" : "No Genre"}</span>
          )}</p>
          <p><strong>{i18n.language === 'ja' ? "商品価格:" : "Product Price:"}</strong> ¥{Math.floor(product.price)}</p>

          <div className={styles.quantitySelector}>
            <label>{i18n.language === 'ja' ? "数量:" : "Quantity:"}</label>
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

          <button className={styles.purchaseButton} onClick={() => onPurchase(quantity)}>{i18n.language === 'ja' ? "カートに追加" : "Add to Cart"}</button>
          <button className={styles.closeButton} onClick={onClose}>{i18n.language === 'ja' ? "閉じる" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal; 
