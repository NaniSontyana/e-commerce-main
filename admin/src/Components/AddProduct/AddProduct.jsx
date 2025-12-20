import React, { useState } from 'react'
import  './AddProduct.css'
import upload from '../../assets/upload.png'


const AddProduct = () => {
  const [image,setImage]=useState(false);
  
  const [productDetails,setProductDetails]=useState(
    {
      name:"",
      image:"",
      category:"Shirts",
      old_price:"",
      new_price:""
    }
  )
  const imageHandler = (e) =>{
    setImage(e.target.files[0]);

  }

 const changeHandler =(e)=>{
  setProductDetails({...productDetails,[e.target.name]:e.target.value})


 }
 const Add_Product = async () => {
  console.log(productDetails);

  try {
    // Upload image
    let formData = new FormData();
    formData.append('product', image);

    let uploadResponse = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData,
    });

    let uploadData = await uploadResponse.json();

    if (uploadData.success) {
      // Update product details with uploaded image
      const updatedProduct = {
        ...productDetails,
        image: uploadData.image_url,
      };
      setProductDetails(updatedProduct);

      // Send full product details to backend
      let productResponse = await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      let productData = await productResponse.json();
      console.log("Product added:", productData);
    }
  } catch (error) {
    console.error("Error while adding product:", error);
  }
};



 return (
    <div className="add-Product">
      <div className="addProduct-itemfield">
        <p>Product Title</p>
        <input name="name" value={productDetails.name} onChange={changeHandler} type="text" placeholder='Enter Product Title' />
      </div>
      <div className="addProduct-row">
        <div className='addProduct-itemfield'>
          <p>Price</p>
          <input name="old_price" value={productDetails.old_price} onChange={changeHandler} type="text" placeholder='Enter Price' className='addProduct-price' />
      </div>
      <div className="addProduct-itemfield">
          <p>Offer Price</p>
          <input name="new_price" value={productDetails.new_price} onChange={changeHandler} type="text" placeholder='Enter Offer Price' className='addProduct-price' />
      </div>
      </div>
      <div className="addProduct-itemfield">
        <p>Product Category</p>
        <select name="category" value={productDetails.category} onChange={changeHandler}  className="addproduct-selector">
          <option value="shirts">Shirts</option>
          <option value="lowerwear">LowerWear</option>
          <option value="shoes">Shoes</option>
        </select>
    </div>
  <div className="addProduct-upload">
  <label htmlFor="file-input" className="cursor-pointer">
    <img
      src={image?URL.createObjectURL(image):upload}
      className="addproduct-thumbnail-img"
    />
  </label>
  <input onChange={imageHandler}type="file" id="file-input" hidden />
</div>

      <button onClick={Add_Product} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct
