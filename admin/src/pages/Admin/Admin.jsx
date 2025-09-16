import { Routes, Route, Navigate } from 'react-router-dom';
import AddProduct from '../../Components/AddProduct/AddProduct';
import ListProduct from '../../Components/ListProduct/ListProduct';
import Sidebar from '../../Components/Sidebar/Sidebar'; // make sure Sidebar is imported
import './Admin.css';

const Admin = () => {
  return (
    <div className="admin">
      {/* Sidebar on left */}
      <Sidebar />

      {/* Main content on right */}
      <div className="admin-content">
        <Routes>
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproducts" element={<ListProduct />} />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/admin/addproduct" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
