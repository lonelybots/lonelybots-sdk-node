# lonelybots-sdk
This is the LonelyBots SDK for Node.js. Please go to
http://lonelybots.com/dev for more information on how to build your bot.

[![Build Status](https://travis-ci.org/lonelybots/lonelybots-sdk-node.svg?branch=master)](https://travis-ci.org/lonelybots/lonelybots-sdk-node)

## Install
You should first setup a Node.js project directory with express installed.
```bash
mkdir ~/my-crazy-bot
cd ~/my-crazy-bot
npm init
npm install express --save
npm install lonelybots-sdk --save
```

## Usage
This SDK is for developing your bot server. It provides a simple
[express](http://expressjs.com/) server middleware which handles the requests
you receive from LonelyBots platform when emails arrive. It also provides some
helper functions for replying emails or downloading attachments.

Below is an example of a minimal bot server.
```javascript
// server.js
const lonelybots = require('lonelybots-sdk')
const express = require('express')

// this is your main bot logic. read more about the email object below.
function myCrazyBot (email) {
  email.reply('hi!!! I AM ALIVE!!! did you just say ' + email.text)
}

const server = express()

// here's how you use the sdk to setup the middleware for handling incoming
// requests.
server.use('/bot', lonelybots({
  callback: myCrazyBot,
  validationToken: '<the validation token you told dev bot about>',
  accessToken: '<the access token that dev bot gave you>'
}))

const port = process.env.PORT || 3000
server.listen(port, function () {
  console.log('my crazy bot is listening at port ' + port)
})
```

## The email object
When new emails arrive, we will call the callback function you provided. We
will pass in a parameter whose value is an email object. This object will have
all information about the incoming email, and some helper methods to reply or
read attachments.

Here's an example that shows the shape of the email object:
```javascript
{
  id: 'a unique identifier for the incoming email. different from messageId',
  messageId: 'value of the smtp header "message-id"',
  conversationId: 'a unique identifier for the email thread',
  bot: {
    alias: 'alias of the bot that is receiving this email',
    displayName: 'display name of the bot'
  },
  headers: { // keys are always lower cased
    'all': 'kinds',
    'of': 'smtp',
    'stuff': 'here'
  },
  references: [ // this is a list of previous message-ids in the same thread
    'previous-message-id-1',
    'previous-message-id-2'
  ],
  priority: 'normal', // low, normal, high
  date: 'parsed from headers.date',
  subject: 'subject of the email',
  from: [ // always contains exactly 1 element
    {
      name: 'Sender Name',
      address: 'sender@gmail.com'
    }
  ],
  to: [
    {
      name: 'My Crazy Bot',
      address: 'my-crazy-bot@lonelybots.com'
    },
    {
      name: 'Other People',
      address: 'others@gmail.com'
    }
  ],
  cc: [
    {
      name: 'CCed People',
      address: 'cced@gmail.com'
    }
  ],
  bcc: [
    {
      name: 'BCCed People',
      address: 'bcced@gmail.com'
    }
  ],
  text: 'text version of the email content',
  html: '<html>html version of the email content</html>',
  form: { // available if this is a dynamic form submission instead of a real email.
    title: 'Title of the form submitted',
    data: {
      field1: 'value of field1',
      field2: 'value of field2'
    }
  },
  inReplyTo: 'message-id of the email that this one is replying to',
  attachments: [
    contentType: 'image/png',
    fileName: 'image.png',
    contentId: 'cid of the attachment',
    length: 256,
    generatedFileName: 'image.png' // usually the same as fileName
  ]
}
```

There are also some helper methods for replying the email.

## email.replyAll()
This method sends a reply to all people in the original email.
```javascript
email.replyAll({
  subject: 'by default would be "RE: original subject"', // optional
  text: 'text version of the reply content', // required
  html: 'html version of the reply content', // optional
  attachments: [ // optional
    {
      fileName: 'image.png',
      contentId: 'image001',
      contentType: 'image/png',
      content: new Buffer(/* content must be a Buffer object */)
    }
  ]
})

// or, just simply pass in a string
email.replyAll('this is a shortcut to replyAll with just some text')
```

## email.reply()
This method sends a reply only to the sender of the original email.
```javascript
email.reply({
  subject: 'by default would be "RE: original subject"', // optional
  text: 'text version of the reply content', // required
  html: 'html version of the reply content', // optional
  attachments: [ // optional
    {
      fileName: 'image.png',
      contentId: 'image001',
      contentType: 'image/png',
      content: new Buffer(/* content must be a Buffer object */)
    }
  ]
})

// or, just simply pass in a string
email.reply('this is a shortcut to reply with just some text')
```

## email.createForm()
This method creates a dynamic form, just like the one dev bot gave you for
filling in the bot information. The function returns a Promise.
```javascript
email.createForm({
  title: 'Payment Info', // required
  fields: {
    firstName: {
      display: 'First Name', // required
      description: 'Please enter your first name here', // optional
      type: 'string' // optional. only string is supported at this time
    },
    lastName: {
      display: 'Last Name'
    }
  }
}).then(function (formUrl) {
  email.replyAll('please go fill out your payment info at ' + formUrl)
})
```
Once the user filled out and submitted the form, your bot will get an incoming
email with the property "form" available. you can get what the user filled in
for each field from the email.form object.
```javascript
if (email.form) {
  switch (email.form.title) {
    default:
      // deal with unknown form submission, which is an error
      break
    case 'Payment Info':
      // deal with payment info submission
      console.log(email.form.data.firstName)
      console.log(email.form.data.lastName)
      break
  }
} else {
  // deal with a normal email
}
```

## email.attachments[i].get()
This method helps you get the content of an email attachment. It returns a
Promise.
```javascript
email.attachments[0].get().then(function (data) {
  console.log(data.body) // can be a string or a Buffer object
}).catch(function (error) {
  console.log(error)
})
```
