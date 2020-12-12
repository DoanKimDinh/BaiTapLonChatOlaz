import React, { useState, useEffect, Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import './Navbar.css';
import axios from "axios";
import Swal from 'sweetalert2/dist/sweetalert2.js' // npm install --save sweetalert2
import 'sweetalert2/src/sweetalert2.scss' // npm install node-sass
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faCoffee } from '@fortawesome/fontawesome-free-solid';
import { Container, Row, Form, FormGroup, FormControl, Button, Table, Modal, InputGroup, ButtonGroup } from "react-bootstrap";
import TrangChu,{socket} from '../../pages/TrangChu';
import makeToast from "../../components/controls/toast/Toaster";
import ip from '../../config/config'
const emailRegex = RegExp(
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

const sdtRegex = RegExp(
  /^(0)[1-9]{1}[0-9]{8}$/
);

const formValid = ({ formErrors, ...rest }) => {
  let valid = true;

  // validate form errors being empty
  Object.values(formErrors).forEach(val => {
    val.length > 0 && (valid = false);
  //  console.log(val)
  });

  // validate the form was filled out
  Object.values(rest).forEach(val => {
    val === null && (valid = false);
  });

  return valid;
};
var ipConfigg = ip.PUBLIC_IP;
class navBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ten: localStorage.getItem('ten'),
      sdt: "",
      email: "",
      id: "",
      pass: "",  
      tenUpdate: localStorage.getItem('ten'),
      sdtUpdate: "",
      emailUpdate: "",
      passUpdate: "",
      admin: false,
      tinhtrang: true,
      user: [],
      showAlert: false,
      alertMsg: "",
      alertType: "success",
      update: false,
      isOpen: false,
      findword: "",
      click: false,
      formErrors: {
        ten: "",
        sdt: "",
        email: "",
        pass: ""
      },
      avatar: undefined,
      avatarUpdate: undefined
    };
    socket.on('change_message_user',(newMessage)=>{
      if(newMessage.id_toFriend == localStorage.getItem("id")){
        makeToast("success", "Bạn có tin nhắn mới");
      }
    });
  }
  changeDangXuat = () => {
    localStorage.clear();
    sessionStorage.clear();
    // props.xacThuc('', '');
  }

  handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    switch (name) {
      case "tenUpdate":
        formErrors.ten =
          value.length < 1 ? "Tên không được bỏ trống" : "";
        break;
      case "sdtUpdate":
        formErrors.sdt = sdtRegex.test(value)
          ? ""
          : "SDT có 10 chữ số; ví dụ: 0123456789"
        break;
      case "emailUpdate":
        formErrors.email = emailRegex.test(value)
          ? ""
          : "Email không hợp lệ; ví dụ: abc@gmail.com";
        break;
      case "passUpdate":
        formErrors.pass =
          value.length < 8 ? "Mật khẩu phải từ 8 kí tự trở lên" : "";
        break;
      default:
        break;
    }
    if(e.target.files == null){
      this.setState({ formErrors, [name]: value}, () => console.log(this.state));
    }else
     this.setState({ formErrors, [name]: value, avatarUpdate: e.target.files }, () => console.log(this.state));

  };
  handleClick = () => {
    if (this.state.click) {
      this.setState({ click: false })
    } else {
      this.setState({ click: true })
    }
  }
  closeMobileMenu = () => this.setState({ click: false })
  openModal = () =>{
    this.loadData(); 
    this.setState({ isOpen: true, email: localStorage.getItem('email'), emailUpdate: localStorage.getItem('email') })
  };
  closeModal = () => this.setState({ isOpen: false });
  loadData = () => {
    this.setState({
      ten: localStorage.getItem('ten'),
      avatar: localStorage.getItem('avatar'),
      email: localStorage.getItem('email'),
      sdt: localStorage.getItem('sdt'),
      id: localStorage.getItem('id'),
      pass: localStorage.getItem('pass'),
      tenUpdate: localStorage.getItem('ten'),
      emailUpdate: localStorage.getItem('email'),
      sdtUpdate: localStorage.getItem('sdt'),
      passUpdate: localStorage.getItem('pass'),
    })
  }
  closeUpdateModal = () => {
    this.loadData()
    this.closeModal()
  }
  componentWillMount() {
    this.loadData()
  }
  submitUser = (evt) => {
    evt.preventDefault();
    const formData = new FormData();
    const { id, tenUpdate, sdtUpdate, emailUpdate, passUpdate, avatarUpdate } = this.state;


    if (avatarUpdate == undefined) {
      const body = JSON.stringify({ id: id, ten: tenUpdate, sdt: sdtUpdate, email: emailUpdate, pass: passUpdate, avatar: avatarUpdate });
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if(formValid(this.state)) {
        localStorage.setItem('ten',tenUpdate);
        localStorage.setItem('email', emailUpdate );
        localStorage.setItem('sdt', sdtUpdate);
        localStorage.setItem('id', id);
        localStorage.setItem('pass',passUpdate);
        axios.post(ipConfigg + "/api/updateUser2", body, config)
          .then((res) => {
            if (res.data.msg == "false") {
              Swal.fire(
                'Lỗi Cập Nhật!',
                'Bạn đã cập nhật thất bại. Thử lại sao...',
                'error'
              )
            }
            else if (res.data.msg == "true") {
              Swal.fire(
                'Cập Nhật!',
                'Bạn đã cập nhật thông tin thành công 1 thành viên.',
                'success'
              ).then(() => {
                this.closeModal()
                this.loadData()
              })
            }
          });
      }
      else {

        return;
      }
    } else {
      localStorage.setItem('ten',tenUpdate);
      localStorage.setItem('email', emailUpdate );
      localStorage.setItem('sdt', sdtUpdate);
      localStorage.setItem('id', id);
      localStorage.setItem('pass',passUpdate);
      localStorage.setItem('avatar', avatarUpdate[0].name);
      formData.append('avatar', avatarUpdate[0]);
      let avatarName = avatarUpdate[0].name;
      const body = JSON.stringify({ id: id, ten: tenUpdate, sdt: sdtUpdate, email: emailUpdate, pass: passUpdate, avatar: avatarName });
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (formValid(this.state)) {
        axios
          .post(ipConfigg + `/api/files/upload`, formData, config)
          .then((res) => {
            if (res.data.msg == "true") {
              console.log('updated avatar')
            }
            else {
              console.log('loi upload avatar')
            }
          });
        axios.post(ipConfigg + "/api/updateUser", body, config)
          .then((res) => {
            if (res.data.msg == "false") {
              Swal.fire(
                'Lỗi Cập Nhật!',
                'Bạn đã cập nhật thất bại. Thử lại sao...',
                'error'
              )
            }
            else if (res.data.msg == "true") {          
              Swal.fire(
                'Cập Nhật!',
                'Bạn đã cập nhật thông tin thành công 1 thành viên.',
                'success'
              ).then(() => {
                this.closeModal()
                this.loadData()
              })
            }
          });
      }
      else {
        console.log(this.state);
        return;
      }
    }
  };

  render() {
    const { formErrors } = this.state;

    if (localStorage.getItem('dangnhap') == 'dadangnhapAdmin'){
      return (
        <>
          <nav className='navbar'>
            <div className='navbar-container'>
              <Link to='/' className='navbar-logo' onClick={this.closeMobileMenu}>
                OLAZ <i className="fab fa-typo3"></i>
              </Link>
              <div className='menu-icon' onClick={this.handleClick}>
                <i className={this.state.click ? 'fas fa-times' : 'fas fa-bars'} />
              </div>
              <ul className={this.state.click ? 'nav-menu active' : 'nav-menu'}>
                <li className='nav-item'>
                  <Link to='/ql-nguoi-dung' className='nav-links' onClick={this.closeMobileMenu}>
                    Quản Lý Người Dùng
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link to='/' className='nav-links' onClick={this.closeMobileMenu}>
                    <Button variant="primary" onClick={this.changeDangXuat}>Đăng Xuất</Button>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </>
      );
    }
    else if (localStorage.getItem('dangnhap') == 'daDangNhapUser') {
      return (  
        <nav className='navbar'>
          <div className='navbar-container'>
            <Link to='/' className='navbar-logo' onClick={this.closeMobileMenu}>
              OLAZ <i className="fab fa-typo3"></i>
            </Link>
            <div className='menu-icon' onClick={this.handleClick}>
              <i className={this.state.click ? 'fas fa-times' : 'fas fa-bars'} />
            </div>
            <ul className={this.state.click ? 'nav-menu active' : 'nav-menu'}>
              <li className='nav-item'>
                <Link to='/tin-nhan' className='nav-links' onClick={this.closeMobileMenu}>
                  Tin Nhắn
                </Link>
              </li>
              <li className='nav-item'>
                <Link to='/danh-ba' className='nav-links' onClick={this.closeMobileMenu}>
                  Danh bạ
                </Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-links' onClick={this.closeMobileMenu}>
                  <div class='user' onClick={this.handleShow}>
                    <img src={ipConfigg + "/api/files/" + localStorage.getItem('avatar')} onClick={this.openModal} />
                    <p>{localStorage.getItem('ten')}</p>
                  </div>
                </Link>
              </li>
              <li className='nav-item'>
                <Link to='/' className='nav-links' onClick={this.closeMobileMenu}>
                  <Button variant="primary" onClick={this.changeDangXuat}>Đăng Xuất</Button>
                </Link>
              </li>
            </ul>
          </div>
          <Modal show={this.state.isOpen} onHide={this.closeModal}>
            <Modal.Header closeButton>
              <Modal.Title><img class="imgUser" src={ipConfigg + "/api/files/" + this.state.avatar} /></Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form enctype="multipart/form-data">
                <FormGroup>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="user" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      type="text"
                      className={formErrors.ten.length > 0 ? "error" : null}
                      placeholder="Tên Đăng Nhập"
                      name="tenUpdate"
                      onChange={this.handleChange}
                      value={this.state.tenUpdate}
                    />
                  </InputGroup>
                  {formErrors.ten.length > 0 && (
                    <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.ten}</span>
                  )}
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="phone" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      placeholder="Số Điện Thoại"
                      className={formErrors.sdt.length > 0 ? "error" : null}
                      type="text"
                      name="sdtUpdate"
                      onChange={this.handleChange}
                      value={this.state.sdtUpdate}
                    />
                  </InputGroup>
                  {formErrors.sdt.length > 0 && (
                    <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.sdt}</span>
                  )}
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="envelope" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      placeholder="Email"
                      className={formErrors.email.length > 0 ? "error" : null}
                      type="email"
                      name="emailUpdate"
                      onChange={this.handleChange}
                      value={this.state.emailUpdate}
                    />
                  </InputGroup>
                  {formErrors.email.length > 0 && (
                    <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.email}</span>
                  )}
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="lock" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      placeholder="Mật Khẩu"
                      className={formErrors.pass.length > 0 ? "error" : null}
                      type="password"
                      name="passUpdate"
                      onChange={this.handleChange}
                      value={this.state.passUpdate}
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <FormControl

                      type="file"
                      name="avatarUpdate"
                      onChange={this.handleChange}

                    />
                  </InputGroup>
                  {formErrors.pass.length > 0 && (
                    <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.pass}</span>
                  )}
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={(evt) => this.submitUser(evt)}>Cập Nhật</Button>
              <Button variant="secondary" onClick={this.closeUpdateModal}>Đóng</Button>
            </Modal.Footer>
          </Modal>
        </nav>
      );
    }
    else {
      return (
        <>
          <nav className='navbar'>
            <div className='navbar-container'>
              <Link to='/' className='navbar-logo' onClick={this.closeMobileMenu}>
                OLAZ <i className="fab fa-typo3"></i>
              </Link>
              <div className='menu-icon' onClick={this.handleClick}>
                <i className={this.state.click ? 'fas fa-times' : 'fas fa-bars'} />
              </div>
              <ul className={this.state.click ? 'nav-menu active' : 'nav-menu'}>
                <li className='nav-item'>
                  <Link to='/dang-nhap' className='nav-links' onClick={this.closeMobileMenu}>
                    <Button variant="primary">Đăng Nhập</Button>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </>
      );
    }
  }
}
export default navBar;