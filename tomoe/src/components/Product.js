import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Product.module.css';

function Product({ product, onClick, quantity }) {
  const { t, i18n } = useTranslation();
  return (
    <div className={styles.productCard} onClick={onClick}>
      <img src={product.image} alt={product.description} className={styles.productImage} />
      <h2 className={styles.productTitle}>{product.name_ja}</h2>
	{quantity > 0 && (
	 <div className={styles.quantityBadge}>{quantity}</div>
	)}
      <div className={styles.productGenres}>
        {/* genres配列からジャンル名を取得し、"、"で区切って表示 */}
        {i18n.language === 'ja' ? "ジャンル:" : "Genre:"}
        {product.genres && product.genres.length > 0 ? (
          product.genres.map((g) => g.name_ja).join(', ') // ジャンル名を"、"で区切る
        ) : (
          <span className={styles.genreTag}>{i18n.language === 'ja' ? "ジャンルなし" : "No Genre"}</span> // ジャンルがない場合の表示
        )}
      </div>
      <p className={styles.productPrice}>{i18n.language === 'ja' ? "価格:" : "Price:"} ¥{Math.floor(product.price)}</p>
    </div>
  );
}

export default Product; 
