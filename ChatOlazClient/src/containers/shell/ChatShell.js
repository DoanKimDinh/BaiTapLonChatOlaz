import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ConversationSearch from '../../components/conversation/conversation-search/ConversationSearch';
import NoConversations from '../../components/conversation/no-conversations/NoConversations';
import ConversationList from '../../components/conversation/conversation-list/ConversationList';
import NewConversation from '../../components/conversation/new-conversation/NewConversation';
import ChatTitle from '../../components/chat-title/ChatTitle';
import MessageList from '../message/MessageList';
import ChatForm from '../../components/chat-form/ChatForm';
import '../../components/conversation/conversation-item/ConversationItem.scss';
import '../../components/conversation/conversation-list/ConversationList.scss';
import './ChatShell.scss';
import '../../components/message/Message.scss';
import '../message/MessageList.scss'
import '../../components/chat-form/ChatForm.scss'
import '../../components/chat-title/ChatTitle.scss'
import '../../components/conversation/conversation-search/ConversationSearch.scss'
import FormButton from '../../components/controls/buttons/FormButton';
import TrashIcon from '../../components/controls/icons/trash-icon/TrashIcon';
import AttachmentIcon from '../../components/controls/icons/attachment-icon/AttachmentIcon';
import classNames from 'classnames';
import TrangChu,{socket} from '../../pages/TrangChu';
import makeToast from "../../components/controls/toast/Toaster";
import axios from "axios";
import { faThinkPeaks } from '@fortawesome/free-brands-svg-icons';
const images_group = require("../../images/img/users.jpg")
const IP = require('../../config/config')
var ipConfigg = IP.PUBLIC_IP;
// socket io
var id_conversation_click = ''
class ChatShell extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            id : localStorage.getItem('id'),
            onclickDanhBa : true,
            list_conversation : [],
            list_my_message : [],
            list_other_message : [],
            friends: [],
            info_friend_conversation : [],
            groups :[],
            ten_friend_conversation_click : '',
            id_friend_conversation_click : '',
            vartar_friend : '',
            list_all_messageByUser : [],
            message_send : "",
            list_all_messages: [],
            ten_group : "",
            avatarGroup : "",
            id_group_conversation_click : '',
            isClick_Conversation_Group : '',
            redirect : 0,
        };
        this.localVideoref = React.createRef();
        this.remoteVideoref = React.createRef();
        socket.on('change_message_user',(newMessage)=>{
            var list_all_message_tam = this.state.list_all_messages;
            if((newMessage.id_toFriend == this.state.id) && (id_conversation_click == newMessage.id)){
                
                list_all_message_tam.push(newMessage)
                list_all_message_tam.sort((a,b)=>{
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                });
                this.setState({
                    list_all_messages : list_all_message_tam.reverse()
                })
            }
        });
        socket.on('change_message_user_group',(newMessage)=>{
            var list_all_message_tam = this.state.list_all_messages;
            if(this.state.id_group_conversation_click == newMessage.id){
                
                list_all_message_tam.push(newMessage)
                list_all_message_tam.sort((a,b)=>{
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                });
                this.setState({
                    list_all_messages : list_all_message_tam.reverse()
                })
            }
        });
    }
    send_message_submitChange = (newMessage)=>{
        socket.emit('send_message',(newMessage));
    }

    send_message_submitChange_Group = (newMessage)=>{
        socket.emit('send_message_group',(newMessage));
    }
    componentDidMount(){

        this.fetchAllFriends();
        this.fetchAllGroups();  
    }
    allMessagesMyAndOther =(listMyMessage,listOtherMessage)=>{
        var list_all_tam = listMyMessage.concat(listOtherMessage);
        this.setState({
            list_all_messages : list_all_tam
        })
    }
    handleChange = (evt) => {
        evt.preventDefault();
        this.setState({
            [evt.target.name]: evt.target.value,
        });
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
          })
    };
    // thong tin cua 1 nguoi ban co trong o chat // goi chung api voi all friend
    // set tất cả các tin nhắn có trong 1 cuộc hội thoại
    fetchAll_OtherMessage = (id_friend_click) => {
        const  {id}  = id_friend_click
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const body = JSON.stringify({ id: id_friend_click });
        var other_message = [];
        axios
          .post(ipConfigg + '/api/friends', body, config)
          .then((res) => {
            this.setState({
                info_friend_conversation: res.data.response
            });
            res.data.response.map((items)=>{
                items.messages.map((message)=>{
                    if(message.id_toFriend == this.state.id){
                        other_message.push(message)
                    }
                })
            });
           // this.allMessagesMyAndOther(this.state.list_my_message,other_message)
           // gop chung danh sach tin nhan cua minh va cua ban 
           // set tất cả các tin nhắn có trong 1 cuộc hội thoại
            var list_all_message = this.state.list_my_message.concat(other_message);
            list_all_message.sort((a,b)=>{
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            });
            this.setState({
                list_other_message : other_message,
                list_all_messages : list_all_message.reverse()
            })
          })
    };
    fetchAllMessages =()=>{
        var allMessage = [];
        this.state.friends.map((item)=>{
            item.messages.map((message)=>{
                allMessage.push(message);
            })
        })
        this.setState({
            list_all_messageByUser : allMessage
        })
    };
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
    
      // bắt sự kiện khi click vào 1 cuộc hội thoại 
    ClickCoversation =(id_friend,ten_friend,avatarFriend)=>{
        this.fetchAllFriends()
        this.fetchAllMessages()
        this.fetchAll_OtherMessage(id_friend)
        var my_message = [];
        this.state.friends.map((items)=>{
            items.messages.map((message)=>{
                if(message.id_toFriend == id_friend){
                    my_message.push(message)
                }
            })
        });
        // luu lai id
        id_conversation_click = id_friend;
        this.setState({
            list_my_message : my_message.reverse(),
            ten_friend_conversation_click : ten_friend,
            vartar_friend : avatarFriend,
            id_friend_conversation_click : id_friend,
            isClick_Conversation_Group : false
        })
    }
    fetchAll_MessageGroup = (id_group) =>{
        var all_message_group = [];
        for(var i =0 ; i< this.state.groups.length ; i++){
            if(this.state.groups[i].id == id_group){
                if(this.state.groups[i].id.length > 0)
                    all_message_group = all_message_group.concat(this.state.groups[i].messages)
                break;
            }
        }
        all_message_group.sort((a,b)=>{
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        });
        this.setState({
            list_all_messages : all_message_group.reverse(),
        })
    }
    // bat su kien khi click vao 1 group 
    ClickConversation_Group = (id_group,ten_group,avatarGroup)=>{
        this.fetchAllGroups();
        this.fetchAll_MessageGroup(id_group);
        this.setState({
            ten_group : ten_group,
            avatarGroup : avatarGroup,
            id_group_conversation_click : id_group,
            isClick_Conversation_Group: true
        })
    }
    render_conversationSearch =() =>{
        return(
            <>
                <div id="search-container">
                    <input type="text" placeholder="Search" />
                </div>
            </>
        )
    }
    renderConversation = () =>{
        return(
            <>
                {this.state.friends.map((items)=>{
                    return(
                        items.friends.map((item)=>{
                            return(
                                <>
                                    <div className="conversation" onClick ={() =>this.ClickCoversation(item.idFriend,item.tenFriend,item.avatarFriend) }>
                                        <img src={ipConfigg + "/api/files/" + item.avatarFriend} alt={images_group}/>
                                        <div className="title-text">{item.tenFriend}</div>
                                        <div className="created-date"></div>
                                        <div className="conversation-message">
                                            
                                        </div>
                                    </div>
                                </>
                            )
                        })
                    )
                })}
                
                {this.state.groups.map((items)=>{
                    return(
                        <div className="conversation" onClick ={() =>this.ClickConversation_Group(items.id,items.group_name,images_group) }>
                            <img src={require("../../images/img/users.jpg")}/>
                            <div className="title-text">{items.group_name}</div>
                            <div className="created-date">2020</div>
                            <div className="conversation-message">
                                messages
                            </div>
                        </div>
                    )
                })}
            </>
        )
    }
    //
    renderAllMessagesGroup = () =>{
        const messageClass_My = classNames('message-row', {
            'you-message': true,
            'other-message': false
        });
        const messageClass_Other = classNames('message-row', {
            'you-message': false,
            'other-message': true
        });
        const {list_all_messages,id_group_conversation_click} = this.state;
        return(
            <>
                {list_all_messages.map((items)=>{
                    if(items.id_member == this.state.id){
                        return(
                            <div className={messageClass_My}>
                                <div className="message-content">
                                    <img src={ipConfigg + "/api/files/" +items.avatarMember} alt="" />
                                    <div className="message-text">
                                        {items.messageText}
                                    </div>
                                    <div className="message-time">{items.thoi_gian}</div>
                                </div>
                            </div>
                        )
                    }
                    else {
                        return(
                            <div className={messageClass_Other}>
                                <div className="message-content">
                                    <img src={ipConfigg + "/api/files/" +items.avatarMember} alt="" />
                                    <div className="message-text">
                                        {items.messageText}
                                    </div>
                                    <div className="message-time">{items.thoi_gian}</div>
                                </div>
                            </div>
                        )
                    }
                })}
            </>
        )
    }
    //
    renderAllMessages = ()=>{
        const messageClass_My = classNames('message-row', {
            'you-message': true,
            'other-message': false
        });
        const messageClass_Other = classNames('message-row', {
            'you-message': false,
            'other-message': true
        });
        const {list_all_messages,id_friend_conversation_click} = this.state;
        return(
            <>
                {list_all_messages.map((items)=>{
                    if(items.id_toFriend == id_friend_conversation_click){
                        return(
                            <div className={messageClass_My}>
                                <div className="message-content">
                                    <img src={ipConfigg + "/api/files/" +localStorage.getItem('avatar')} alt="" />
                                    <div className="message-text">
                                        {items.messageText}
                                    </div>
                                    <div className="message-time">{items.thoi_gian}</div>
                                </div>
                            </div>
                        )
                    }
                    else if(items.id_toFriend != id_friend_conversation_click){
                        return(
                            <div className={messageClass_Other}>
                                <div className="message-content">
                                    <img src={ipConfigg + "/api/files/" +this.state.vartar_friend} alt="" />
                                    <div className="message-text">
                                        {items.messageText}
                                    </div>
                                    <div className="message-time">{items.thoi_gian}</div>
                                </div>
                            </div>
                        )
                    }
                })}
            </>
        )
    }
    handleFormSubmit = (e) => {
        e.preventDefault();
        if(this.state.message_send != ""){
            var toDay = new Date();
            var ngay_gio = toDay.getDate() + "/" + (toDay.getMonth()+1) + "/" + toDay.getFullYear() + " "+ toDay.getHours()+":"+toDay.getMinutes()+":"+toDay.getSeconds()+"s";
            const message_submit = {
                id : this.state.id,
                date:new Date(),
                id_group : '',
                id_toFriend : this.state.id_friend_conversation_click,
                isMessageGroup : false,
                messageText : this.state.message_send,
                thoi_gian : ngay_gio,
                trang_thai :1 
            };
            var listMessage_Tam = this.state.list_all_messageByUser;
            listMessage_Tam.push(message_submit)
            // listMessage_Tam.map((item)=>{
            //     console.log(item)
            // })
            var list_all_message_tam_submit = this.state.list_all_messages;
            list_all_message_tam_submit.push(message_submit)
            list_all_message_tam_submit.sort((a,b)=>{
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            });
            this.setState({
                list_all_messages : list_all_message_tam_submit.reverse(),
                message_send : ""
            })
            // goi new messages qua socket
            this.send_message_submitChange(message_submit);
            const { id } = this.state;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
          const body = JSON.stringify({id,listMessage_Tam });
          axios
            .post(ipConfigg + '/api/addMessageToFriend',body,config)
            .then((res)=>{

            })
        }
    };
    render_chatTitle_Friend = ()=>{
        return(
            <div id="chat-title">
                <span><img src={ipConfigg + "/api/files/" +this.state.vartar_friend} alt="" />{this.state.ten_friend_conversation_click}</span>
                <div  title="Call video" onClick = {(evt) => this.click_callVideo(evt)}>
                    <TrashIcon />
                </div>
            </div>
        )
    }

    render_chatTitle_Group = ()=>{
        return(
            <div id="chat-title">
                <span><img src={this.state.avatarGroup} alt="" />{this.state.ten_group}</span>
                <div  title="Call video"  >
                    <TrashIcon />
                </div>
            </div>
        )
    }
    click_callVideo =(evt) =>{
        evt.preventDefault();
        this.setState({
            redirect : 1
        })
    }
    render_callvideo =()=>{
        this.pc = new RTCPeerConnection(null);
        this.pc.onicecandidate = (e) =>{
            if(e.candidate)
                console.log(JSON.stringify(e.candidate))
        }
        this.pc.oniceconnectionstatechange = (e)=>{
            console.log(e)
        }
        this.pc.onaddstream = (e)=>{
            this.remoteVideoref.current.srcObject = e.stream
        }
        const constraints = {video : true};
        const succsess = (stream) =>{
            this.localVideoref.current.srcObject = stream
            this.pc.addStream(stream)
        }
        const failure = (e)=>{
            console.log(" get video loi",e);
        }
        navigator.getUserMedia(constraints,succsess,failure)
        
        return(
            <>
                <div id="myBody">
                    <div id="chat-container">
                        <video ref={this.localVideoref} autoPlay></video>
                    </div> 
                </div>
            </>
        )
    }
    createOffer =()=>{
        this.pc.createOffer({offerToReceiveVideo : -1})
            .then(sdp =>{
                console.log(JSON.stringify(sdp))
                this.pc.setLocalDescription(sdp)
            },e=>{})
    }
    setRemoteDescription = ()=>{
        const desc = JSON.parse(this.textref.value);
        this.pc.setRemoteDescription(new RTCSessionDescription(desc));
    }
    createAnswer = ()=>{
        this.pc.createAnswer({offerToReceiveVideo: 1})
            .then(sdp =>{
                console.log(JSON.stringify(sdp))
                this.pc.setLocalDescription(sdp)
            },e =>{})
    }

	render_submitMessages =()=>{
        return(
            <>  
                <form id="chat-form" onSubmit ={this.handleFormSubmit} >
                    <div title="Add Attachment">
                            <AttachmentIcon />
                    </div>
                        <input 
                        type="text" 
                        name="message_send"
                        placeholder="type a message" 
                        onChange={this.handleChange}
                        value = {this.state.message_send}
                    />
                    <FormButton disabled = {false} >Send</FormButton>
                </form>
            </>
        )
    }
    //
    handleFormSubmit_group = (e) => {
        e.preventDefault();
        if(this.state.message_send != ""){
            var toDay = new Date();
            var ngay_gio = toDay.getDate() + "/" + (toDay.getMonth()+1) + "/" + toDay.getFullYear() + " "+ toDay.getHours()+":"+toDay.getMinutes()+":"+toDay.getSeconds()+"s";
            const message_submit = {
                id : this.state.id_group_conversation_click,
                date:new Date(),
                id_member : this.state.id,
                messageText : this.state.message_send,
                thoi_gian : ngay_gio,
                avatarMember: localStorage.getItem("avatar"),
                trang_thai :1 
            };
            // listMessage_Tam.map((item)=>{
            //     console.log(item)
            // })
            var list_all_message_tam_submit = this.state.list_all_messages;
            list_all_message_tam_submit.push(message_submit)
            list_all_message_tam_submit.sort((a,b)=>{
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            });
            this.setState({
                list_all_messages : list_all_message_tam_submit.reverse(),
                message_send : ""
            })
            // goi new messages qua socket
            this.send_message_submitChange_Group(message_submit);
            const { id_group_conversation_click } = this.state;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
           const body = JSON.stringify({id_group_conversation_click,list_all_message_tam_submit });
          axios
            .post(ipConfigg + '/api/addMessageToGroup',body,config)
            .then((res)=>{

            })
        }
    };
    render_submitMessages_group =()=>{
        return(
            <>  
                <form id="chat-form" onSubmit ={this.handleFormSubmit_group} >
                    <div title="Add Attachment">
                            <AttachmentIcon />
                    </div>
                        <input 
                        type="text" 
                        name="message_send"
                        placeholder="type a message" 
                        onChange={this.handleChange}
                        value = {this.state.message_send}
                    />
                    <FormButton disabled = {false} >Send</FormButton>
                </form>
            </>
        )
    }
    render(){
		let submit_message;
        let title_message;
        let render_AllMessage ;   
        if(this.state.id_group != '' && this.state.isClick_Conversation_Group){
            render_AllMessage = this.renderAllMessagesGroup();
            title_message = this.render_chatTitle_Group();
            submit_message = this.render_submitMessages_group();
        }
        else if(this.state.id_friend_conversation_click != '' && this.state.isClick_Conversation_Group == false){
            render_AllMessage = this.renderAllMessages();
            title_message = this.render_chatTitle_Friend();
            submit_message = this.render_submitMessages();
        }
        if(this.state.redirect == 1){
            return this.render_callvideo();
        }
        return (
             <>
                <div id="myBody">
                    <div id="chat-container">
                        {this.render_conversationSearch()}
                        <div id="conversation-list">
                            {this.renderConversation()}
                        </div>
                        <div id="chat-message-list">
                            {render_AllMessage}
                        </div>
                        <NewConversation />
                        {title_message}
                        {submit_message}
                    </div>
                </div>
            </>
        );
    }
}
export default ChatShell;