require('dotenv').config();
console.log('Token loaded:', process.env.HUBSPOT_API_KEY ? 'Yes' : 'No');
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
// HubSpot custom object internal name
const HUBSPOT_OBJECT = '2-192838565';
// Middleware
app.use(express.urlencoded({ extended: true })); // To read form data
app.use(express.json());
app.set('view engine', 'pug');
// GET / → Homepage showing all Shipping Orders
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT}?properties=shipping_name,shipping_id,shipping_band,shipping_location&limit=100`,
      {
        headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
      }
    );
    const records = response.data.results;
    res.render('homepage', { records });
  } catch (err) {
    console.error('HubSpot API Error:', err.response?.data || err.message);
    res.status(500).send('Error fetching shipping orders');
  }
});
// GET /update-cobj → Render the form to create a new Shipping Order
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Shipping Orders | Integrating With HubSpot I Practicum'
  });
});
// POST /update-cobj → Create a new Shipping Order
app.post('/update-cobj', async (req, res) => {
  const { shipping_name, shipping_id, shipping_band, shipping_location } = req.body;
  try {
    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT}`,
      { properties: { shipping_name, shipping_id, shipping_band, shipping_location } },
      {
        headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
      }
    );
    res.redirect('/');
  } catch (err) {
    console.error('HubSpot API Error:', err.response?.data || err.message);
    res.status(500).send('Error creating shipping order');
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});