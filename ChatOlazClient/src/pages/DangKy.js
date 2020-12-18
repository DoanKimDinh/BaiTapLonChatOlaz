import React from "react";
import "../components/components/SignUp.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faCoffee } from '@fortawesome/fontawesome-free-solid';
import Footer from '../components/components/Footer';
import axios from "axios";
import { BrowserRouter as Redirect } from 'react-router-dom';
import Swal from 'sweetalert2/dist/sweetalert2.js' // npm install --save sweetalert2
import 'sweetalert2/src/sweetalert2.scss' // npm install node-sass
import { Tabs, Tab } from "react-bootstrap";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase";
var ma_otp = "";
var email_save = "", sdt_save = "";
var id_tim = "";
const IP = require('../config/config')
var ipConfigg = IP.PUBLIC_IP;

const firebaseConfig = {
    apiKey: "AIzaSyD1mCb2fgR7kjMNKEcDUSG-j96CxrIYbgo",
    authDomain: "olaz-veri-phone.firebaseapp.com",
    databaseURL: "https://olaz-veri-phone.firebaseio.com",
    projectId: "olaz-veri-phone",
    storageBucket: "olaz-veri-phone.appspot.com",
    messagingSenderId: "709590135743",
    appId: "1:709590135743:web:eccdbaae6185d613f8670a",
    measurementId: "G-4V10QY92F9"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().languageCode = 'it';

// window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
// window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
//     'size': 'normal',
//     'callback': function (response) {
//         // reCAPTCHA solved, allow signInWithPhoneNumber.
//         // ...
//         recaptchaVerifier.render().then(function(widgetId) {
//             window.recaptchaWidgetId = widgetId;
//           });
//     },
//     'expired-callback': function () {
//         // Response expired. Ask user to solve reCAPTCHA again.
//         // ...
//     }
// });
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
    });

    // validate the form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false);
    });

    return valid;
};

