const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();
const app = express();
const PORT = 4420;

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
