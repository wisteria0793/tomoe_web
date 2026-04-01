import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Shop.module.css';
import Product from './components/Product';
import Navbar from './components/Navbar';
import ProductDetailModal from './components/ProductDetailModal';
import axios from 'axios';
import Footer from './components/Footer';

function Shop() {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('priceAsc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
 
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/`);
      setProducts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('商品データの取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    const cartItem = cart.find(item => item.product.id === product.id);
    setQuantity(cartItem ? cartItem.quantity : 1);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };
  
  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const handleAddToCart = (product) => {
    console.log(`Adding to cart: Product ID: ${product.id}, Quantity: ${quantity}`);
    setCart(prevCart => {
      const existingProductIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingProductIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity = quantity;
        console.log(`Updated quantity for product ID: ${product.id}, New Quantity: ${updatedCart[existingProductIndex].quantity}`);
        return updatedCart;
      }
      console.log(`New product added to cart: Product ID: ${product.id}, Quantity: ${quantity}`);
      return [...prevCart, { product, quantity }];
    });
    setSelectedProduct(null);
  };

  const totalPrice = cart.reduce((sum, item) => {
    console.log(`Calculating price for product ID: ${item.product.id}, Price: ${item.product.price}, Quantity: ${item.quantity}`);
    return sum + item.product.price * item.quantity;
  }, 0);


  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case 'priceAsc':
        return a.price - b.price;
      case 'priceDesc':
        return b.price - a.price;
      case 'dateAsc':
        return new Date(a.registeredAt) - new Date(b.registeredAt);
      case 'dateDesc':
        return new Date(b.registeredAt) - new Date(a.registeredAt);
      case 'alphabetical':
        return a.description.localeCompare(b.description, 'ja');
      default:
        return 0;
    }
  });

  return (
	<>
	<Navbar />
    <div className={styles.shopContainer}>
      <h1 className={styles.shopTitle}>Our Exclusive Shop</h1>
      <div className={styles.sortOptions}>
        <label htmlFor="sort">Sort by:</label>
        <select id="sort" value={sortOption} onChange={handleSortChange}>
          <option value="priceAsc">Price (Low to High)</option>
          <option value="priceDesc">Price (High to Low)</option>
          <option value="dateAsc">Registration Date (Oldest)</option>
          <option value="dateDesc">Registration Date (Newest)</option>
          <option value="alphabetical">あいうえお順</option>
        </select>
      </div>
      <div className={styles.productsGrid}>
        {sortedProducts
          .filter(product => product.stock > 0)
          .map(product => (
            <Product key={product.id} product={product} onClick={() => handleProductClick(product)}
	             quantity={cart.find(item => item.product.id === product.id)?.quantity || 0}
	    />
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
          onPurchase={() => handleAddToCart(selectedProduct)}
	  defaultQuantity={cart.find(item => item.product.id === selectedProduct.id)?.quantity || 0}
          onQuantityChange={handleQuantityChange}
        />
      )}
      <div className={styles.cartSummary}>
        {cart
          .filter(item => item.quantity > 0)
          .map(item => {
            const productName = item.product.name_en || '名前がありません';
            const truncatedName = productName.length > 10 ? productName.slice(0, 10) + '...' : productName;
            const subtotal = item.product.price * item.quantity;
            return (
              <p key={item.product.id}>
                {truncatedName}✖️ {item.quantity} - ¥{subtotal.toLocaleString()}
              </p>
            );
          })}
        <p>Total: ¥{totalPrice.toLocaleString()}</p>
        <button 
          onClick={() => navigate('/english/payment', { state: { cart } })}
          aria-label="Proceed to checkout"
        >
          Proceed
        </button>
      </div>
    </div>
    <Footer />
</>
  );
}

export default Shop; 
   
