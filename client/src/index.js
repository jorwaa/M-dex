import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import Nav from './components/Nav'
import MangaList from './components/MangaList'

import defaultParameters from './components/defaultParameters'; './components/defaultParameters'

ReactDOM.render(
  <React.StrictMode>
    <div className='nav-div'>
      <Nav />
    </div>
    <div className='content'>
      <div className="latest">
        <h1>Recently updated mangas</h1>
        <MangaList
          queryParams={defaultParameters.mangas.latest}
          /> 
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
