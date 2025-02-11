const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/config');
const searchRoutes = require('./src/routes/searchRoutes');

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use('/', searchRoutes);

app.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});
