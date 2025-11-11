const sequelize = require('../config/config');
const Role = require('./role');
const User = require('./user');
const Pet = require('./pet');
const Category = require('./category');
const Product = require('./product');
const Order = require('./order');
const OrderItem = require('./orderItem');
const Cart = require('./cart')

// 🔗 Role -> Users
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// 🔗 User -> Pets
User.hasMany(Pet, { foreignKey: 'userId', as: 'pets' });
Pet.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// 🔗 User -> Orders
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 🔗 Category -> Products
Category.hasMany(Product, { foreignKey: 'categoriesId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoriesId', as: 'category' });

// relasi Cart
User.hasMany(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Cart, { foreignKey: 'productId', as: 'cart' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 🔗 Orders ↔ Products (via OrderItem)
Order.belongsToMany(Product, {
    through: OrderItem,
    as: 'products',
    foreignKey: 'orderId'
});
Product.belongsToMany(Order, {
    through: OrderItem,
    as: 'orders',
    foreignKey: 'productId'
});

// 🔗 Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// 🔗 Product ↔ OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
    sequelize,
    Role,
    User,
    Pet,
    Category,
    Product,
    Cart,
    Order,
    OrderItem
};
