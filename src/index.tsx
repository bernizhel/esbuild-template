import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/styles.css';
import { App } from './components/App/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('The root component is not found');
}

const root = createRoot(rootElement);
root.render(<App />);
