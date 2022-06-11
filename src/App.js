import React, { Component } from 'react';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Manager from "./views/Manager";
import Employee from "./views/Employee";
import Login from "./views/Login";
import Empty from "./views/Empty";


export default class App extends Component {
  render() {
    return (
      <BrowserRouter >
        <div >
          <center>
            <h2>Welcome to HR Leave System</h2>
          </center>

          <Routes>
            <Route path="/manager" element={<Manager />}/>
            <Route path="/employee" element={<Employee />}/>
            <Route path="/" element={<Login />}/>
            <Route path="*" element={<Empty />}/>  
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}
