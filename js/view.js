const view = {}

view.setActiveScreen = (screenName) => {
    document.getElementById('app').innerHTML = component[screenName]
    
    switch(screenName) {
        case 'login':
            const btnMoveToRegister = document.getElementById("js-btnMoveToRegister")
            btnMoveToRegister.addEventListener("click", function(event) {
                event.preventDefault()
                view.setActiveScreen('register')
            })
            const formLogin = document.getElementById("js-formLogin")
            formLogin.addEventListener("submit", async function(event) {
                event.preventDefault()
                const email = formLogin.email.value
                const password = formLogin.password.value
                const payload = {email: email, password: password}
                try {
                    const success = await controller.login(payload)
                    // if (success) {
                    //     view.setActiveScreen('chat')
                    // }
                } catch(err) {
                    alert(err.message)
                }
            })
            break;

        case 'register':
            document.getElementById("js-btnMoveToLogin").addEventListener("click", function() {
                view.setActiveScreen('login')
            })
            const form = document.getElementById("js-formRegister")
            form.addEventListener("submit", async function(event) {
                event.preventDefault()
                const userInput = {
                    email: form.email.value,
                    displayName: form.name.value,
                    password: form.password.value,
                    retypePassword: form.retypePassword.value,
                }
                try {
                    const result = await controller.register(userInput)
                    if (result) alert("Register successfully! Check your inbox!")
                } catch(err) {
                    alert(err.message)
                }
                
            })
            break;

        case 'chat':
            model.subscribeListCon()

            const formCreateCon = document.getElementById("js-formCreateCon")
            formCreateCon.addEventListener("submit", function(event) {
                event.preventDefault()
                controller.createCon(formCreateCon.txtConName.value)
            })

            const formChat = document.getElementById("js-formChat")
            formChat.addEventListener("submit", function(event) {
                event.preventDefault()
                try {
                    console.log(formChat.message.value)
                    controller.sendMsg(formChat.message.value)
                    formChat.message.value = ""
                }catch(err) {
                    alert(err)
                }
            })

            const formInvite = document.getElementById("js-formInvite")
            formInvite.addEventListener("submit", function(event) {
                event.preventDefault()
                const email = formInvite.email.value
                try {
                    model.invite(email)
                }catch(err) {
                    alert(err)
                }
            })

            document.getElementById("sign-out").addEventListener("click", () => {
                firebase.auth().signOut() 
                view.setActiveScreen('login')
            })
            break;
    }
}

view.onMessageChanges = (messages) => {
    const listMessage = document.getElementById("messages")
    const messagesForm = document.getElementById("messagesForm")
    listMessage.innerHTML = ""
    messagesForm.style.maxHeight = messagesForm.clientHeight

    messages.forEach(function(msg) {
        const msgClass = msg.sender === authedUser ? "sent" : "replies"
        const src = msg.sender === authedUser ? "http://emilcarlsson.se/assets/mikeross.png" : "http://emilcarlsson.se/assets/harveyspecter.png"
        const msgHtml = `
        <li class="${msgClass}">
            <img src="${src}" alt="" />
            <p class="break-word">${msg.content}</p>
        </li>
        `
        listMessage.insertAdjacentHTML("beforeend", msgHtml)
    })
    messagesForm.scrollTop = messagesForm.scrollHeight
}

view.onConsChanges = (cons) => {
    const listCon = document.getElementById("js-listCon")
    listCon.innerHTML = ""
    cons.forEach(function(con) {
        const conLi = document.createElement("li")
        conLi.innerHTML = con.name
        conLi.dataset.id = con.id
        conLi.classList.add("list-item")

        if (conLi.dataset.id === activeCon) {
            conLi.classList.add("active")
        }
        conLi.addEventListener("click", function() {
            controller.updateActiveCon(con.id)
        })
        listCon.appendChild(conLi)
    })
}

view.onActiveConChanges = (con) => {
    const listCon = document.querySelectorAll("#js-listCon > li")
    listCon.forEach(function(conLi) {
        if (conLi.dataset.id !== con.id) {
            conLi.classList.remove("active")
        } else {
            conLi.classList.add("active")
        }
    })
    document.getElementById("js-conTitle").innerHTML = con.name
    view.onActiveConUpdate(con)
}

view.onActiveMemberChanges = (email) => {
    const listMember = document.querySelectorAll("#js-listMember > li")
    listMember.forEach(function(conLi) {
        if (conLi.dataset.id !== email) {
            conLi.classList.remove("active")
        } else {
            conLi.classList.add("active")
        }
    })
}

view.updateListMember = (emails) => {
    const listMember = document.getElementById("js-listMember")
    listMember.innerHTML = ""
    emails.forEach(function(email) {
        const memberLi = document.createElement("li")
        memberLi.innerText = email
        memberLi.dataset.id = email
        memberLi.addEventListener("click", function() {
            controller.updateActiveMember(email)
        })
        listMember.appendChild(memberLi)
    })
}

view.onActiveConUpdate = (con) => {
    const email = con.list_member
    view.updateListMember(email)
}