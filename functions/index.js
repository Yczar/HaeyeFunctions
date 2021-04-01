const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });

exports.onCreateTrigger = functions.firestore.document('test/{docId}').onCreate((queryDocumentSnapshot, eventContext) => {
    const newlyCreatedDocumentId = eventContext.params.docId

    const createdData = queryDocumentSnapshot.data();
    const testValueSyntax1 = createdData.testKey;
    const testValueSyntax2 = createdData["testKey"];
    const testValueSyntax3 = queryDocumentSnapshot.get("testKey");
    console.log(testValueSyntax1);
    console.log(testValueSyntax2);

    var userObject = {
        "displayName": "Babalola Gbogo",
        "email": "babalolagbogo@gmail.com"
    };

    admin.firestore().doc('users/' + 'newlyCreatedDocumentId').set(userObject);
    return 0
})

exports.onCreateFriendRequestNotificationDocument = functions.firestore.document('users/{uId}/friend_requests/{docId}').onCreate((queryDocumentSnapshot, eventContext) => {
    const personId = eventContext.params.docId
    return admin.firestore().collection('users').doc(personId).get().then(doc => {
        var notificationObject = {
            "title": "New Friend request",
            "profile_image": doc.data().profile_image_URL,
            "user_name": doc.data().user_name,
            "description": `Sent a friend request`,
            "type": "friend_request"
        };
        admin.firestore().doc(`users/${personId}/notifications${queryDocumentSnapshot.data().user_id}`).set(notificationObject);
    })

})

exports.onChatRoomCreated = functions.firestore.document('chat_rooms/{roomId}').onCreate((queryDocumentSnapshot, eventContext) => {
    const createdData = queryDocumentSnapshot.data();

    console.log(createdData.users);
    createdData.users.forEach(async user => {


        const userDoc = await admin.firestore().collection('users').doc(user).get();
        console.log(user);
        console.log(userDoc);
        var userObject = {
            "user_name": userDoc.data().user_name,
            "profile_image_URL": userDoc.data().profile_image_URL,
            "name": userDoc.data().name,
            "uid": userDoc.data().uid
        }

        admin.firestore().doc(`chat_rooms/${eventContext.params.roomId}/users/${user}`).set(userObject);
    })

    return 0
})

// exports.addPostings = functions.firestore
//     .document('chat_rooms/{roomId}')
//     .onCreate((snap, context) => {
//         let batch = admin.firestore().batch();
//         const newValue = snap.data();
//         // var uid = newValue.author.uid;
//         // let followers = [];
//         // var feedRef = admin.firestore().collection('feedItems');
//         // var authorRef = admin.firestore().collection('users').doc(newValue.author.uid);

//         newValue.users.forEach(async user => {
//             const userRef = await admin.firestore().collection('users').doc(user).get();
//             const chatRoomRef = admin.firestore().collection('chat_rooms').doc(context.params.roomId).collection('users').doc();
//             batch.set(chatRoomRef, {
//                 test: "testing",
//                 wasViewed: false,
//             })
//             return batch.commit()
//         })
//         return 0

//     });

