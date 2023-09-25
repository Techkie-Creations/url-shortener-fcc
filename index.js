require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')
const urlparser = require('url')
const {MongoClient} = require('mongodb')



// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_URI)
const db = client.db('shorturl')
const urls = db.collection('urls')



app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url
  
  const lookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address)  {
      res.json({error: 'Invalid URL'})
    } else {

      const found = await urls.findOne({shorturl: url})
      if (found == null) {
        const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        shorturl: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result)
      res.json({original_url: url, short_url: urlCount})
        
      } else {
        res.json({original_url: url, short_url: found.shorturl})
      }

      
      
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const short = req.params.short_url
  const urlDoc = await urls.findOne({shorturl: +short})
  console.log(urlDoc.url)
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
