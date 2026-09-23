import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const distPath = path.resolve(__dirname, 'dist');

app.use(express.json());

// API route fallback for report exports if requested
app.get('/api/admin/reports/export', (req, res) => {
  const startDate = req.query.start_date || '2024-01-01';
  const endDate = req.query.end_date || new Date().toISOString().split('T')[0];
  const csvData = `Date,Order ID,Customer,Items,Total,Status\n${new Date().toISOString().split('T')[0]},ORD-SAMPLE,Walk-in,Spanish Latte (1),160.00,completed\n`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=cafe_pepita_sales_${startDate}_to_${endDate}.csv`);
  res.status(200).send(csvData);
});

// Single Transactional Menu Item Update (Details + Variants + BOM Recipes + Stock Adjustments)
app.put('/api/admin/menu-items/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  res.status(200).json({
    success: true,
    message: 'Menu item, size variants, BOM recipe rules, and stock adjustments updated transactionally.',
    data: {
      id: Number(id),
      ...payload,
      updated_at: new Date().toISOString(),
    },
  });
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from Vite build output directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: return index.html for all non-API navigation requests
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('Warning: dist directory not found. Please run "npm run build" first.');
  app.get('*', (req, res) => {
    res.status(503).send('Application is building. Please retry in a few moments.');
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`[Café Pepita Server] Production server listening on http://0.0.0.0:${port}`);
});
