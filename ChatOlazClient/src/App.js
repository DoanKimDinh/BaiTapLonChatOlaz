import React, { Component } from 'react';
import Navbar from './components/components/Navbar';
import './App.css';
import {TrangChu} from './pages/TrangChu';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import QuanLyNguoiDung from './pages/QuanLyNguoiDung';
import DanhBa from './pages/DanhBa';
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy';
import TinNhan from './pages/TinNhan';
import DatLaiMatKhau from './pages/DatLaiMatKhau';
class App extends Component {
  constructor(){
    super();
    this.state={
      user: '',
      id: '123',
      ten: '',
      avatar:'',
      email: '',
      sdt: '',
      pass:''
    }
  }
  xacThucUser = (users, id, ten, avatar, email, sdt, pass) =>{
  //  alert(avatar);
    this.setState({
      user: users,
      id: id,
      ten: ten,
      avatar: avatar,
      email:email,
      sdt: sdt,
      pass:pass
    });
  }
  xacThuc = (user,id)=>{
    this.setState({
      user: user,
      id: id
    });
  }
  render(){
      return (
        <>
          <Router>
            <Navbar xacThucNav = {this.state.user} id = {this.state.id} ten = {this.state.ten} avatar = {this.state.avatar} email = {this.state.email} sdt = {this.state.sdt} pass ={this.state.pass} xacThuc = {this.xacThuc}/>
            <Switch>
              <Route path='/' exact component={TrangChu}/>
              <Route path='/danh-ba' component={()=><DanhBa id = {this.state.id} userApp = {this.state.user}/>} />
              <Route path='/ql-nguoi-dung' component={QuanLyNguoiDung} />
              <Route path='/dang-nhap' component={()=><DangNhap xacThucUser = {this.xacThucUser}/>}/>
              <Route path='/dang-ky' component={DangKy}/>
              <Route path='/tin-nhan' component={TinNhan}/>
              <Route path='/dat-lai-mat-khau' component={DatLaiMatKhau}/>
            </Switch>
          </Router>
        </>
      );
    }
}
export default App;
