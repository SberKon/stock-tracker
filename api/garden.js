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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const stockData = [];
    
    // Find the main grid container and its direct children
    const mainGrid = $('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
    
    mainGrid.children('div').each((_, section) => {
      const title = $(section).find('h2').text().trim();
      const items = [];
      
      $(section).find('ul > li').each((_, item) => {
        const itemElement = $(item);
        const nameWithQuantity = itemElement.find('span').first().text().trim();
        const name = nameWithQuantity.split('x')[0].trim();
        const quantity = itemElement.find('span.text-gray-400').text().trim();
        const imageUrl = itemElement.find('img').attr('src') || '';
        
        if (name) {
          items.push({ 
            name, 
            quantity: quantity || 'x0',
            image: imageUrl
          });
        }
      });
      
      if (title) {
        stockData.push({
          section: title,
          items: items
        });
      }
    });

    if (stockData.length === 0) {
      throw new Error('No stock data found');
    }
    
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
