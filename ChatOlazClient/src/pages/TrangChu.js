import React, { useState, useEffect } from "react";
import '../App.css';
import Cards from '../components/components/Cards';
const socket = require('socket.io-client')('http://localhost:3001');
const TrangChu = ()=> {
  return (
    <>
      <Cards />
      
    </>
  );
}
export {TrangChu,socket};
