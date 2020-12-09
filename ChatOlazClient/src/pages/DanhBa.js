import React, { useEffect } from 'react';
import '../App.css';
import Footer from '../components/components/Footer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Row, Form, FormGroup, FormControl, Button, Table, Modal, InputGroup, ButtonGroup, Tabs, Tab, Nav, Col } from "react-bootstrap";
import axios from "axios";
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'
import '../components/components/DanhBa.scss'
import TableScrollbar from 'react-table-scrollbar';
import { config } from '@fortawesome/fontawesome-svg-core';
import { Redirect } from 'react-router-dom';
import TrangChu,{socket} from './TrangChu';
var ReactDOM = require('react-dom');
var ScrollArea = require('react-scrollbar');
let groupMembers = []
const IP = require('../config/config')
var ipConfigg = IP.PUBLIC_IP;
class DanhBa extends React.Component {
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
      id: localStorage.getItem('id'),
      userApp: this.props.userApp,
      update: false,
      isOpen: false,
      isOpenUpdateGroupModal: false,
      findword: "",
      friends: [],
      friend_requests: [],
      timkiem: '',
      friends_search: [],
      booleanFriend: "",
      groupName: "",
      groups: [],
      members: "",
      friendsOutOfGroup: [],
      idGroup: ""
    };
    // socket = require('socket.io-client')('http://localhost:3001');
    socket.on('connect',()=>{
        console.log("connect");
    });
    socket.on('get_dataFriendRequest',()=>{
      this.showFriendsRequest();
        console.log("da nhan dc :(")
    });
  }
  handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState({ [name]: value })
  };
  change_dataFriend = () =>{
      console.log("da nhay vao data friend");
      socket.emit('add_change_dataFriend',(this.state.id));
      this.showFriends();
      this.showFriendsRequest();
      this.handleSearchTimKiem();
      this.fetchAllGroups();
      
  }
  getDataFriend_Reques = friend_Rq =>{
    this.showFriendsRequest();
    //this.setState({friend_requests:friend_Rq})
  };
  componentDidMount(){
    
  }
  componentWillMount() {
    this.fetchAllUsers();
    this.showFriends();
    this.fetchAllGroups();
    socket.emit('add_change_dataFriend');
    socket.on('get_dataFriendRequest',this.getDataFriend_Reques);
    socket.on('change_dataFriend',this.change_dataFriend);
  }
  // su kien co du lieu thay doi o 1 user
  change_user = idUser =>{
    console.log("Thay doi friend");
    this.showFriendsRequest();
      socket.emit('change_friend_request',idUser);
  };
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
  fetchAllFriends = () => {
    const { id } = this.state;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id });
    axios
      .post(ipConfigg + '/api/friends', body, config)
      .then((res) => {
        this.setState({
          friends: res.data.response
        });
        console.log(res.data.response);
      })
  };
  fetchFriendsForUpDateGroup = (idGroup) => {
    const { id } = this.state;
    this.setState({ idGroup: idGroup })
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id, idGroup: idGroup });
    axios
      .post(ipConfigg + '/api/friendsforupdategroup', body, config)
      .then((res) => {
        this.setState({
          friendsOutOfGroup: res.data.response
        });
        console.log(res.data.response);
      })
  };
  showFriends = () => {
    this.fetchAllFriends();
  }
  showFriendsRequest = () => {
    this.fetchAllFriend_Requests();
  }
  fetchAllFriend_Requests = () => {
    const { id } = this.state;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id });
    axios
      .post(ipConfigg + '/api/friend_requests', body, config)
      .then((res) => {
        this.setState({
          friend_requests: res.data.response
        });
        console.log(this.state.id);
        console.log(this.state.userApp);
      })
  };
  chapnhanketban = (evt) => {
    evt.preventDefault();
    var body = JSON.stringify({ id: this.state.id });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios.post(ipConfigg + "/api/chapnhanketban", body, config)
      .then((res) => {
        if (res.data.msg == "false") {
          Swal.fire(
            'Lỗi Chấp Nhận Kết Bạn!',
            'Hiện Tại Bạn Không Thể Thêm Bạn Bè',
            'error'
          )
        }
        else if (res.data.msg == "true") {
          this.setState({
            ten: "",
            sdt: "",
            email: "",
            pass: "",
            tinhtrang: true,
            admin: false,
          });
          Swal.fire(
            'Đã Thêm Bạn Bè!',
            'Bạn đã đồng ý kết bạn thành công',
            'success'
          )

        }
      });
    this.fetchAllUsers();
    //
    this.change_user(this.state.id);
  };
  handleAccessFriend = (id, idFriend) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id, idfriend: idFriend });
    axios
      .post(ipConfigg + '/api/updateTrangThaiFriend', body, config)
      .then((res) => {
        this.showFriends();
        this.showFriendsRequest();
        this.handleSearchTimKiem();
        
        //
        this.change_user(this.state.id);
      })
  }
  handleCancelFriend = (id, idFriend) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id, idfriend: idFriend });
    axios
      .post(ipConfigg + '/api/XoaYeuCauKetBan', body, config)
      .then((res) => {
        // var result_msg = JSON.parse(res.data.msg);
        this.showFriends();
        this.showFriendsRequest();
        this.handleSearchTimKiem();
            //
            this.change_user(this.state.id);
      })
  }
  handleUnfriend = (id, idFriend) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id, idfriend: idFriend });
    axios
      .post(ipConfigg + '/api/huyKetBan', body, config)
      .then((res) => {
        // var result_msg = JSON.parse(res.data.msg);
        this.showFriends();
        this.showFriendsRequest();
        this.handleSearchTimKiem();
            //
            this.change_user(this.state.id);
      })
  }
  handleAddFriend = (id, idFriend) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id, idfriend: idFriend });
    axios
      .post(ipConfigg + '/api/addFriendToUser', body, config)
      .then((res) => {
        // var result_msg = JSON.parse(res.data.msg);
        this.showFriends();
        this.showFriendsRequest();
        this.handleSearchTimKiem();
            //
            this.change_user(this.state.id);
        
      })
  }
  handleSearch = e => {
    e.preventDefault();
    this.setState({
      timkiem: e.target.value,
    }, () => {
      console.log(this.state.timkiem);
    });
  }
  handleSearchTimKiem = e => {
    //  e.preventDefault(); 

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    //    console.log(this.state.timkiem);
    const timkiem = this.state.timkiem;
    const id = this.state.id;
    const body = JSON.stringify({ timkiem: timkiem, id: id });
    axios
      .post(ipConfigg + '/api/timKiemFriend', body, config)
      .then((res) => {

        if (res.data.mess == "ban be") {
          this.setState({
            booleanFriend: "banbe",
            friends_search: res.data.user
          })

        }
        if (res.data.mess == "chua xac nhan") {
          this.setState({
            booleanFriend: "xacnhan",
            friends_search: res.data.user
          })

        }
        if (res.data.mess == "hay gui yeu cau") {
          this.setState({
            booleanFriend: "yeucau",
            friends_search: res.data.user
          })
        }
        if (res.data.mess == "khongtimthay") {
          this.setState({
            booleanFriend: "khongtimthay",
            friends_search: []
          })
        }
        if (res.data.mess == "da gui yeu cau") {
          this.setState({
            booleanFriend: "da gui yeu cau",
            friends_search: res.data.user
          })
        }
      })
  }
  info = (email, sdt, ten, avatar) => {
    Swal.fire({
      // timer: 3000,
      imageUrl: ipConfigg + '/api/files/' + avatar,
      imageHeight: 200,
      imageWidth: 200,
      imageAlt: avatar,
      html: 'Ten: ' + ten + '<br/>SDT: ' + sdt + '<br/>Email: ' + email,
    })
  }
  openModal = () => this.setState({ isOpen: true });
  openUpdateGroupModal = (id, tennhom) => {
    this.fetchFriendsForUpDateGroup(id);
    this.setState({ isOpenUpdateGroupModal: true, groupName: tennhom });
  }
  closeModal = () => {
    this.setState({ isOpen: false, members: "", groupName: "" });
    groupMembers.splice(0, groupMembers.length)
  }
  closeUpdateGroupModal = () => {
    this.setState({ isOpenUpdateGroupModal: false, members: "", groupName: "", idGroup: "", friendsOutOfGroup: [] });
    groupMembers.splice(0, groupMembers.length)
  }
  fetchAllGroups = () => {
    const { id } = this.state;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id: id });
    axios
      .post(ipConfigg + '/api/groups', body, config)
      .then((res) => {
        this.setState({
          groups: res.data.response
        });
        console.log(res.data.response);
      })
  };
  handleCreateGroup = () => {
    const { id, groupName } = this.state
    if (groupMembers.length > 1) {
      if (groupName != '' && groupName.length < 20) {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({ id: id, groupName: groupName, groupMembers: groupMembers });
        axios
          .post(ipConfigg + '/api/createGroup', body, config)
          .then((res) => {
            if (res.data.msg == "false") {
              Swal.fire(
                'Lỗi Tạo Nhóm',
                'Tạo Nhóm Chát Thất Bại',
                'error'
              )
            } else if (res.data.msg == "true") {
              Swal.fire(
                'Tạo Nhóm!',
                'Bạn Đã Tạo Nhóm Chát Thành Công',
                'success'
              )
              this.closeModal()
              this.showFriends();
              this.showFriendsRequest();
              this.handleSearchTimKiem();
              this.fetchAllGroups()
                  //
        this.change_user(this.state.id);
            }
          })
      } else {
        Swal.fire(
          'Cảnh Báo',
          'Hãy Nhập Tên Nhóm Phù Hợp Để Tạo Nhóm Chát',
          'warning'
        )
      }
    } else {
      Swal.fire(
        'Cảnh Báo',
        'Hãy Chọn Từ 2 Bạn Bè Để Tạo Nhóm Chát',
        'warning'
      )
    }
    // console.log(this.state.groupMembers)
  }
  handleOutGroup = (id, idGroup) => {
    Swal.fire({
      title: 'Bạn chắc chắn chứ?',
      text: 'Bạn Sẽ Rời Khỏi Nhóm Chát Này!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, rời khỏi nhóm!',
      cancelButtonText: 'Không, trở về!'
    }).then((result) => {
      if (result.value) {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({ id: id, idGroup: idGroup });
        axios
          .post(ipConfigg + '/api/outgroup', body, config)
          .then((res) => {
            if (res.data.msg == "false") {
              Swal.fire(
                'Lỗi Rời Khỏi Nhóm',
                'Rời Khỏi Nhóm Chát Thất Bại',
                'error'
              )
            } else if (res.data.msg == "true") {
              Swal.fire(
                'Rời Khỏi Nhóm!',
                'Bạn Đã Rời Khỏi Nhóm Chát Thành Công',
                'success'
              )
              this.closeModal()
              this.showFriends();
              this.showFriendsRequest();
              this.handleSearchTimKiem();
              this.fetchAllGroups()
                  //
        this.change_user(this.state.id);
            }
          })
      }
    })
  }
  handleUpdateGroup = () => {
    const { idGroup, groupName } = this.state
    if (groupMembers.length > 0) {
      if (groupName != '' && groupName.length < 20) {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({ idGroup: idGroup, groupMembers: groupMembers, groupName: groupName });
        axios
          .post(ipConfigg + '/api/updateGroup', body, config)
          .then((res) => {
            if (res.data.msg == "false") {
              Swal.fire(
                'Lỗi!',
                'Cập Nhật Nhóm Chát Thất Bại',
                'error'
              )
            } else if (res.data.msg == "true") {
              Swal.fire(
                'Thành Công!',
                'Cập Nhật Nhóm Chát Thành Công',
                'success'
              )
              this.closeUpdateGroupModal()
              this.showFriends();
              this.showFriendsRequest();
              this.handleSearchTimKiem();
              this.fetchAllGroups()
                  //
        this.change_user(this.state.id);
            }
          })
      } else {
        Swal.fire(
          'Cảnh Báo',
          'Hãy Nhập Tên Nhóm Hợp Lệ Để Tạo Nhóm Chát',
          'warning'
        )
      }
    } else {
      Swal.fire(
        'Cảnh Báo',
        'Hãy Chọn Từ 1 Bạn Bè Để Thêm Vào Nhóm Chát',
        'warning'
      )
    }
  }
  handleAddFriendToGroup = (id, ten) => {
    let myCheck = false;
    if (groupMembers.length == 0) {
      groupMembers.push(id)
      this.setState({ members: this.state.members += ten })
      myCheck = true
    } else {
      for (var i = 0; i < groupMembers.length; i++) {
        if (groupMembers[i] == id) {
          myCheck = true
        }
      }
    }
    if (myCheck == false) {
      groupMembers.push(id)
      this.setState({ members: this.state.members += ' - ' + ten })
    }
  }
  handleRemoveFriendFromMemberListForGroup = (id, ten) => {
    for (var i = 0; i < groupMembers.length; i++) {
      if (groupMembers[i] == id) {
        if (i == 0) {
          if (groupMembers.length == 1) {
            groupMembers.splice(i, 1)
            this.setState({ members: this.state.members.replace(ten, '') })
          } else {
            groupMembers.splice(i, 1)
            this.setState({ members: this.state.members.replace(ten + ' - ', '') })
          }
        } else {
          groupMembers.splice(i, 1)
          this.setState({ members: this.state.members.replace(' - ' + ten, '') })
        }
      }
    }
  }
  render() {

    if (localStorage.getItem('dangnhap') === null) {
      return <Redirect to={'/'} />
    }
    return (
      <>
        <div>
          <Tab.Container id="left-tabs-example" defaultActiveKey="friends">
            <Row>
              <Col md={4}>
                <Nav variant="pills" className="flex-column">
                  <div id="search-danhba">
                    <input type="text" placeholder="Search" />
                  </div>
                  <Nav.Item>
                    <Nav.Link eventKey="addFriends" className="linkItem" onClick={this.showFriends} ><img src={require("../images/img/user.jpg")} /><span className="text">Thêm bạn bè</span></Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="friends" className="linkItem" onClick={this.showFriends} ><img src={require("../images/img/user.jpg")} /><span className="text">Danh sách bạn bè</span></Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="friend_requests" className="linkItem" onClick={this.showFriendsRequest} ><img src={require("../images/img/user-plus.jpg")} /><span className="text">Danh sách kết bạn</span></Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="group" className="linkItem"><img src={require("../images/img/users.jpg")} /><span className="text">Nhóm chat</span></Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col md={8}>
                <Tab.Content>
                  <Tab.Pane eventKey="addFriends">
                    <div id="danhba-title">
                      <div class="row">
                        <div class="col-8" style={{ padding: 15 }}>
                          <input type="text" class="form-control" id="" placeholder="Nhập số điện thoại hoặc địa chỉ email để tìm kiếm" onChange={this.handleSearch} value={this.state.timkiem} />
                        </div>
                        <div class="col-4" style={{ padding: 7 }}>
                          <input type="button" onClick={this.handleSearchTimKiem} class="btn btn-success" value="Tim kiem" placeholder="Last name" />
                        </div>
                      </div>
                    </div>
                    <TableScrollbar height="370px">
                      <Table striped bordered hover size="md">
                        <tbody>
                          {this.state.friends_search.map((item) => {
                            if (item.id != this.state.id) {
                              if (this.state.booleanFriend == "banbe") {
                                return (
                                  <tr>
                                    <td style={{ width: "90%" }}><img src={ipConfigg + "/api/files/" + item.avatar} onClick={() => this.info(item.email, item.sdt, item.ten, item.avatar)} /><span id="tenFriend">{item.ten} (ban be)</span></td>
                                    <td><i class="fas fa-user-friends fa-2x" onClick={() => this.handleUnfriend(this.state.id, item.id)} style={{ color: "green" }} title="Đã là bạn bè của nhau" /></td>
                                  </tr>
                                );
                              }
                              else if (this.state.booleanFriend == "xacnhan") {
                                return (
                                  <tr>
                                    <td style={{ width: "90%" }}><img src={ipConfigg + "/api/files/" + item.avatar} onClick={() => this.info(item.email, item.sdt, item.ten, item.avatar)} /><span id="ten">{item.ten} (Xac nhan)</span></td>
                                    <td><i class="fas fa-thumbs-up fa-2x" onClick={() => this.handleAccessFriend(this.state.id, item.id)} style={{ color: "green" }} title="Xác nhận bạn bè đi" /></td>
                                  </tr>
                                );
                              }
                              else if (this.state.booleanFriend == "yeucau") {
                                return (
                                  <tr>
                                    <td style={{ width: "90%" }}><img src={ipConfigg + "/api/files/" + item.avatar} onClick={() => this.info(item.email, item.sdt, item.ten, item.avatar)} /><span id="tenFriend">{item.ten} (Them ban)</span></td>
                                    <td><i class="fas fa-user-plus fa-2x" style={{ color: "green" }} onClick={() => this.handleAddFriend(this.state.id, item.id)} title="hãy gửi yêu cầu kết bạn" /></td>
                                  </tr>
                                );
                              }
                              else if (this.state.booleanFriend == "da gui yeu cau") {
                                return (
                                  <tr>
                                    <td style={{ width: "90%" }}><img src={ipConfigg + "/api/files/" + item.avatar} onClick={() => this.info(item.email, item.sdt, item.ten, item.avatar)} /><span id="tenFriend">{item.ten} (Da gui yeu cau)</span></td>
                                    <td><i class="fas fa-check-circle fa-2x" onClick={() => this.handleCancelFriend(item.id, this.state.id)} style={{ color: "green" }} title="Đã gửi yêu cầu kết bạn" /></td>
                                  </tr>
                                );
                              }
                            }
                            else {
                              return (
                                <tr>
                                  <td style={{ width: "90%" }}><span id="tenFriend">Không tìm thấy ...</span></td>
                                </tr>
                              );
                            }
                          })}
                        </tbody>
                      </Table>
                    </TableScrollbar>
                  </Tab.Pane>
                  <Tab.Pane eventKey="friends">
                    <div id="danhba-title">
                      <img src={require("../images/img/user.jpg")} /><span id="text">Friends</span>
                    </div>
                    <TableScrollbar height="370px">
                      <Table striped bordered hover size="md">
                        <tbody>
                          {this.state.friends.map((items) => {
                            return (
                              items.friends.map((item) => {
                                return (
                                  <tr>
                                    <td style={{ width: "90%" }}><img src={ipConfigg + "/api/files/" + item.avatarFriend} onClick={() => this.info(item.emailFriend, item.sdtFriend, item.tenFriend, item.avatarFriend)} /><span id="tenFriend">{item.tenFriend}</span></td>
                                    <td><i class="fas fa-times-circle fa-2x" style={{ color: "red" }} onClick={() => this.handleUnfriend(items.id, item.idFriend)} title="unfriend" /></td>
                                  </tr>
                                );
                              })
                            );
                          })}
                        </tbody>
                      </Table>
                    </TableScrollbar>
                  </Tab.Pane>
                  <Tab.Pane eventKey="friend_requests" className="item">
                    <div id="danhba-title">
                      <img src={require("../images/img/user-plus.jpg")} /><span id="text">Friend Requests</span>
                    </div>
                    <TableScrollbar height="370px">
                      <Table striped bordered hover size="md">
                        <tbody>
                          {this.state.friend_requests.map((items) => {
                            return (
                              items.friends.map((item) => {
                                return (
                                  <tr>
                                    <td style={{ width: "90%" }}><img src={ipConfigg + "/api/files/" + item.avatarFriend} onClick={() => this.info(item.emailFriend, item.sdtFriend, item.tenFriend, item.avatarFriend)} /><span id="tenFriend">{item.tenFriend}</span></td>
                                    <td><i class="fas fa-times-circle fa-2x" style={{ color: "red" }} onClick={() => this.handleCancelFriend(items.id, item.idFriend)} title="not accept" /></td>
                                    <td><i class="fas fa-plus-circle fa-2x" style={{ color: "green" }} onClick={() => this.handleAccessFriend(items.id, item.idFriend)} title="accept friend" /></td>
                                  </tr>
                                );
                              })
                            );
                          })}
                        </tbody>
                      </Table>
                    </TableScrollbar>
                  </Tab.Pane>
                  <Tab.Pane eventKey="group">
                    <div id="danhba-title">
                      <img src={require("../images/img/users.jpg")} /><span id="text">Group</span>
                      <i class="fas fa-plus-circle fa-1x" style={{ color: "green", paddingLeft: "4%" }} title="create group" onClick={this.openModal} />
                    </div>
                    <TableScrollbar height="370px">
                      <Table striped bordered hover size="md">
                        <tbody>
                          {this.state.groups.map((items) => {
                            return (
                              <tr>
                                <td style={{ width: "45%" }}><span id="tenFriend">{items.group_name}</span></td>
                                <td style={{ width: "35%" }} >
                                  <div class="row row-horizon">
                                    {items.group_members.map((item) => {
                                      return (
                                        <div class="col-sm-3">
                                          <img src={ipConfigg + "/api/files/" + item.avatarUser} onClick={() => this.info(item.emailUser, item.sdtUser, item.tenUser, item.avatarUser)} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {/* <div class="table-horiz-scroll" >
                                    <table>
                                      <tr>
                                        {items.group_members.map((item) => {
                                          return (
                                            <td><img src={ipConfigg + "/api/files/" + item.avatarUser} onClick={() => this.info(item.emailUser, item.sdtUser, item.tenUser, item.avatarUser)} /></td>
                                          );
                                        })}
                                      </tr>
                                    </table>
                                  </div> */}
                                </td>
                                <td><i class="fas fa-plus-circle fa-2x" onClick={() => this.openUpdateGroupModal(items.id, items.group_name)} style={{ color: "green" }} title="add friend to group" /></td>
                                <td><i class="fas fa-times-circle fa-2x" onClick={() => this.handleOutGroup(this.state.id, items.id)} style={{ color: "red" }} title="out group" /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </TableScrollbar>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
          <Modal show={this.state.isOpen} onHide={this.closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>Create Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form enctype="multipart/form-data">
                <FormGroup>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="tag" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      type="text"
                      placeholder="Nhập Tên Nhóm"
                      name="groupName"
                      onChange={this.handleChange}
                      value={this.state.groupName}
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="users" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control as="textarea" name="members" style={{ fontSize: 15 }} rows={2} value={this.state.members} onChange={this.handleChange} readOnly />
                  </InputGroup>
                  <TableScrollbar height="370px">
                    <Table striped bordered hover size="md">
                      <tbody>
                        {this.state.friends.map((items) => {
                          return (
                            items.friends.map((item) => {
                              return (
                                <tr>
                                  <td style={{ width: "80%" }}><img src={ipConfigg + "/api/files/" + item.avatarFriend} onClick={() => this.info(item.emailFriend, item.sdtFriend, item.tenFriend, item.avatarFriend)} /><span id="tenFriend">{item.tenFriend}</span></td>
                                  <td><i class="fas fa-times-circle fa-2x" style={{ color: "red" }} onClick={() => this.handleRemoveFriendFromMemberListForGroup(item.idFriend, item.tenFriend)} title="xóa bạn khỏi group chat" /></td>
                                  <td><i class="fas fa-plus-circle fa-2x" style={{ color: "green" }} onClick={() => this.handleAddFriendToGroup(item.idFriend, item.tenFriend)} title="thêm bạn vào group chat" /></td>
                                </tr>
                              );
                            })
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableScrollbar>
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleCreateGroup}>Tạo Nhóm</Button>
              <Button variant="secondary" onClick={this.closeModal}>Đóng</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.isOpenUpdateGroupModal} onHide={this.closeUpdateGroupModal}>
            <Modal.Header closeButton>
              <Modal.Title>Create Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form enctype="multipart/form-data">
                <FormGroup>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="tag" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      type="text"
                      placeholder="Nhập Tên Nhóm"
                      name="groupName"
                      onChange={this.handleChange}
                      value={this.state.groupName}
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon="users" /></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control as="textarea" name="members" style={{ fontSize: 15 }} rows={2} value={this.state.members} onChange={this.handleChange} readOnly />
                  </InputGroup>
                  <TableScrollbar height="370px">
                    <Table striped bordered hover size="md">
                      <tbody>
                        {this.state.friendsOutOfGroup.map((item) => {
                          return (
                            <tr>
                              <td style={{ width: "80%" }}><img src={ipConfigg + "/api/files/" + item.avatarFriend} onClick={() => this.info(item.emailFriend, item.sdtFriend, item.tenFriend, item.avatarFriend)} /><span id="tenFriend">{item.tenFriend}</span></td>
                              <td><i class="fas fa-times-circle fa-2x" style={{ color: "red" }} onClick={() => this.handleRemoveFriendFromMemberListForGroup(item.idFriend, item.tenFriend)} title="xóa bạn khỏi group chat" /></td>
                              <td><i class="fas fa-plus-circle fa-2x" style={{ color: "green" }} onClick={() => this.handleAddFriendToGroup(item.idFriend, item.tenFriend)} title="thêm bạn vào group chat" /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableScrollbar>
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleUpdateGroup}>Cập Nhật</Button>
              <Button variant="secondary" onClick={this.closeUpdateGroupModal}>Đóng</Button>
            </Modal.Footer>
          </Modal>
        </div>
        <Footer />
      </>
    );
  }
}
export default DanhBa;