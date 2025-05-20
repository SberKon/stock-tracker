// Express.js server for web scraping API on Vercel
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get("/api/garden", async (req, res) => {
  try {
    const url = "https://www.vulcanvalues.com/grow-a-garden/stock";
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const stockData = [];
    
    // Find all stock sections (similar to gardenscraper.py)
    const stockSections = $('.grid-cols-1').first().children('div');
    
    stockSections.each((_, section) => {
      const title = $(section).find('h2').text().trim();
      const items = [];
      
      $(section).find('li').each((_, item) => {
        const name = $(item).find('span').first().text().split('x')[0].trim();
        const quantity = $(item).find('span.text-gray-400').text().trim();
        items.push({ name, quantity });
      });
      
      stockData.push({
        section: title,
        items: items
      });
    });
    
    res.json({
      data: stockData,
      timestamp: new Date().toLocaleTimeString(),
      source: "Vulcan Values Garden Stock"
    });
    
  } catch (error) {
    console.error('Garden Stock API Error:', error.message);
    res.status(500).json({ error: "Failed to fetch garden stock data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