exports.updateUsers = functions.https.onRequest((req, res) => {
    admin.database().ref("users").once("value").then((snapshot) => {
        snapshot.forEach((userSnap) => {
            userSnap.child("week1").set(10);
        });
    });
})
exports.onFriendRequestAccepted = functions.firestore
    .document('users/{userId}/friend_requests/{docId}')
    .onUpdate(async (change, eventContext) => {
        // Document id of the updated document
        const userId = eventContext.params.userId
        const docId = eventContext.params.docId
        // Data before update and after update
        const previousValue = change.before.data();
        const newValue = change.after.data();
        admin.firestore().collection('users').doc(userId).get().then(doc => {
            const user_name = doc.data().user_name
            const profile_image_URL = doc.data().profile_image_URL
            const name = doc.data().name
            const email = doc.data().email
            const uid = doc.data().uid
            const phone_number = doc.data().phone_number
            var userObject = {
                "user_name": user_name,
                "profile_image_URL": profile_image_URL,
                "name": name,
                "email": email,
                "uid": uid,
                "phone": phone_number
            };
            var notificationObject = {
                "title": "Friend request accepted",
                "profile_image": doc.data().profile_image_URL,
                "description": `Accepted your friend request`,
                "user_name": user_name,
                "type": "friend_request_accepted",
                "time_stamp": firebase.firestore.FieldValue.serverTimestamp()
            };
            admin.firestore().collection('users').doc(docId).collection('friends').doc(userId).set(userObject);
            admin.firestore().collection('users').doc(docId).collection('notifications').add(
                notificationObject
            );
        });
        return admin.firestore().collection('users').doc(docId).get().then(doc => {
            const user_name = doc.data().user_name
            const profile_image_URL = doc.data().profile_image_URL
            const name = doc.data().name
            const email = doc.data().email
            const uid = doc.data().uid
            const phone_number = doc.data().phone_number
            var personObject = {
                "user_name": user_name,
                "profile_image_URL": profile_image_URL,
                "name": name,
                "email": email,
                "uid": uid,
                "phone": phone_number
            };
            admin.firestore().collection('users').doc(userId).collection('friends').doc(docId).set(personObject);
        });
    });

exports.onCreateMessage = functions.firestore.document('chat_rooms/{chat_room_id}/chats/{messageId}').onCreate((queryDocumentSnapshot, eventContext) => {
    const createdData = queryDocumentSnapshot.data();
    const lastMessage = createdData.message
    const lastMessageId = createdData.messageId
    const lastMessageTimeStamp = createdData.messageTimeStamp
    const lastMessageSender = createdData.myUserName
    const lastMessageType = createdData.messageType
    var lastMessageData = {
        "last_message": lastMessage,
        "last_message_id": lastMessageId,
        "last_message_timestamp": lastMessageTimeStamp,
        "last_message_sender": lastMessageSender,
        "last_message_type": lastMessageType,
        "chat_room_id": eventContext.params.chat_room_id
    }
    admin.firestore().doc(`chat_rooms/${eventContext.params.chat_room_id}`).update(lastMessageData);

    return 0
})

exports.onSendDeviceNotification = functions.firestore.document('users/{userId}/notifications/{notificationId}').onCreate((queryDocumentSnapshot, eventContext) => {
    admin.firestore().collection('users').doc(eventContext.params.userId).get().then(doc => {
        const createdData = queryDocumentSnapshot.data();
        const token = doc.data().token
        var payload = {
            "data": {
                "title": String(createdData.title),
                "body": String(createdData.body)
                // "recipientId": String(recipient),
                // "senderId": String(sender),
                // "senderImage": String(senderDetails.avatar),
                // "createdTime": String(newValue.created_time),
                // "chatType": "one",
                // "messageId": String(event.params.messageId)
            }
        };
        var options = {
            priority: "high"
        };
        console.log(token);
        console.log(createdData);
        admin.messaging().sendToDevice(token, payload, options)
            .then(function (response) {
                console.log("Message sent: ", response);
            })
            .catch(function (error) {
                console.log("Error sending message: ", error, payload);
            });

    })
    return 0
})
exports.sendNotifications = functions.firestore.document('users/{userId}/notifications/{notifications}').onCreate(async (snapshot, eventContext) => {
    // Notification details.
    const text = snapshot.data().text;
    console.log(snapshot.data());
    const payload = {
        notification: {
            title: snapshot.data().title,
            body: snapshot.data().description,
            // icon: snapshot.data().profilePicUrl || '/images/profile_placeholder.png',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        data: {
            "type": snapshot.data().type,

        }
    };

    // Get the list of device tokens.
    await admin.firestore().collection('users').doc(eventContext.params.userId).get().then(doc => {
        admin.messaging().sendToDevice(doc.data().token, payload)
    });


    // Send notifications to all tokens.
    console.log('Notifications have been sent and tokens cleaned up.');
    return response
});

