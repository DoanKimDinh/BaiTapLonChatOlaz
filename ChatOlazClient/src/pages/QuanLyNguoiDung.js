import React from 'react';
import Footer from '../components/components/Footer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Row, Form, FormGroup, FormControl, Button, Table, Modal, InputGroup, ButtonGroup } from "react-bootstrap";
import axios from "axios";
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'
import { Redirect } from 'react-router-dom';
import FormData from 'form-data'

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

var id_tim = "";
const IP = require('../config/config')
var ipConfigg = IP.PUBLIC_IP;
class QuanLyNguoiDung extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ten: "",
			sdt: "",
			email: "",
			pass: "12345678",
			admin: false,
			tinhtrang: true,
			user: [],
			showAlert: false,
			alertMsg: "",
			alertType: "success",
			id: "",
			update: false,
			isOpen: false,
			findword: "",
			formErrors: {
				ten: "",
				sdt: "",
				email: "",
				pass: ""
			},
			avatar: undefined
		};
	}
	handleChange = e => {
		e.preventDefault();
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
			default:
				break;
		}
		this.setState({ formErrors, [name]: value }, () => console.log(this.state));
	};
	openModal = () => this.setState({ isOpen: true });
	closeModal = () => this.setState({ isOpen: false });
	componentWillMount() {
		this.fetchAllUsers();
	}

	// add user
	addUser = (evt) => {
		evt.preventDefault();
		if (formValid(this.state)) {
			var body = JSON.stringify({ ten: this.state.ten, sdt: this.state.sdt, email: this.state.email, pass: this.state.pass });
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};
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
									axios.post(ipConfigg + "/api/insert", body, config)
										.then((res) => {
											if (res.data.msg == "false") {
												Swal.fire(
													'Đăng Ký!',
													'Bạn đã đăng ký thất bại. SDT hoặc Email đã được sử dụng.',
													'error'
												)
											}
											else if (res.data.msg == "true") {
												this.setState({
													ten: "",
													sdt: "",
													email: "",
													pass: "12345678",
													tinhtrang: true,
													admin: false,
												});
												Swal.fire(
													'Đã Thêm!',
													'Bạn đã thêm 1 thành viên.',
													'success'
												)
												this.closeModal();
												this.fetchAllUsers();
											}
										});
								}
							})
					}
				})
		}
		else {
			console.log(this.state);
			return;
		}
	};
	// add user + s3
	submitUser = (evt) => {
		evt.preventDefault();
		const { ten, sdt, email, pass } = this.state;
		const body = JSON.stringify({ ten: ten, sdt: sdt, email: email, pass: pass });
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		// alert(avatar)
		if (formValid(this.state)) {
			axios.post(ipConfigg + "/api/insert", body, config)
				.then((res) => {
					if (res.data.msg == "false") {
						Swal.fire(
							'Đăng Ký!',
							'Bạn đã đăng ký thất bại. SDT hoặc Email đã được sử dụng.',
							'error'
						)
					}
					else if (res.data.msg == "true") {
						this.setState({
							ten: "",
							sdt: "",
							email: "",
							avatar: "",
							pass: "12345678",
							tinhtrang: true,
							admin: false,
						});
						Swal.fire(
							'Đã Thêm!',
							'Bạn đã thêm 1 thành viên.',
							'success'
						)
						this.fetchAllUsers();
					}
				});
		}
		else {
			console.log(this.state);
			return;
		}
	};
	// getIDByEmailOrSDT
	getIDByEmailOrSDT = (evt) => {
		const { id, sdt, email } = this.state;
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const body = JSON.stringify({ sdt, email });
		axios
			.post(ipConfigg + '/api/getID', body, config)
			.then((res) => {
				// var result_msg = JSON.parse(res.data.msg);
				this.setState({ id: res.data.msg });
				this.state.id.map((item) => {
					console.log("id tim" + item.id);
					id_tim = item.id;
					console.log(id_tim);
				});

			})
	};
	// fetch All users
	fetchAllUsers = () => {
		var headers = new Headers();
		headers.append("Content-Type", "application/json");
		fetch(ipConfigg + "/api/get", {
			method: "GET",
			headers: headers,
		})
			.then((response) => response.json())
			.then((result) => {
				this.setState({
					user: result.response,
				});
			})
			.catch((error) => console.log("error", error));
	};
	// find use
	findUser = () => {
		var items = [];
		if (this.state.findword.length > 0) {
			console.log(this.state.findword);
			this.setState({
				user: []
			});
			this.state.user.map((item) => {
				if (item.ten.toLowerCase().indexOf(this.state.findword) !== -1 || item.sdt.toLowerCase().indexOf(this.state.findword) !== -1 || item.email.toLowerCase().indexOf(this.state.findword) !== -1) {
					console.log(item.ten);
					items.push(item);
				}
			});
			this.setState({
				user: items
			});
		}
		else {
			this.fetchAllUsers();
		}
	};
	// update disable user
	disableUser = (email, sdt, id) => {
		fetch(ipConfigg + '/api/disableUser', {
			method: "put",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			//make sure to serialize your JSON body
			body: JSON.stringify({
				diaChiMail: email,
				soDienThoai: sdt,
				id: id
			})
		})
			.then((response) => { response.json() })
			.then((result) => {
				Swal.fire(
					'Đã Khóa!',
					'Bạn đã khóa tạm thời 1 tài khoản người dùng',
					'success'
				)
				this.fetchAllUsers();
			})
			.catch((error) => console.log("error", error));
	};
	// update enable user
	enableUser = (email, sdt, id) => {
		fetch(ipConfigg + '/api/enableUser', {
			method: "put",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			//make sure to serialize your JSON body
			body: JSON.stringify({
				diaChiMail: email,
				soDienThoai: sdt,
				id: id
			})
		})
			.then((response) => { response.json() })
			.then((result) => {
				Swal.fire(
					'Mở khóa!',
					'Bạn đã mở khóa 1 tài khoản người dùng',
					'success'
				)
				this.fetchAllUsers();
			})
			.catch((error) => console.log("error", error));
	};
	// delete user
	deleteUser = (email, sdt, id) => {
		Swal.fire({
			title: 'Bạn chắc chắn chứ?',
			text: 'Bạn sẽ không thể khôi phục hành động này!',
			type: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Có, xóa nó!',
			cancelButtonText: 'Không, trở về!'
		}).then((result) => {
			if (result.value) {
				fetch(ipConfigg + '/api/delete', {
					method: "delete",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					//make sure to serialize your JSON body
					body: JSON.stringify({
						diaChiMail: email,
						soDienThoai: sdt,
						id: id
					})
				})
					.then((response) => { response.json() })
					.then((result) => {
						Swal.fire(
							'người dùng!',
							'đã xóa thành công 1 thành viên.',
							'success'
						)
						this.fetchAllUsers();
					})
					.catch((error) => console.log("error", error));
			} else if (result.dismiss === Swal.DismissReason.cancel) {
				Swal.fire(
					'Đã hủy',
					'Dữ liệu không thay đổi',
					'error'
				)
			}
		})
	};
	// reset password
	resetPassword = (emailne, soDienThoai, id) => {
		Swal.fire({
			title: 'Bạn chắc chắn chứ?',
			text: 'Bạn sẽ không thể khôi phục hành động này!',
			type: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Có, đặt lại mật khẩu!',
			cancelButtonText: 'Không, trở về!'
		}).then((result) => {
			if (result.value) {
				fetch(ipConfigg + '/api/resetPassword', {
					method: "post",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},

					//make sure to serialize your JSON body
					body: JSON.stringify({
						diaChiMail: emailne,
						soDienThoai: soDienThoai,
						id: id
					})
				})
					.then((response) => { response.json() })
					.then((result) => {
						Swal.fire(
							'Mật Khẩu!',
							'Bạn đã đặt lại mật khẩu người dùng.',
							'success'
						)
						this.fetchAllUsers();
					})
					.catch((error) => console.log("error", error));
			} else if (result.dismiss === Swal.DismissReason.cancel) {
				Swal.fire(
					'Đã hủy',
					'Dữ liệu không thay đổi',
					'error'
				)
			}
		});
	};

	render() {
		const { formErrors } = this.state;
		if (localStorage.getItem('dangnhap') === null) {
			return <Redirect to={'/'} />
		}
		return (
			<div>
				<Container>
					<div className="d-flex align-items-center justify-content-center" style={{ height: "50px" }}>
						<Button variant="primary" onClick={this.openModal}>
							Thêm Người Dùng
						</Button>
						<label style={{ marginLeft: "200px" }}></label>
						<Form.Control
							type="text"
							name="findword"
							placeholder="Tìm Kiếm Người Dùng"
							onChange={this.handleChange}
							value={this.state.findword}
							style={{ width: "200px" }}
						/>
						<ButtonGroup aria-label="Basic example">
							<Button variant="primary" onClick={this.findUser}><FontAwesomeIcon icon="search"></FontAwesomeIcon></Button>
							<Button variant="primary" onClick={this.fetchAllUsers}><i className="fa fa-refresh"></i></Button>
						</ButtonGroup>
					</div>
					<Modal show={this.state.isOpen} onHide={this.closeModal}>
						<Modal.Header closeButton>
							<Modal.Title>Thêm Người Dùng</Modal.Title>
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
											name="ten"
											onChange={this.handleChange}
											value={this.state.ten}
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
											name="sdt"
											onChange={this.handleChange}
											value={this.state.sdt}
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
											name="email"
											onChange={this.handleChange}
											value={this.state.email}
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
											name="pass"
											readOnly
											onChange={this.handleChange}
											value={this.state.pass}
										/>
									</InputGroup>
								</FormGroup>
							</Form>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={this.closeModal}>Close</Button>
							<Button variant="primary" onClick={(evt) => this.addUser(evt)}>Thêm</Button>
						</Modal.Footer>
					</Modal>

					<Row>
						<Table striped bordered hover size="sm">
							<thead>
								<tr>
									<th>Tên</th>
									<th>Số Điện Thoại</th>
									<th>Email</th>
									<th>Tình Trạng</th>
									<th>Mật Khẩu</th>
									<th>Xóa</th>
								</tr>
							</thead>
							<tbody>
								{this.state.user.map((user) => {
									return (
										<tr>
											<td>{user.ten}</td>
											<td>{user.sdt}</td>
											<td>{user.email}</td>
											<td>
												{user.tinhtrang === 0 ? <Button variant="danger" onClick={() => this.enableUser(user.email, user.sdt, user.id)}>Disable</Button> : <Button variant="info" onClick={() => this.disableUser(user.email, user.sdt, user.id)}>Enable</Button>}
											</td>
											<td>
												<Button variant="warning" onClick={() => this.resetPassword(user.email, user.sdt, user.id)}>Reset</Button>
											</td>
											<td>
												<Button variant="danger" onClick={() => this.deleteUser(user.email, user.sdt, user.id)}>
													Xóa
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					</Row>
				</Container>
				<Footer />
			</div>
		);
	}
}

export default QuanLyNguoiDung;
