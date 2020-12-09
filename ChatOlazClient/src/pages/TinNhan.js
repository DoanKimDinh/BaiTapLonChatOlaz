import React, { Component } from 'react';
import '../App.css';
import Footer from '../components/components/Footer';
import ChatShell from '../containers/shell/ChatShell';

class TinNhan extends Component {
  constructor(props){
    super(props);
    this.state = {

    };
  }
  render(){
    return(
      <>
        <ChatShell/>
      </>
    )
  }
}
export default TinNhan;