// exports.onEmergencyCreated = functions.f
// Create a new function which is triggered on changes to /status/{uid}
// Note: This is a Realtime Database trigger, *not* Firestore.
exports.onUserStatusChanged = functions.database.ref('/status/{uid}').onUpdate(
    async (change, context) => {
        // Get the data written to Realtime Database
        const eventStatus = change.after.val();

        // Then use other event data to create a reference to the
        // corresponding Firestore document.
        const userStatusFirestoreRef = admin.firestore().doc(`status/${context.params.uid}`);

        // It is likely that the Realtime Database change that triggered
        // this event has already been overwritten by a fast change in
        // online / offline status, so we'll re-read the current data
        // and compare the timestamps.
        const statusSnapshot = change.after.ref.state;
        const status = statusSnapshot.val();
        console.log(status, eventStatus);
        // If the current timestamp for this data is newer than
        // the data that triggered this event, we exit this function.
        if (status.last_changed > eventStatus.last_changed) {
            return null;
        }

        // Otherwise, we convert the last_changed field to a Date
        eventStatus.last_changed = new Date(eventStatus.last_changed);

        // ... and write it to Firestore.
        return userStatusFirestoreRef.set(eventStatus);
    });

exports.onEmergencyMessageCreated = functions.firestore.document('emergency_rooms/{userId}/chats/{messageId}').onCreate(async (snapshot, eventContext) => {
    await admin.firestore().collection('users').doc(eventContext.params.userId).get().then(doc => {
        if (!doc.data().emergency_recipients) {
            console.log("Undefined");
        } else {
            console.log(doc.data().emergency_recipients);
            doc.data().emergency_recipients.forEach(async recipientsId => {
                const list = [recipientsId, eventContext.params.userId];
                console.log(recipientsId);
                console.log(eventContext.params.userId);
                await admin.firestore().collection('chat_rooms')
                    .where("users", 'array-contains-any', list).get().then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            console.log(doc.data().chat_room_id);
                            var emergencyObject = {
                                "images_url": snapshot.data().images_url,
                                "message": snapshot.data().message,
                                "messageId": snapshot.data().messageId,
                                "messageState": snapshot.data().messageState,
                                "messageTimeStamp": snapshot.data().messageTimeStamp,
                                "messageType": snapshot.data().messageType,
                                "myProfileImage": snapshot.data().myProfileImage,
                                "myUserName": snapshot.data().myUserName,
                                "ownerId": snapshot.data().ownerId
                            };
                            admin.firestore().collection('chat_rooms').doc(doc.data().chat_room_id).collection('chats').doc(eventContext.params.messageId).set(emergencyObject);
                        });
                    });
            })
        }
    })
})

// exports.sendNotifications = functions.firestore.document('users/{userId}/notifications/{docId}').onCreate((change, eventContext) => {
//     const userId = eventContext.params.userId;

//     console.log('User to send notification', uuid);

//     admin.firestore().collection('users').doc(userId).get().then(doc => {

//     });
//     return ref.once("value", function (snapshot) {
//         const payload = {
//             notification: {
//                 title: 'You have been invited to a trip.',
//                 body: 'Tap here to check it out!'
//             }
//         };

//         admin.messaging().sendToDevice(snapshot.val(), payload)

//     }, function (errorObject) {
//         console.log("The read failed: " + errorObject.code);
//     });
// })
// exports.sendNotification =
//     functions.firestore.document("Buyers/{userID}/Notifications/{notificationId}")
//         .onWrite((change, context) => {
//             const userID = context.params.userID;
//             const notificationId = context.params.notificationId;
//             console.log("BuyerID: " + userID);
//         })