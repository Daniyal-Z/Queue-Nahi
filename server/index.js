//change password before you submit it
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    return res.json("Backend");
});

// Import routes
const studentsRoutes = require('./routes/students');
const managersRoutes = require('./routes/managers');
const menuRoutes = require('./routes/menu');
// const paymentRoutes = require('./routes/payments');
const restaurantRoutes = require('./routes/restaurants');
const booksRoutes = require('./routes/books');
const groundsRoutes = require('./routes/grounds');
// const timingsRoutes = require('./routes/timings');
const restaurantMgrRoutes = require('./routes/restaurantMgr');
//const groundRoutes = require('./routes/groundMgr');
//const bookRoutes = require('./routes/bookMgr');
const printRoutes = require('./routes/print');
const adminRoutes = require('./routes/admin');


app.use('/students', studentsRoutes);
app.use('/managers', managersRoutes);
app.use('/menu', menuRoutes);
// app.use('/payment', paymentRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/books', booksRoutes);
app.use('/grounds', groundsRoutes);
// app.use('/timings', timingsRoutes);
app.use('/restaurantMgr', restaurantMgrRoutes);
//app.use('/groundMgr', groundRoutes);
//app.use('/bookMgr', bookRoutes);
app.use('/print', printRoutes);
app.use('/admin', adminRoutes);
  
// Student-Related Views
// Service Availability Views
// Payment & Order Tracking Views
  

app.listen(3001, () => {
    console.log("Server running on port 3001");
})

