# Haeye Cloud Functions :star:


## Node Version
```
node -v
v12.18.3
```
## Dependencies
* [**firebase-admin**](https://github.com/firebase/firebase-admin-node) provides the tools and infrastructure you need to develop your app with admin.
* [**firebase-functions**](https://github.com/firebase/firebase-functions) package provides an SDK for defining Cloud Functions for Firebase.

## Structure
* **index.js** .

## Installation
**1. Set up Node.js and the Firebase CLI** 
install **firebase-tools** to deploy functions to the Cloud Functions runtime.
```
npm install -g firebase-tools
```

**2. Login Firebase** 
to login via the browser and authenticate the firebase tool.
```
firebase login
```


**3. Initialize Firebase SDK for Cloud Functions** 
to create dependencies for your project. **You can run!**

```
firebase init functions
```
![](./img/example1.png)

## Build run and deploy!
**1. Change Directory to functions folder**
```
cd functions
```
**2. Deploy** function to firebase.
```
firebase deploy --only functions
```
