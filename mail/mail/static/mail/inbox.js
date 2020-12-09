document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(Reply='NA') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if(Reply!=='NA'){
    if (Reply.subject.startsWith('Re:')){
      sub = Reply.subject;
    } else{
      sub = `Re: ${Reply.subject}`;
    }
    document.querySelector('#compose-recipients').value = Reply.sender;
    document.querySelector('#compose-subject').value = sub;
    document.querySelector('#compose-body').value = `On: ${Reply.timestamp} ${Reply.sender} wrote: ${Reply.body} `;
  }

  document.querySelector('.btn.btn-primary').addEventListener('click', () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent')
    });
  });

}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  Archiving = false;

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //GET all the mails for this mailbox
  fetch(`/emails/${(mailbox)}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    emails.forEach(element => {
      const maildiv = document.createElement('div');
      maildiv.id = element.id;
      maildiv.className = 'maildisp'
      maildiv.innerHTML = `From: ${element.sender}<br>` + `Subject: ${element.subject}<br>`;
      if (mailbox !== 'sent'){
        if (element.archived === true){
          ArcButton = 'Unarchive';
        } else {
          ArcButton = 'Archive';
        }
        maildiv.innerHTML += `<button id="${element.id}" class="ArcButton" value="${ArcButton}" >${ArcButton}</button> <br> `
      }
      if (element.read === true){
        maildiv.style.backgroundColor = 'gray'
      } else {
        maildiv.style.backgroundColor = 'white'
      }
      document.querySelector('#emails-view').append(maildiv);
    });
    document.querySelectorAll('.maildisp').forEach(obj => {
      obj.addEventListener('click',(event) => {
        const element = event.target;
        if (element.className !== 'ArcButton'){
        console.log('checking')
        if(Archiving === false){
          event.stopPropagation();
          view_email(obj);
          event.stopPropagation();
        }}});
    });
  });
  document.addEventListener('click', event => {
    event.stopImmediatePropagation()
    const element = event.target;
    if (element.className === 'ArcButton') {
      console.log('click');
      event.stopPropagation();
      if(element.value === 'Archive'){
        fetch(`/emails/${element.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        .then(response => {})
        .then(result => {load_mailbox('inbox')})
      }else{
        fetch(`/emails/${element.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        .then(response => {})
        .then(result => {load_mailbox('inbox')})
      }
    }
    //load_mailbox('inbox');
    event.stopPropagation();
  });
}

function view_email(obj) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';

  //Get the mail and display it
  const mailid = obj.id
  fetch(`/emails/${mailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  fetch(`/emails/${mailid}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    // ... do something else with email ...
    content = `<h2>From: ${email.sender}</h2> <br>`;
    email.recipients.forEach(obj => {
      content += `<h2>To: ${obj}</h2> <br>`;
    })
    content += `<h3>Subject: ${email.subject}</h3> <br> <p>${email.timestamp}</p> <br> <p>${email.body}</p>`;
    content += `<button class="ReplyButton" value="reply}">Reply</button>`
    document.querySelector('#view-email').innerHTML = content;
    document.addEventListener('click', event => {
    event.stopPropagation();
    const element = event.target;
    if (element.className === 'ReplyButton') {
      compose_email(email);
    }
  });
  });
  
}