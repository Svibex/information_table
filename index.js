let db = null;
let rowId = null;
const DEFAULT_PAGE = 1;
let page = DEFAULT_PAGE;
let rowsPerPage = 10;
let LASTPAGE;

fetch("./db.json")
    .then(response => {
        return response.json()
            .then(data => {
                db = data.slice(0);
                createTable(db);
                LASTPAGE = db.length / rowsPerPage
                const table = document.querySelector('.table');
                addListener(table);

            });
    });
const app = document.getElementById('app');

app.innerHTML = `
<h1 class="title">INFORMATION</h1>
<div id="controls">
            <div>
                <input type="checkbox" data-column-class="col-1" checked>
                <span>FIRSTNAME <br>(hide/show) </span>
            </div>
            <div>
                <input type="checkbox" data-column-class="col-2" checked>
                <span>LASTNAME <br>(hide/show) </span>
            </div>
            <div>
                <input type="checkbox" data-column-class="col-3" checked>
                <span>ABOUT <br>(hide/show) </span>
            </div>
            <div>
                <input type="checkbox" data-column-class="col-4" checked>
                <span>EYECOLOR <br>(hide/show) </span>
            </div>
        </div>
<table class="table" id="paged"></table> 
<div class="navigation">
    <button onclick="goPreviousPage()" class="navigation_previous" disabled="disabled">PREVIOUS</button>
    <p class="currentPage">PAGE: 1</p>
    <button onclick="goNextPage()" class="navigation_next">NEXT</button> 
</div>
`;

const table = document.querySelector('.table');

function createTable() {

    table.innerHTML = `

        <tr class="thead">
        
            <th class="col-1">
                FIRSTNAME
                <img class="sort" id="firstName" alt="sort" src="sort.png">
            </th>
            <th class="col-2">
                LASTNAME
                <img class="sort" id="lastName" alt="sort" src="sort.png">
            </th>
            <th class="col-3" id="title-col-3"> 
                ABOUT
                <img class="sort" id="about" alt="sort" src="sort.png">
            </th>
            <th class="col-4">
                EYECOLOR
                <img class="sort" id="eyeColor" alt="sort" src="sort.png">
            </th>
        </tr>
    `;

    for (let i = rowsPerPage*(page-1); i < rowsPerPage*page; i++) {

        let row = document.createElement('tr');
        row.setAttribute('id', db[i].id);
        row.innerHTML = `
          <tr>
            <td class="col-1">${db[i].name.firstName}</td>
            <td class="col-2">${db[i].name.lastName}</td>
            <td class="col-3">${db[i].about}</td>
            <td class="col-4">${db[i].eyeColor}</td>
          </tr>   
        `
        table.append(row);
    }
}

const controls = document.getElementById('controls');
controls.addEventListener('change', e => {
    toggleColumn(e.target.dataset.columnClass);
});

function toggleColumn(columnClass) {
    const cells = document.querySelectorAll(`.${columnClass}`);

    cells.forEach(cell => {
        cell.classList.toggle('hidden');
    });
}


function addListener(DOMNode) {
    DOMNode.addEventListener('click', function (event) {
        if (event.target.tagName === 'IMG') {
            sortTable(event.target.id);
        } else if (event.target.parentNode.tagName === 'TR' && event.target.tagName !== 'TH') {
            rowId = event.target.parentNode.getAttribute('Id');
            showModal(event)
        }
    })
}

function sortTable(id) {
    let sortedRows = db.slice(rowsPerPage*(page-1), rowsPerPage*page);
    if(id === "firstName" || id === "lastName") {
        sortedRows = sortedRows
            .sort((rowA, rowB) => {
                if(rowA.name[id] === rowB.name[id]) return 0;
                return rowA.name[id] > rowB.name[id] ? 1 : -1
            });
    } else if (id === "about" || id === "eyeColor") {
        sortedRows = sortedRows
            .sort((rowA, rowB) => {
                if(rowA[id] === rowB[id]) return 0;
                return rowA[id] > rowB[id] ? 1 : -1
            });
    }
    db.splice(rowsPerPage*(page-1), rowsPerPage, ...sortedRows);
    createTable();
}

function showModal(event) {
    if (document.querySelector('.modalWrapper')) return;
    const top = event.target.parentNode.getBoundingClientRect().top + event.target.parentNode.offsetHeight;

    let modal = document.createElement('div');
    modal.style.top = +Math.floor(top) + "px";
    modal.setAttribute('class', 'modalWrapper');
    modal.innerHTML = `
                        <form class="inputForm" name="form">
                        <div class="form__inputs">
                            <input class="input" type="text" name="firstName" id="firstName">
                            <input class="input" type="text" name="lastName" id="lastName">
                            <textarea name="about" id="about" rows="5"></textarea>
                            <input class="input" type="text" name="eyeColor" id="eyeColor">
                        </div>
                        <div class="buttons">
                            <button type="button" value="Ok" id="ok" onclick="handleSubmit()">Ok</button>
                            <button type="button" value="Cancel" onclick="handleCancel()">Cancel</button>
                        </div>
                        </form>
                `

    table.after(modal);

    const form = document.forms.form;
    const row = db.find(item => item.id === rowId);

    form.firstName.value = row.name.firstName;
    form.lastName.value = row.name.lastName;
    form.about.value = row.about;
    form.eyeColor.value = row.eyeColor;
}

function handleSubmit() {
    const form = document.forms.form;

    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const about = form.about.value;
    const eyeColor = form.eyeColor.value;

    db = db.map(item => {
        if (item.id === rowId) {
            return {...item, name: {firstName, lastName}, about, eyeColor}
        } else {
            return item;
        }
    })
    document.querySelector('.modalWrapper').remove();
    createTable(db);
}

function handleCancel() {
    document.querySelector('.modalWrapper').remove();
}

const nextPage = document.querySelector('.navigation_next')
const previousPage = document.querySelector('.navigation_previous')
const currentPage = document.querySelector('.currentPage')

function goNextPage() {
    page++
    currentPage.textContent = `PAGE: ${page}`
    if (page>=LASTPAGE) {
        nextPage.disabled = "disabled"
    }
    previousPage.disabled = ""
    createTable()
}

function goPreviousPage() {
    page--
    currentPage.textContent = `PAGE: ${page}`
    if (page<=DEFAULT_PAGE) {
        previousPage.disabled = "disabled"
    }
    nextPage.disabled = ""
    createTable()
}