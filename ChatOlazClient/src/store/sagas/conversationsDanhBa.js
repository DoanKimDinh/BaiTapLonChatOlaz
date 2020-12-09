import { put, takeEvery } from 'redux-saga/effects';
import { messagesLoaded } from '../actions';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const ipConfigg = 'http://localhost:3001';

// const conversations = [
//     {
//         id: 'friend_requests',
//         image: require('../../images/img/user-plus.jpg'),
//         imageAlt: null,
//         ten: 'Friend Requests',
//         createdAt: null,
//         latestMessageText: null,
//         messages: []
//     },
//     {
//         id: 'friends',
//         image: require('../../images/img/users.jpg'),
//         imageAlt: null,
//         ten: 'Group Lists',
//         createdAt: null,
//         latestMessageText: null,
//         messages: []
//     },
//     {
//         id: '1',
//         image: require('../../images/profiles/daryl.png'),
//         imageAlt: 'Daryl Duckmanton',
//         ten : 'Daryl Duckmanton',
//         createdAt: 'Apr 16',
//         latestMessageText: 'This is a message',
//         messages: [
//             {
//                 image: null,
//                 imageAlt: null,
//                 messageText: 'Ok then',
//                 createdAt: 'Apr 16',
//                 isMyMessage: true
//             },
//             {
//                 image: require('../../images/profiles/daryl.png'),
//                 imageAlt: 'Daryl Duckmanton',
//                 messageText: `
//                     Yeah I think it's best we do that. Otherwise things won't work well at all. 
//                     I'm adding more text here to test the sizing of the speech bubble and the 
//                     wrapping of it too.
//                 `,
//                 createdAt: 'Apr 16',
//                 isMyMessage: false
//             },
//             {
//                 image: null,
//                 imageAlt: null,
//                 messageText: 'Maybe we can use Jim\'s studio.',
//                 createdAt: 'Apr 15',
//                 isMyMessage: true
//             },
//             {
//                 image: require('../../images/profiles/daryl.png'),
//                 imageAlt: 'Daryl Duckmanton',
//                 messageText: `
//                     All I know is where I live it's too hard
//                     to record because of all the street noise.
//                 `,
//                 createdAt: 'Apr 15',
//                 isMyMessage: false
//             },
//             {
//                 image: null,
//                 imageAlt: null,
//                 messageText: `
//                     Well we need to work out sometime soon where
//                     we really want to record our video course.
//                 `,
//                 createdAt: 'Apr 15',
//                 isMyMessage: true
//             },
//             {
//                 image: require('../../images/profiles/daryl.png'),
//                 imageAlt: 'Daryl Duckmanton',
//                 messageText: `
//                     I'm just in the process of finishing off the
//                     last pieces of material for the course.
//                 `,
//                 createdAt: 'Apr 15',
//                 isMyMessage: false
//             },
//             {
//                 image: null,
//                 imageAlt: null,
//                 messageText: 'How\'s it going?',
//                 createdAt: 'Apr 13',
//                 isMyMessage: true
//             },
//             {
//                 image: require('../../images/profiles/daryl.png'),
//                 imageAlt: 'Daryl Duckmanton',
//                 messageText: ' Hey mate what\'s up?',
//                 createdAt: 'Apr 13',
//                 isMyMessage: false
//             },
//             {
//                 image: null,
//                 imageAlt: null,
//                 messageText: 'Hey Daryl?',
//                 createdAt: 'Apr 13',
//                 isMyMessage: true
//             }
//         ]
//     },
//     {
//         id: '2',
//         image: require('../../images/profiles/kim.jpeg'),
//         imageAlt: 'Kim O\'Neil',
//         ten : 'Kim O\'Neil',
//         createdAt: 'Oct 20',
//         latestMessageText: 'Ok fair enough. Well good talking to you.',
//         messages: []
//     },
//     {
//         id: '3',
//         image: require('../../images/profiles/john.jpeg'),
//         imageAlt: 'John Anderson',
//         ten : 'John Anderson',
//         createdAt: '1 week ago',
//         latestMessageText: 'Yes I love how Python does that',
//         messages: []
//     },
//     {
//         id: '4',
//         image: require('../../images/profiles/ben.png'),
//         imageAlt: 'Ben Smith',
//         ten : 'Ben Smith',
//         createdAt: '2:49 PM',
//         latestMessageText: 'Yeah Miami Heat are done',
//         messages: []
//     },
//     {
//         id: '5',
//         image: require('../../images/profiles/douglas.png'),
//         imageAlt: 'Douglas Johannasen',
//         ten : 'Douglas Johannasen',
//         createdAt: '6:14 PM',
//         latestMessageText: 'No it does not',
//         messages: []
//     },
//     {
//         id: '6',
//         image: require('../../images/profiles/jacob.png'),
//         imageAlt: 'Jacob Manly',
//         ten : 'Jacob Manly',
//         createdAt: '3 secs ago',
//         latestMessageText: 'Just be very careful doing that',
//         messages: []
//     },
//     {
//         id: '7',
//         image: require('../../images/profiles/stacey.jpeg'),
//         imageAlt: 'Stacey Wilson',
//         ten : 'Stacey Wilson',
//         createdAt: '30 mins ago',
//         latestMessageText: 'Awesome!!! Congratulations!!!!',
//         messages: []
//     },
//     {
//         id: '8',
//         image: require('../../images/profiles/stan.jpeg'),
//         imageAlt: 'Stan George',
//         ten : 'Stan George',
//         createdAt: '1 week ago',
//         latestMessageText: 'Good job',
//         messages: []
//     },
//     {
//         id: '9',
//         image: require('../../images/profiles/sarah.jpeg'),
//         imageAlt: 'Sarah Momes',
//         ten : 'Sarah Momes',
//         createdAt: '1 year ago',
//         latestMessageText: 'Thank you. I appreciate that.',
//         messages: []
//     }
// ];

