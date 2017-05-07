import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import App from './App.jsx';

const router = (
  <Router>
    <Route component={App} />
  </Router>
)

ReactDOM.render(
  router,
  document.getElementById('root')
)
