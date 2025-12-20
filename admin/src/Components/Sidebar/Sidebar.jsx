import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import add_product_icon from '../../Assets/add_product.png';
import list_product_icon from '../../Assets/list_product.png';

const Sidebar = () => {
  return (
   <div className="sidebar">
      {/* Add Product */}
      <Link to="/addproduct" style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="Add Product" />
          <p>Add Product</p>
        </div>
      </Link>

      {/* List Products */}
      <Link to="/listproducts" style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="List Products" />
          <p>Product List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
