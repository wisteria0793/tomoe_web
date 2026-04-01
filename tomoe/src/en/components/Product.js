import React from 'react';
import styles from '../../styles/Product.module.css';

function Product({ product, onClick, quantity }) {
  return (
    <div className={styles.productCard} onClick={onClick}>
      <img src={product.image} alt={product.description_en} className={styles.productImage} />
      <h2 className={styles.productTitle}>{product.name_en}</h2>
	{quantity > 0 && (
	 <div className={styles.quantityBadge}>{quantity}</div>
	)}
      <div className={styles.productGenres}>
        {/* genres配列からジャンル名を取得し、"、"で区切って表示 */}
        Genre:
        {product.genres && product.genres.length > 0 ? (
          product.genres.map((g) => g.name_en).join(', ') // ジャンル名を"、"で区切る
        ) : (
          <span className={styles.genreTag}>No Genre</span> // ジャンルがない場合の表示
        )}
      </div>
      <p className={styles.productPrice}>¥{Math.floor(product.price)}</p>
    </div>
  );
}

export default Product; 
