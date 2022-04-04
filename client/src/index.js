import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";


import Nav from './components/Nav'
import MangaList from './components/MangaList'
import User from './components/User'

import defaultParameters from './components/defaultParameters';

ReactDOM.render(
  <BrowserRouter>
  <React.StrictMode>
    <div className='nav-div'>
      <Nav />
    </div>
    <div className='content'>
    <Routes>
      <Route path='/'
        element={
          <MangaList
            endpoint={defaultParameters.mangas.endpoint}
            queryParams={defaultParameters.mangas.latest}
          />
        } />
      <Route path='/user' element={<User />} />
      <Route path='settings' element={
        <MangaList
            endpoint={defaultParameters.mangas.endpoint}
            isAuthenticated={defaultParameters.mangas.isAuthenticated}
            queryParams={defaultParameters.mangas.latest}
          />
      } />
    </Routes>
    <div id='footer'>
    <div id='footerDisclaimer'>
      <p>Data fetched from <a href='https://api.mangadex.org/docs.html'>MangaDex</a></p>
      <p>All credit and rights go to <a href='https://www.mangadex.org'>MangaDex</a> and the related scanlation groups</p>
      </div>
      <div id='footerMe'>
        <p>Website created by <a href='https://www.github.com/jorwaa'>Jøran Wigen Aasterud</a></p>
      </div>
    </div>
    </div>
  </React.StrictMode>
    </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