// const conversations = [
//     {
//         sdt: '0123858564',
//         pass: '12345678',
//         admin: 0,
//         messages: [],
//         tinhtrang: 1,
//         friends: ['c9243a20-21f9-11eb-b463-67887890783e'],
//         friend_requests: ['a81c4390-21f9-11eb-b463-67887890783e'],
//         id: 'e6661940-21ff-11eb-a23b-47a52e9844c9',
//         email: 'nhutduynguyen@gmail.com',
//         ten: 'nhutduynguyen'
//     }
// ]

export const conversationsSaga = function* () {
    const conversations = [
        {
            id: 'friends',
            image: require('../../images/img/user.jpg'),
            ten: 'Friends',
            messages: [],
            friends: [{
                sdt: '0123858564',
                pass: '12345678',
                admin: 0,
                messages: [],
                tinhtrang: 1,
                friends: ['c9243a20-21f9-11eb-b463-67887890783e'],
                friend_requests: ['a81c4390-21f9-11eb-b463-67887890783e'],
                id: 'e6661940-21ff-11eb-a23b-47a52e9844c9',
                email: 'nhutduynguyen@gmail.com',
                ten: 'nhutduynguyen'
            }]
        },
        {
            id: 'friend_requests',
            image: require('../../images/img/user-plus.jpg'),
            ten: 'Friend Requests',
            messages: [],
            friend_requests: [],
        },
        {
            id: 'group',
            image: require('../../images/img/users.jpg'),
            ten: 'Group Lists',
            messages: [],
            group: []
        }
    ]
    yield delay(1000);
    yield put(messagesLoaded(conversations[0].id, conversations[0].messages, false, null));

    yield put({
        type: 'CONVERSATIONS_LOADED',
        payload: {
            conversations,
            selectedConversation: conversations[0]
        }
    });
}

export function* watchGetConversationsDanhBaAsync() {
    yield takeEvery('CONVERSATIONS_REQUESTED', conversationsSaga);
}