const serverUri = 'https://cws.auckland.ac.nz/nzsl/api';

const homeButton = document.getElementById("HomeButton");
const NZSLButton = document.getElementById("NZSLButton");
const eventsButton = document.getElementById("EventsButton");
const registerButton = document.getElementById("RegisterButton");
const guestBook = document.getElementById("GuestBookButton");
const logButton = document.getElementById("LogButton");

const home = document.getElementById("Home");
const NZSL = document.getElementById("NZSL");
const events = document.getElementById("Events");
const register = document.getElementById("Register");
const guest = document.getElementById("GuestBook");
const  log = document.getElementById("Log");


const searchInput = document.getElementById('searchInput');
let signImageContainer;
let signImageLists;
let signs;

const eventContainer = document.getElementById('eventContainer');

const username = document.getElementById("username");
const password = document.getElementById("password");
const address = document.getElementById("address");
const rb = document.getElementById("rb");

const commentContainer = document.getElementById("commentContainer");
const postCommentButton = document.getElementById("postComment");
const commentInput = document.getElementById("commentInput");
const loginstatus = document.getElementById("loginstatus");
const logincontainer = document.getElementById("logincontainer");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const logoutButton = document.getElementById("logout");
const loginButton = document.getElementById("login");

const max = document.getElementById("max");
const min = document.getElementById("min");
const visitline = document.getElementById("visits");
const uvisitline = document.getElementById("uvisits");
const graph = document.getElementById("graph");

homeButton.addEventListener("click", () => {
    home.style.display = "block";
    NZSL.style.display = "none";
    events.style.display = "none";
    register.style.display = "none";
    guest.style.display = "none";
    log.style.display = "none";

});

NZSLButton.addEventListener("click", () => {
    home.style.display = "none";
    NZSL.style.display = "block";
    events.style.display = "none";
    register.style.display = "none";
    guest.style.display = "none";
    log.style.display = "none";
});

eventsButton.addEventListener("click", () => {
    home.style.display = "none";
    NZSL.style.display = "none";
    events.style.display = "block";
    register.style.display = "none";
    guest.style.display = "none";
    log.style.display = "none";

});

registerButton.addEventListener("click", () => {
    home.style.display = "none";
    NZSL.style.display = "none";
    events.style.display = "none";
    register.style.display = "block";
    guest.style.display = "none";
    log.style.display = "none";

});

guestBook.addEventListener("click", () => {
    home.style.display = "none";
    NZSL.style.display = "none";
    events.style.display = "none";
    register.style.display = "none";
    guest.style.display = "block";
    log.style.display = "none";
});

logButton.addEventListener("click", () => {
    home.style.display = "none";
    NZSL.style.display = "none";
    events.style.display = "none";
    register.style.display = "none";
    guest.style.display = "none";
    log.style.display = "block";
});


searchInput.addEventListener('input', function() {
    const filter = searchInput.value.toLowerCase();
    for (const key in signs) {
      const sign = signs[key].id || signs[key].description;

      if (sign.toLowerCase().indexOf(filter) > -1) {
        signImageLists[key].style.display = ""; 
      } else {
        signImageLists[key].style.display = "none";
      }
    }
});

rb.addEventListener('click', () => Register());
postCommentButton.addEventListener('click', () => submitComment());
loginButton.addEventListener('click', () => testAuth());
logoutButton.addEventListener('click', () => logout());

async function fetchVersion(){
    const response = await fetch(serverUri + "/Version");
    const text = await response.text();
    const ver = document.getElementById("version");
    ver.innerHTML = text;
}

async function fetchAllSign(){
    const response = await fetch(serverUri + "/AllSigns");
    signs = await response.json();
    signImageContainer = document.getElementById("signImageContainer");

    for (const key in signs){
        // console.log(texts[key].id);
        const liElement = document.createElement('li');
        liElement.id = signs[key].id;
        const imgElement = document.createElement('img');
        const paragraphElement = document.createElement('p');
        imgElement.src = serverUri + "/SignImage/" + signs[key].id;
        paragraphElement.innerText = signs[key].description;
        // console.log(text.id);
        liElement.appendChild(imgElement);
        liElement.appendChild(paragraphElement);
        signImageContainer.appendChild(liElement);
    }
    signImageLists = signImageContainer.getElementsByTagName("li");
}

async function fetchAllEvents(){
    const response = await fetch(serverUri + "/EventCount");
    const count = await response.text();
    // console.log(count);
    for (let i=0; i < parseInt(count); i++){
        const liElement = document.createElement('li');
        const event = await fetchEvent(i);

        const lines = event.split('\n');
        let summary;
        let description;
        let location;
        let start;
        let end;
        let created;
        const Events = {};

        for (let i=0; i < lines.length; i++){
            // console.log(lines[i]);
            const [key, value] = lines[i].split(':', 2).map(item => item.trim());
            // console.log(key);
            // console.log(value);
            if (key && value) {
                Events[key] = value;
            }
        }
        console.log(Events);

        summary = Events['SUMMARY'];
        description = Events['DESCRIPTION'];
        location = Events['LOCATION'];
        start = parseToNzTime(Events['DTSTART']).toLocaleString();
        end = parseToNzTime(Events['DTEND']).toLocaleString();
        created = parseToNzTime(Events['DTSTAMP']).toDateString();


        const stamp = document.createElement('p');
        stamp.id = "stamp";
        const heading = document.createElement('p');
        heading.id = "heading";
        
        const l = document.createElement('p');
        const s = document.createElement('p');
        const e = document.createElement('p');

        stamp.innerText = created;
        heading.innerText = summary + ": " + description;
        l.innerText = "Location: " + location;
        s.innerText = "Starts: " + start;
        e.innerText = "Ends: " + end;
        liElement.appendChild(stamp);
        liElement.appendChild(heading);
        liElement.appendChild(l);
        liElement.appendChild(s);
        liElement.appendChild(e);
        const button = document.createElement('button');
        button.textContent = `Download`;
        button.onclick = () => downloadICS(event);
        liElement.appendChild(button);
        eventContainer.appendChild(liElement);
    }
}
async function fetchEvent(id){
    const eventResponse = await fetch(serverUri + `/Event/${id}`,{
        headers:{
            "Accept":"*/*",
        }
    }
    );
    const event = await eventResponse.text();
    // console.log(event);    
    return event;
}

