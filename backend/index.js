const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ CORS (only once, no duplicates)
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173","http://localhost:4000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// API test
app.get("/", (req, res) => {
  res.send("Express is running");
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images/",
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Serve static images
app.use("/images", express.static("upload/images"));

// Upload endpoint for images
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Product Schema
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

// Add Product API
app.post('/addproduct', async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      available: req.body.available ?? true
    });

    await product.save();
    console.log("✅ Product saved:", product);

    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete product API
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("🗑️ Product Removed");
  res.json({ success: true, id: req.body.id });
});

// Get all products API
app.get('/allproducts', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

// User Schema
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// Signup API
app.post('/signup', async (req, res) => {
  try {
    console.log("📩 Signup request body:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const emailCheck = await Users.findOne({ email });
    if (emailCheck) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    const usernameCheck = await Users.findOne({ name });
    if (usernameCheck) {
      return res.status(400).json({ success: false, error: "Username already exists" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Users({ name, email, password: hashedPassword, cartData: cart });
    await user.save();

    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET || "secret_ecom",
      { expiresIn: "7d" }
    );

    return res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: false, error: "Wrong Email ID" });
    }

    const passCompare = await bcrypt.compare(req.body.password, user.password);
    if (!passCompare) {
      return res.json({ success: false, error: "Wrong password" });
    }

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, process.env.JWT_SECRET || "secret_ecom", {
      expiresIn: "7d",
    });

    return res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

//creating endpoint for newcollection data
// New Collections API
app.get("/new_collections", async (req, res) => {
  try {
    const products = await Product.find({}).limit(10); // or whatever logic you want
    res.json(products);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//creating end point for popularinshirts data
app.get("/popularinshirts", async (req, res) => {
  let products = await Product.find({ category: "Shirts" });
  let popular_in_shirts = products.slice(0, 8);
  console.log("popular_in_shirts_fetched");
  res.send(popular_in_shirts);
});

//creating middleware to fetch user
const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};


//creating endpoint for adding products in cartdata
// ✅ Add to Cart API
// Add to Cart API
app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize if empty
    if (!user.cartData) user.cartData = {};

    // Add item
    if (user.cartData[itemId]) {
      user.cartData[itemId] += 1;
    } else {
      user.cartData[itemId] = 1;
    }

    await user.save();
    console.log(`✅ Added item ${itemId} to ${user.name}'s cart`);
    res.json({ success: true, message: "Item added to cart" });

  } catch (error) {
    console.error("❌ Error in /addtocart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

//creating endpoint to remove products from cartdata
// Remove from Cart API
app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;
    const itemKey = String(itemId); // ✅ Convert to string

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cartData) user.cartData = {};

    if (user.cartData[itemKey] && user.cartData[itemKey] > 0) {
      user.cartData[itemKey] -= 1;
      await user.save();
      console.log(`🗑️ Removed item ${itemKey} from ${user.name}'s cart`);
      return res.json({ success: true, message: "Item removed from cart" });
    } else {
      return res.status(400).json({ success: false, message: "Item not in cart" });
    }
  } catch (error) {
    console.error("❌ Error in /removefromcart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

//creating endpoint to get cart data
// ✅ Get Cart Data API
app.get("/getcart", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize if empty
    if (!user.cartData) {
      user.cartData = {};
      await user.save();
    }

    console.log(`🛒 Cart fetched for ${user.name}`);
    return res.json({ success: true, cartData: user.cartData });

  } catch (error) {
    console.error("❌ Error in /getcart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


// Run server
app.listen(port, (err) => {
  if (err) {
    console.error("Error occurred:", err);
  } else {
    console.log(`🚀 Server is running on port ${port}`);
  }
});