class Singin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            ten: "",
            sdt: "",
            email: "",
            pass: "",
            pass_xacnhan: "",
            maxacthuc: "",
            maotp: "",
            redirect: 0,
            formErrors: {
                ten: "",
                sdt: "",
                email: "",
                pass: "",
                pass_xacnhan: ""
            },
            phone: "",
            tam: ''
        };
        this.handleSetRidirectToTwo.bind(this);
        this.handleSetRidirectToFour.bind(this);
    }
    handleChange = e => {
        e.preventDefault();
        const { pass } = this.state;
        const { name, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        switch (name) {
            case "ten":
                formErrors.ten =
                    value.length < 1 ? "Tên không được bỏ trống" : "";
                break;
            case "sdt":
                formErrors.sdt = sdtRegex.test(value)
                    ? ""
                    : "SDT có 10 chữ số; ví dụ: 0123456789"
                break;
            case "email":
                formErrors.email = emailRegex.test(value)
                    ? ""
                    : "Email không hợp lệ; ví dụ: abc@gmail.com";
                break;
            case "pass":
                formErrors.pass =
                    value.length < 8 ? "Mật khẩu phải từ 8 kí tự trở lên" : "";
                break;
            case "pass_xacnhan":
                formErrors.pass_xacnhan =
                    value != pass ? "Mật khẩu xác nhận không khớp" : "";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [name]: value }, () => console.log(this.state));
    };
    getIDByEmailOrSDT = (evt) => {
        const { id, sdt, email } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ sdt, email });
        axios
            .post(ipConfigg + `/api/getID`, body, config)
            .then((res) => {
                this.setState({ id: res.data.msg });
                this.state.id.map((item) => {
                    console.log("id tim" + item.id);
                    id_tim = item.id;
                    console.log(id_tim);
                });

            })
    };
    updateTrangThaiUser = () => {
        fetch(ipConfigg + '/api/updateTrangThaiUser', {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diaChiMail: this.state.email,
                soDienThoai: this.state.sdt,
                id: this.state.id
            })
        })
            .then((response) => { response.json() })
    };
    senMail = (evt) => {
        evt.preventDefault();
        const { ten, sdt, email, pass, pass_xacnhan, maxacthuc } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ ten, sdt, email, pass, pass_xacnhan, maxacthuc });
        axios
            .post(ipConfigg + `/api/send-email`, body, config)
            .then((res) => {
                if (res.data.msg != "false") {
                    this.maotp = res.data.msg;
                    ma_otp = res.data.msg + "";
                    email_save = this.email;
                    sdt_save = this.sdt_save;
                    this.getIDByEmailOrSDT(evt);
                    this.redirect = 1;
                }
            })
    };
    xacThucTaiKhoan = (evt) => {
        evt.preventDefault();
        const { ten, sdt, email, pass, pass_xacnhan, maxacthuc, maotp } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ ten, sdt, email, pass, pass_xacnhan, maxacthuc, maotp });
        console.log("maxacthuc" + maxacthuc);
        console.log("maotp" + ma_otp);
        if (maxacthuc == ma_otp) {
            Swal.fire(
                'Xác Thực!',
                'Bạn đã xác thực thành công.',
                'success'
            )
            this.setState({ redirect: 2 });
        }
        else {
            Swal.fire(
                'Xác Thực!',
                'Bạn đã xác thực thất bại.',
                'error'
            )
        }
    };
    addThanhVienSubmit = (evt) => {
        evt.preventDefault();
        if (formValid(this.state)) {
            const { ten, sdt, email, pass, pass_xacnhan, maxacthuc } = this.state;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ ten, sdt, email, pass, pass_xacnhan, maxacthuc });
            axios
                .post(ipConfigg + `/api/dangky`, body, config)
                .then((res) => {
                    if (res.data.msg != "true") {
                        Swal.fire(
                            'Đăng Ký!',
                            'Bạn đã đăng ký thất bại. SDT hoặc Email đã được sử dụng.',
                            'error'
                        )
                    }
                    else if (res.data.msg == "true") {
                        Swal.fire(
                            'Đăng ký tài khoản thành công!',
                            'Vui lòng đăng nhập lại !!!',
                            'success'
                        )
                        this.setState({ redirect: 3 });
                    }
                })
        } else {
            console.log(this.state);
            return;
        }
    };
    handleSubmit = (evt) => {
        evt.preventDefault();
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { email } = this.state;
        const body = JSON.stringify({ email });
        if (this.state.email != "") {
            if (formValid(this.state)) {
                axios
                    .post(ipConfigg + `/api/kiemTraTrungEmail`, body, config)
                    .then((res) => {
                        if (res.data.msg == "true") {
                            Swal.fire(
                                'Đăng Ký!',
                                'Bạn đã đăng ký thất bại. Email đã được sử dụng.',
                                'error'
                            )
                        }
                        else if (res.data.msg == "false") {
                            Swal.fire(
                                'Xác Thực!',
                                'Mã xác thực đã gởi đến gmail của bạn!!!',
                                'success'
                            )

                            this.senMail(evt);
                            this.setState({ redirect: 1 });
                        }
                    })
            }
        }
        else {
            Swal.fire(
                'Lỗi!',
                'Không được để trống email!',
                'error'
            )
        }

    };
    handleClick = () => {
        var recaptcha = new firebase.auth.RecaptchaVerifier('recaptcha');
        var number = this.state.sdt;
        firebase.auth().signInWithPhoneNumber(number, recaptcha).then(function (e) {
            var code = prompt('Enter the otp', '');
            if (code === null) return;
            e.confirm(code).then(function (result) {
                console.log(result.user);
            }).catch(function (error) {
                console.error(error);
            });
        })
            .catch(function (error) {
                console.error(error);
            });
    }
    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => console.log(user));
    }
    checkTrungSDT = (evt) => {
        evt.preventDefault();
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { sdt } = this.state;
        const body = JSON.stringify({ sdt });
        if (this.state.sdt != "") {
            if (formValid(this.state)) {
                axios
                    .post(ipConfigg + `/api/kiemTraTrungSDT`, body, config)
                    .then((res) => {
                        if (res.data.msg == "true") {
                            Swal.fire(
                                'Đăng Ký!',
                                'Bạn đã đăng ký thất bại. SDT đã được sử dụng.',
                                'error'
                            )
                        }
                        else if (res.data.msg == "false") {
                            Swal.fire(
                                'Xác Thực!',
                                'Mã xác thực đã gởi đến SDT của bạn!!!',
                                'success'
                            )
                            this.onSignInSubmit()
                        }
                    })
            }
        }
        else {
            Swal.fire(
                'Lỗi!',
                'Không được để trống email!',
                'error'
            )
        }
    }
    handleSetRidirectToFour () {
        this.setState({
            redirect: 4
        });
    }
    handleSetRidirectToTwo(){
        this.setState({
            redirect: 2
        });
    }
    setUpRecaptcha = () => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            "recaptcha-container",
            {
                size: "invisible",
                callback: function (response) {
                    console.log("Captcha Resolved");
                    this.onSignInSubmit();
                },
                defaultCountry: "VN",
            }
        );
    }
    onSignInSubmit = () => {
        // e.preventDefault();
        this.setUpRecaptcha();
        let phoneNumber = "+84" + this.state.sdt;
        console.log(phoneNumber);
        let appVerifier = window.recaptchaVerifier;
        firebase
            .auth()
            .signInWithPhoneNumber(phoneNumber, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                console.log("OTP is sent");
                this.setState({ redirect: 4 });
            })
            .catch((error) => {
                console.log(error);
            });
    }
    onSubmitOtp = (e) => {
        e.preventDefault();
        let otpInput = this.state.maxacthuc;
        let optConfirm = window.confirmationResult;
        optConfirm
            .confirm(otpInput)
            .then((result) => {
                let user = result.user;
                this.setState({ redirect: 2 });
            })
            .catch((error) => {
                console.log(error);
                alert("Incorrect OTP");
            });
    }
    render() {
        const { formErrors } = this.state;
        const { redirect } = this.state;
        if (redirect == 1) {
            return (
                <>
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="card bg-light">
                                <article
                                    className="card-body mx-auto"
                                    style={{ maxWidth: "400px" }}
                                >
                                    <h4 className="card-title mt-3 text-center">
                                        Xác thực tài khoản
                                    </h4>
                                    <p className="text-center">
                                        Mã xác thực đã gởi về gmail của bạn
                                    </p>

                                    <form>
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="user" />
                                                </span>
                                            </div>
                                            <input
                                                name="maxacthuc"
                                                className="form-control"
                                                placeholder="Nhập mã xác thực"
                                                type="text"
                                                onChange={this.handleChange}
                                                value={this.state.maxacthuc}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <button
                                                onClick={(evt) => this.xacThucTaiKhoan(evt)}
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                            >
                                                {" "}
                                                Xác thực{" "}
                                            </button>
                                        </div>
                                    </form>
                                </article>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            );
        }
        else if (redirect == 2) {
            return (
                <>
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="card bg-light">
                                <article
                                    className="card-body mx-auto"
                                    style={{ maxWidth: "400px" }}
                                >
                                    <h4 className="card-title mt-3 text-center">
                                        Đăng Ký
                                    </h4>
                                    <p className="text-center">
                                        Để tham gia cùng OLAZ
                                    </p>
                                    <form>
                                        <div className="form-error" style={{ fontSize: 12, color: "red" }}>
                                            {this.state.tenError}
                                        </div>
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="user" />
                                                </span>
                                            </div>
                                            <input
                                                name="ten"
                                                className={formErrors.ten.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập tên của bạn"
                                                type="text"
                                                onChange={this.handleChange}
                                                value={this.state.ten}
                                            />
                                        </div>
                                        {formErrors.ten.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.ten}</span>
                                        )}
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="phone" />
                                                </span>
                                            </div>
                                            <input
                                                name="sdt"
                                                className={formErrors.sdt.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Số Điện Thoại"
                                                type="text"
                                                onChange={this.handleChange}
                                                value={this.state.sdt}
                                            />
                                        </div>
                                        {formErrors.sdt.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.sdt}</span>
                                        )}
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="envelope" />
                                                </span>
                                            </div>
                                            <input
                                                name="email"
                                                className={formErrors.email.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Email"
                                                type="email"
                                                onChange={this.handleChange}
                                                value={this.state.email}
                                            />
                                        </div>
                                        {formErrors.email.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.email}</span>
                                        )}
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="lock" />
                                                </span>
                                            </div>
                                            <input
                                                name="pass"
                                                className={formErrors.pass.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Mật Khẩu"
                                                type="password"
                                                onChange={this.handleChange}
                                                value={this.state.pass}
                                            />
                                        </div>
                                        {formErrors.pass.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.pass}</span>
                                        )}
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="lock" />
                                                </span>
                                            </div>
                                            <input
                                                name="pass_xacnhan"
                                                className={formErrors.pass_xacnhan.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Lại Mật Khẩu"
                                                type="password"
                                                onChange={this.handleChange}
                                                value={this.state.pass_xacnhan}
                                            />
                                        </div>
                                        {formErrors.pass_xacnhan.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.pass_xacnhan}</span>
                                        )}
                                        <div className="form-group">
                                            <button
                                                onClick={(evt) => this.addThanhVienSubmit(evt)}
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                            >
                                                {" "}
                                                Đăng Ký{" "}
                                            </button>
                                        </div>
                                        <p className="text-center">
                                            Bạn Đã Có Tài Khoản? <a href="/dang-nhap">Đăng Nhập</a>{" "}
                                        </p>
                                    </form>
                                </article>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            );
        }
        else if (redirect == 3) {
            return <Redirect to={'/dang-nhap'} />
        }
        else if (redirect == 4) {
            return (
                <>
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="card bg-light">
                                <article
                                    className="card-body mx-auto"
                                    style={{ maxWidth: "400px" }}
                                >
                                    <h4 className="card-title mt-3 text-center">
                                        Xác thực tài khoản
                                    </h4>
                                    <p className="text-center">
                                        Mã xác thực đã gởi về số điện thoại của bạn
                                    </p>

                                    <form>
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="user" />
                                                </span>
                                            </div>
                                            <input
                                                name="maxacthuc"
                                                className="form-control"
                                                placeholder="Nhập mã xác thực"
                                                type="text"
                                                onChange={this.handleChange}
                                                value={this.state.maxacthuc}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <button
                                                onClick={this.onSubmitOtp}
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                            >
                                                {" "}
                                                Xác thực{" "}
                                            </button>
                                        </div>
                                    </form>
                                </article>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            );
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
                                <h4 className="card-title mt-3 text-center">
                                    Đăng ký
                                </h4>
                                <p className="text-center">
                                    Vui lòng chọn đăng ký bằng email hoặc số điện thoại
                                </p>

                                <Tabs defaultActiveKey="email" id="uncontrolled-tab-example">
                                    <Tab eventKey="email" title="Bắt Đầu Bằng Email">
                                        <form>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="envelope" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="email"
                                                    className={formErrors.email.length > 0 ? "error" : null}
                                                    className="form-control"
                                                    placeholder="Nhập Email"
                                                    type="email"
                                                    onChange={this.handleChange}
                                                    value={this.state.email}
                                                />
                                            </div>
                                            {formErrors.email.length > 0 && (
                                                <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.email}</span>
                                            )}
                                            <div className="form-group">
                                                <button
                                                    onClick={(evt) => this.handleSubmit(evt)}
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                >
                                                    {" "}
                                                        Tiếp Tục{" "}
                                                </button>
                                            </div>
                                            <p className="text-center">
                                                Bạn Đã Có Tài Khoản? <a href="/dang-nhap">Đăng Nhập</a>{" "}
                                            </p>
                                        </form>
                                    </Tab>
                                    <Tab eventKey="sdt" title="Bắt Đầu Bằng SDT">
                                        <form>
                                            <div id="recaptcha-container"></div>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="phone" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="sdt"
                                                    className={formErrors.sdt.length > 0 ? "error" : null}
                                                    className="form-control"
                                                    placeholder="Nhập SDT"
                                                    type="text"
                                                    onChange={this.handleChange}
                                                    value={this.state.sdt}
                                                />
                                            </div>
                                            {formErrors.sdt.length > 0 && (
                                                <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.sdt}</span>
                                            )}
                                            <div className="form-group">
                                                <button
                                                    onClick={this.checkTrungSDT}
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                >
                                                    {" "}
                                                        Tiếp Tục{" "}
                                                </button>
                                            </div>
                                            <p className="text-center">
                                                Bạn Đã Có Tài Khoản? <a href="/dang-nhap">Đăng Nhập</a>{" "}
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
export default Singin;