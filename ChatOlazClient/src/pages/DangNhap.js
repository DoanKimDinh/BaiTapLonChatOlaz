import React,{ Component } from "react";
import "../components/components/SignUp.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter as Redirect } from 'react-router-dom';
import Footer from "../components/components/Footer";
import Swal from 'sweetalert2/dist/sweetalert2.js' // npm install --save sweetalert2
import 'sweetalert2/src/sweetalert2.scss' // npm install node-sass
import { Tabs, Tab } from "react-bootstrap";
import { connect } from "react-redux";

const IP = require('../config/config')
var ipConfigg = IP.PUBLIC_IP;

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sdt: "",
            email: "",
            pass: "",
            id: "",
            ten: "",
            avatar: "",
            redirect: 0,
            user: [],
            endpoint : '/',
        };
        
    }
    handleChange = (evt) => {
        evt.preventDefault();
        this.setState({
            [evt.target.name]: evt.target.value,
        });
    };

    kiemTraDangNhapUser = (evt) => {
        evt.preventDefault();
        const { email, pass, sdt } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ email, pass, sdt });
        axios
            .post(ipConfigg + `/api/dangNhapUser`, body, config)
            .then((res) => {
                if (res.data.msg == "user-false") {
                    Swal.fire(
                        'Đăng Nhập!',
                        'Bạn đã nhập sai tài khoản hoặc mật khẩu',
                        'error'
                    )
                    return;
                }
                else if (res.data.msg == "user-true") {
                    localStorage.setItem('dangnhap', 'daDangNhapUser');
                     localStorage.setItem('id',res.data.id);
                     localStorage.setItem('ten', res.data.ten)
                     localStorage.setItem('avatar', res.data.avatar)
                     localStorage.setItem('email', res.data.email)
                    //  alert(localStorage.getItem('email'));
                     localStorage.setItem('sdt', res.data.sdt)
                     localStorage.setItem('pass', res.data.pass)
                    this.props.xacThucUser('dangnhap',res.data.id, res.data.ten, res.data.avatar, res.data.email, res.data.sdt, res.data.pass)
                    this.handleSetRidirect();
                    Swal.fire(
                        'Đăng Nhập!',
                        'Bạn đã đăng nhập thành công có thể trò chuyện với bạn bè ngay bây giờ',
                        'success'
                    )
                    const authToken = res.data.token
                    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
                    return;
                }
            })
    };
    handleSubmit = (evt) => {
        evt.preventDefault();
        const { email, pass, sdt } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ email, pass, sdt });
        axios
            .post(ipConfigg + `/api/dangNhapAdmin`, body, config)
            .then((res) => {
                if (res.data.msg == "admin-true") {
                    this.handleSetRidirect();
                }

                if (res.data.msg == "admin-false") {
                    this.kiemTraDangNhapUser(evt);
                }
                else if (res.data.msg == "admin-true") {
                    localStorage.setItem('dangnhap', 'dadangnhapAdmin');
                    localStorage.setItem('id',res.data.id);
                    localStorage.setItem('ten', res.data.ten)
                    localStorage.setItem('avatar', res.data.avatar)
                    localStorage.setItem('email', res.data.email)
                    localStorage.setItem('sdt', res.data.sdt)
                    localStorage.setItem('pass', res.data.pass)
                    this.props.xacThucUser('dangnhap');
                    Swal.fire(
                        'Đăng Nhập!',
                        'Bạn đã đăng nhập thành công với quyền admin.',
                        'success'
                    )
                    const authToken = res.data.token
                    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
                }
            })
    };
    handleSetRidirect = () => {
        this.setState({
            redirect: 1
        });
    }
    render() {
        const { redirect } = this.state;
        console.log('redirect la ' + this.state.redirect);
        if (redirect == 1) {
            return <Redirect to={'/'} />
        }
        else if (localStorage.getItem('dangnhap') == "dadangnhapAdmin") {
            return <Redirect to={'/ql-nguoi-dung'} />
        }
        else if (localStorage.getItem('dangnhap') == "daDangNhapUser") {
            return <Redirect to={{pathname:'/tin-nhan',id: 'cf3a62c0-257a-11eb-99ef-9b9d314e28ba'}} />
        }
        return (
            <>
                <div className="row justify-content-center">
                    <div className="col-lg-6 text-center">
                        <div className="card bg-light">
                            <article
                                className="card-body mx-auto"
                                style={{ maxWidth: "400px" }}
                            >
                                <h4 className="card-title mt-3 text-center">Đăng Nhập</h4>
                                <p className="text-center">Để tham gia cùng OLAZ</p>
                                <Tabs defaultActiveKey="email" id="uncontrolled-tab-example">
                                    <Tab eventKey="sdt" title="Bắt Đầu Bằng SDT">
                                        <form>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="user" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="sdt"
                                                    className="form-control"
                                                    placeholder="Nhập SĐT"
                                                    type="text"
                                                    onChange={this.handleChange}
                                                    value={this.state.sdt}
                                                />
                                            </div>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="lock" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="pass"
                                                    className="form-control"
                                                    placeholder="Nhập Mật Khẩu"
                                                    type="password"
                                                    onChange={this.handleChange}
                                                    value={this.state.pass}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <button
                                                    onClick={(evt) => this.handleSubmit(evt)}
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                >
                                                    Đăng Nhập
                                        </button>
                                            </div>
                                            <p className="text-center">
                                                Quên Mật Khẩu? <a href="/dat-lai-mat-khau">Đặt Lại Mật Khẩu</a>{" "}
                                            </p>
                                            <p className="text-center">
                                                Tham Gia Cùng Chúng Tôi? <a href="/dang-ky">Đăng Ký</a>{" "}
                                            </p>
                                        </form>
                                    </Tab>
                                    <Tab eventKey="email" title="Bắt Đầu Bằng Email">
                                        <form>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="user" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Nhập email"
                                                    type="text"
                                                    onChange={this.handleChange}
                                                    value={this.state.email}
                                                />
                                            </div>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="lock" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="pass"
                                                    className="form-control"
                                                    placeholder="Nhập Mật Khẩu"
                                                    type="password"
                                                    onChange={this.handleChange}
                                                    value={this.state.pass}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <button
                                                    onClick={(evt) => this.handleSubmit(evt)}
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                >
                                                    Đăng Nhập
                                        </button>
                                            </div>
                                            <p className="text-center">
                                                Quên Mật Khẩu? <a href="/dat-lai-mat-khau">Đặt Lại Mật Khẩu</a>{" "}
                                            </p>
                                            <p className="text-center">
                                                Tham Gia Cùng Chúng Tôi? <a href="/dang-ky">Đăng Ký</a>{" "}
                                            </p>
                                        </form>
                                    </Tab>
                                </Tabs>
                            </article>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
export default Signup;