function parseToNzTime(data){
    const string = `${data.slice(0,4)}-${data.slice(4,6)}-${data.slice(6,8)}T${data.slice(9,11)}:${data.slice(11,13)}:${data.slice(13,15)}`;
    const newDate = new Date(string);
    newDate.setHours(newDate.getHours() + 12);
    return newDate;
}

function downloadICS(content) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function Register(){
    if (username.value == "" || password.value == ""){
        alert("username and password cannot be empty");
    }
    else{
        const registerDetail = {
            "username": username.value,
            "password": password.value,
            "address": address.value
        }
        console.log("HI");
        const fetchPromise = await fetch(serverUri + "/Register",{
            headers : {
                "Content-Type" : "application/json",
            },
            method : "POST",
            body : JSON.stringify(registerDetail)
        })
        username.value ="";
        password.value ="";
        address.value="";
        const responseText = await fetchPromise.text();
        alert(responseText);
    }
}

async function loadComment() {

    const response = await fetch(serverUri + '/Comments');
    const text = await response.text();
    commentContainer.innerHTML = text;
    console.log(text);
}

async function testAuth(){
    console.log("testauth trigger");
    if (!localStorage.getItem("user")){
        const credentials = btoa(`${loginUsername.value}:${loginPassword.value}`);
        // Send GET request with Authorization header
        const authResponse = await fetch(serverUri + "/TestAuth", {
            method: "GET",
            headers: {
                "Authorization": `Basic ${credentials}`,  // Add the Basic Auth header
                "Content-Type": "application/json",
            }
        });
        if (authResponse.ok){
            localStorage.setItem("user", loginUsername.value);
            localStorage.setItem("pswd", loginPassword.value);
            loginstatus.innerText = loginUsername.value;
            logoutButton.style.display="block";
            logincontainer.style.display="none";
            submitComment();
        }
        else{
            alert("Invalid username or password");
        }
    }
}

function logout(){
    localStorage.clear();
    loginstatus.innerHTML="";
    logoutButton.style.display="none";
}

async function submitComment(){

    if (localStorage.getItem("user")){
        const credentials = btoa(`${localStorage.getItem("user")}:${localStorage.getItem("pswd")}`);
        const commentData = {
            "comment": commentInput.value
        }
        const url = `${serverUri}/Comment?comment=${commentInput.value}`;
        const fetchPromise = await fetch(url, {
            method : "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,  // Include Basic Auth header
                "Content-Type": "application/json"
            },
            // body: JSON.stringify(commentData)
        });
        if (fetchPromise.ok){
            alert("Thank you for your comment :)");
            commentInput.value = "";
            loadComment();
        }
    }
    else{
        logincontainer.style.display="block";
        alert("please log in before submitting a comment!");
    }
}

async function fetchLog(){
    const response = await fetch(serverUri + "/Log");
    const data = await response.json();
    const visits = []
    const uniqueVisits = []
    const dates = []

    // console.log(data);
    // console.log("hi");

    for (let i = 0; i < data.length; i++){
        // console.log(data[i]);
        visits.push(data[i].visits);
        uniqueVisits.push(data[i].uniqueVisits);
        dates.push(data[i].date);
    }
    const sourceDataVisit = document.getElementById("visitData");
    const sourceDataUniqueVisit = document.getElementById("uniqueVisitData");
    sourceDataVisit.textContent = visits.toString();
    sourceDataUniqueVisit.textContent = visits.toString();

    const maxVisit = Math.max(...visits);
    const minVisit = Math.min(...visits)
    const maxUniqueVisit = Math.max(...uniqueVisits);
    const minUniqueVisit = Math.min(...uniqueVisits);

    min.textContent = Math.min(minVisit, minUniqueVisit);
    max.textContent = Math.max(maxVisit, maxUniqueVisit);

    let points = "";
    let uniquePoints = "";
    const x = 600/data.length;
    for (let i=0; i<data.length; i++){
        const n = 1 - (visits[i]-minVisit)/(maxVisit-minVisit);
        const un = 1 - (uniqueVisits[i]-minUniqueVisit)/(maxUniqueVisit-minUniqueVisit);
        const pn = 50 + 300 * n;
        const pun = 50 + 300 * un;
        points += 50 + x * (i) + "," + pn + " ";
        uniquePoints += 50 + x * (i) + "," + pun + " ";
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("x", 50 + x * (i));
        text.setAttribute("y", 360);
        text.textContent= dates[i];
        text.setAttribute("font-size", 8);
        text.setAttribute("transform", `rotate(-90, ${50 + x * (i)}, 360)`);
        text.setAttribute("text-anchor", "end");
        graph.appendChild(text);
    }
    console.log(points);

    visitline.setAttribute("points", points);
    uvisitline.setAttribute("points",uniquePoints);

}

window.onload = () => {
    fetchAllSign();
    fetchVersion();
    fetchAllEvents();
    loadComment();
    fetchLog();
    if (localStorage.getItem("user")){
        loginstatus.innerText = localStorage.getItem("user");
        logoutButton.style.display="block";
    }
};
