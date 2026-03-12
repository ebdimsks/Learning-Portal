'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const PUBLIC_DIR = path.resolve(__dirname, 'public');

app.use(morgan('tiny'));
app.use(cookieParser());
app.use(express.static(PUBLIC_DIR, { index: false }));

const isAuthenticated = (req) => req.cookies?.auth === 'true';

/**
 * レスポンス対象HTMLを決定
 */
const resolveEntryFile = (req) =>
  isAuthenticated(req) ? 'index.html' : 'auth.html';

/**
 * HTML送信ラッパ
 */
const sendHtml = (res, filename) => {
  const filePath = path.join(PUBLIC_DIR, filename);

  res.sendFile(filePath, (err) => {
    if (!err) return;

    console.error('sendFile error:', err);

    if (res.headersSent) return;

    if (err.code === 'ENOENT') {
      return res.status(404).send('Not Found');
    }

    return res.status(err.status ?? 500).send('Internal Server Error');
  });
};

/**
 * エントリーポイント
 */
app.get(['/', '/index.html'], (req, res) => {
  sendHtml(res, resolveEntryFile(req));
});

/**
 * 404
 */
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
