const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("../models/User")
const Category = require("../models/Category")
const Product = require("../models/Product")

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected for seeding"))
.catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
})

// Sample data
const users = [
    {
        name: "Admin User",
        email: "admin@trendora.com",
        password: "admin123",
        isAdmin: true,
    },
{
    name: "John Doe",
    email: "john@example.com",
    password: "123456",
},
{
    name: "Jane Smith",
    email: "jane@example.com",
    password: "123456",
},
]

const categories = [
    {
        name: "Fashion",
        description: "Latest fashion trends and clothing",
        image: "/img/shop01.png",
        isFeatured: true,
    },
{
    name: "Electronics",
    description: "Gadgets and electronic devices",
    image: "/img/shop02.png",
    isFeatured: true,
},
{
    name: "Home & Living",
    description: "Home decor and furniture",
    image: "/img/shop03.png",
    isFeatured: true,
},
{
    name: "Beauty",
    description: "Skincare, makeup, and beauty products",
    image: "/img/placeholder.svg?height=300&width=300",
    isFeatured: false,
},
{
    name: "Accessories",
    description: "Watches, jewelry, and other accessories",
    image: "/img/placeholder.svg?height=300&width=300",
    isFeatured: false,
},
]

// Import data
const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany()
        await Category.deleteMany()
        await Product.deleteMany()

        // Insert users
        const createdUsers = await User.insertMany(users)
        const adminUser = createdUsers[0]._id

        // Insert categories
        const createdCategories = await Category.insertMany(categories)

        // Create products based on categories
        const products = [
            {
                name: "Trendy Summer Dress",
                price: 49.99,
                description: "A beautiful summer dress perfect for any occasion.",
                image: "/img/product01.png",
                brand: "Fashion Brand",
                category: createdCategories[0]._id, // Fashion
                countInStock: 10,
                isFeatured: true,
                isOnSale: true,
                salePrice: 39.99,
                user: adminUser,
            },
            {
                name: "Wireless Headphones",
                price: 79.99,
                description: "High-quality wireless headphones with noise cancellation.",
                image: "/img/product02.png",
                brand: "Tech Brand",
                category: createdCategories[1]._id, // Electronics
                countInStock: 15,
                isFeatured: true,
                isOnSale: false,
                user: adminUser,
            },
            {
                name: "Modern Table Lamp",
                price: 59.99,
                description: "Elegant table lamp to brighten up your living space.",
                image: "/img/product03.png",
                brand: "Home Brand",
                category: createdCategories[2]._id, // Home & Living
                countInStock: 8,
                isFeatured: false,
                isOnSale: true,
                salePrice: 49.99,
                user: adminUser,
            },
            {
                name: "Premium Skincare Set",
                price: 89.99,
                description: "Complete skincare set for radiant and healthy skin.",
                image: "/img/product04.png",
                brand: "Beauty Brand",
                category: createdCategories[3]._id, // Beauty
                countInStock: 12,
                isFeatured: true,
                isOnSale: false,
                user: adminUser,
            },
            {
                name: "Designer Sunglasses",
                price: 39.99,
                description: "Stylish sunglasses to protect your eyes and complete your look.",
                image: "/img/product05.png",
                brand: "Accessory Brand",
                category: createdCategories[4]._id, // Accessories
                countInStock: 20,
                isFeatured: false,
                isOnSale: false,
                user: adminUser,
            },
            {
                name: "Designer Handbag",
                price: 129.99,
                description: "Elegant handbag made from premium materials.",
                image: "/img/product06.png",
                brand: "Fashion Brand",
                category: createdCategories[0]._id, // Fashion
                countInStock: 5,
                isFeatured: true,
                isOnSale: true,
                salePrice: 99.99,
                user: adminUser,
            },
            {
                name: "Smart Watch",
                price: 199.99,
                description: "Feature-rich smartwatch with health monitoring.",
                image: "/img/product07.png",
                brand: "Tech Brand",
                category: createdCategories[1]._id, // Electronics
                countInStock: 7,
                isFeatured: true,
                isOnSale: false,
                user: adminUser,
            },
            {
                name: "Decorative Cushion Set",
                price: 39.99,
                description: "Set of decorative cushions to enhance your home decor.",
                image: "/img/product08.png",
                brand: "Home Brand",
                category: createdCategories[2]._id, // Home & Living
                countInStock: 15,
                isFeatured: false,
                isOnSale: true,
                salePrice: 29.99,
                user: adminUser,
            },
            {
                name: "Luxury Perfume",
                price: 69.99,
                description: "Exquisite fragrance for a lasting impression.",
                image: "/img/product09.png",
                brand: "Beauty Brand",
                category: createdCategories[3]._id, // Beauty
                countInStock: 10,
                isFeatured: true,
                isOnSale: false,
                user: adminUser,
            },
        ]

        // Insert products
        await Product.insertMany(products)

        console.log("Data imported successfully!")
        process.exit()
    } catch (error) {
        console.error(`Error importing data: ${error.message}`)
        process.exit(1)
    }
}

// Run the import
importData()
