import tailwindcss from 'tailwindcss';
import peers from 'tailwindcss/peers/index.js';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    tailwindcss,
    peers.lazyAutoprefixer(),
  ],
};

export default config;
