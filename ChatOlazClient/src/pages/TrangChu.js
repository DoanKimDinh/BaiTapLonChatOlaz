import React, { useState, useEffect } from "react";
import '../App.css';
import Cards from '../components/components/Cards';
const IP = require('../config/config')
var ipConfigg = IP.PUBLIC_IP;
const socket = require('socket.io-client')(ipConfigg);
const TrangChu = ()=> {
  return (
    <>
      <Cards />
      
    </>
  );
}
export {TrangChu,socket};
