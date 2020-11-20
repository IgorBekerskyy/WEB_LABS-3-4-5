
const planeList = document.getElementById('planes-list');
const searchBar = document.getElementById('find-plane');
const clearButton = document.getElementById('clear-search-bar');


const createPlaneName = document.getElementById('create_name');
const createPlaneAmount = document.getElementById('create_amount');
const createPlanePrice = document.getElementById('create_priceInUAH');

let editActive = false;

const planes_url = 'http://localhost:8080/planes';

let planes = [];
function fetchData(url){
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            for (i = 0; i < data.length; i++){
                planes.push(data[i]);
            }
            displayPlanes(planes);
        });
}

let currentPlanes = planes

searchBar.addEventListener('keyup', filterPlanes)
function filterPlanes(searchString){
    const searchFilterString = searchString.target.value.toLowerCase();
    const filteredPlanes = planes.filter(plane =>{
        return plane.name.toLowerCase().includes(searchFilterString);
    });
    currentPlanes = filteredPlanes;
    visualiseSortedPlanes();
}
clearButton.addEventListener('click', ()=> {
    searchBar.value = '';
    currentPlanes = planes;
    visualiseSortedPlanes();
})


function calculatePrice(){
    var priceSum = 0;
    var totalPriceLabel = document.getElementById('total-price');
    currentPlanes.forEach(hockeypuck => priceSum += plane.price_in_uah);
    totalPriceLabel.textContent = 'Total price: ' + priceSum + 'UAH';
}


function visualiseSortedPlanes() {
    var sortType = document.getElementById('sort-select').value;
    console.log(sortType);
    if (sortType === 'none') {
        displayPlanes(currentPlanes);
        return;
    } else if (sortType === 'price') {
        currentPlanes.sort(compareByPrice);
    }
    displayPlanes(currentPlanes);
}

function compareByPrice(firstPlane, secondPlane){
    return firstPlane.price_in_uah - secondPlane.price_in_uah;
}


const displayPlanes = (planesToShow) => {
    const htmlString = planesToShow.map((plane)=>{
        return `
        <li class="plane">
            <div>            
                <h2 class="plane_id"> ${plane.id}</h2>
                <h2> ${plane.name}</h2>
                <h3 class="amount">Amount: ${plane.amount}</h3>
                <h3 class="priceInUAH">Price: ${plane.price_in_uah}</h3>
            </div>
            <form class="form__edit_plane" id="form__edit_plane">
                    <input id="edit_name" name="name" type="text" placeholder="Name">
                    <input id="edit_amount" name="amount" type="number" step=0.1 placeholder="Amount">
                    <input id="edit_priceInUAH" name="priceInUAH" type="number" placeholder="Price">
            </form>
            <div class= "control-buttons">
                <button class="edit-button" id="edit-button" onclick="editRecord(this)">Edit</button>
                <button class="delete-button" id="delete-button" onclick="deleteRecord(this)">Delete</button>
            </div>
        </li>
        `
    }).join('');

    planeList.innerHTML = htmlString;
}

function deleteRecord(record){
    const list_to_delete = record.parentNode.parentNode;
    let planeId = parseInt(list_to_delete.childNodes[1].childNodes[1].innerHTML);
    let indexToDeleteFromAll = planes.findIndex(obj => obj.id==planeId);
    planes.splice(indexToDeleteFromAll, 1);
    let indexToDeleteFromCurrent = currentPlanes.findIndex(obj => obj.id==planeId);
    if (indexToDeleteFromCurrent != -1){
        currentPlanes.splice(indexToDeleteFromCurrent, 1);
    }
    deletePlane(planeId);
    visualiseSortedPlanes();
    return list_to_delete;
}
function editRecord(record){
    const nodeList = record.parentNode.parentNode.childNodes;
    const editBar = nodeList[3];
    const infoBar = nodeList[1];
    let planeId = parseInt(infoBar.childNodes[1].innerHTML);
    let planeName = infoBar.childNodes[3].innerHTML;
    let planeAmount = parseFloat(infoBar.childNodes[5].innerHTML);
    let planePrice = parseFloat(infoBar.childNodes[7].innerHTML);
    const editedPlaneName = nodeList[3][0];
    const editedPlaneAmount  = nodeList[3][1];
    const editedPlanePrice = nodeList[3][2];

    let indexToEdit = planes.findIndex(obj => obj.id==planeId);
    if (editActive == false){
        openEditBar(editBar, infoBar);
        editActive = true;
    } else if (editActive == true){
        closeEditBar(editBar, infoBar);
        if (validateAmountAndPrice(editedPlaneAmount .value, editedPlanePrice.value) == false){
            editedPlaneAmount .value = '';
            editedPlanePrice.value = '';
            editActive = false;
            return;
        }
        let finalName = planeName;
        let finalAmount = planeAmount;
        let finalPrice = planePrice;
        if (editedPlaneName.value == "" && editedPlaneAmount .value == "" && editedPlanePrice.value == ""){
            editActive = false;
            visualiseSortedPlanes();
            return
        }
        if (editedPlaneName.value != "") {
            planes[indexToEdit]["name"] = editedPlaneName.value;
            finalName = editedPlaneName.value;
        } else {
            planes[indexToEdit]["name"] = planeName;
        }
        if (editedPlaneAmount .value != "") {
            planes[indexToEdit]["amount"] = parseFloat(editedPlaneAmount .value);
            finalAmount =  parseFloat(editedPlaneAmount .value);
        } else{
            planes[indexToEdit]["amount"] = planeAmount;
        }
        if (editedPlanePrice.value != "") {
            planes[indexToEdit]["price_in_uah"] =  parseFloat(editedPlanePrice.value);
            finalPrice = parseFloat(editedPlanePrice.value);
        } else{
            planes[indexToEdit]["price_in_uah"] = planePrice;
        }

        if (searchBar.value != '' && editedPlaneName.value != '' && editedPlaneName.value.includes(searchBar.value) == false){
            let indexToDeleteFromCurrent = currentPlanes.findIndex(obj => obj.id==planeId);
            currentPlanes.splice(indexToDeleteFromCurrent, 1);
        }

        const jsonPlane = createJSON(finalName, finalAmount, finalPrice)
        editPlane(planeId, jsonPlane)
        editActive = false;
        visualiseSortedPlanes();
    }
}

function openEditBar(editBar, infoBar){
    editBar.classList.add('open');
    editBar.classList.remove('hide');
    infoBar.classList.add('hide');
    infoBar.classList.remove('open');
}

function closeEditBar(editBar, infoBar){
    editBar.classList.add('hide');
    editBar.classList.remove('open');
    infoBar.classList.add('open');
    infoBar.classList.remove('hide');
}
async function createPlane(){
    if(validateFormRequirements(createPlaneName.value, createPlaneAmount.value, createPlanePrice.value) == false){
        return;
    }
    if(validateAmountAndPrice(createPlaneAmount.value, createPlanePrice.value) == false){
        return;
    }
    const jsonPlane = createJSON(createPlaneName.value, createPlaneAmount.value, createPlanePrice.value);
    await postPlane(jsonPlane);
    visualiseSortedPlanes();
    return jsonPlane;
}
async function postPlane(newPlane) {
    console.log(planes);
    let response = await fetch(planes_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(newPlane)
    }).then(response => response.json())
        .then(data => planes.push(data))
    return response;
}

async function deletePlane(id){
    let response = await fetch(planes_url + '/' + id, {
        method: 'DELETE',
    })
    return response;
}
async function editPlane(id, editedPlane){
    fetch(planes_url + '/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(editedPlane)
    })
}
function createJSON(name, amount, price_in_uah){
    let createdPlane = {
        "name": name,
        "amount": parseFloat(amount),
        "price_in_uah": parseFloat(price_in_uah)
    }
    return createdPlane;
}




function validateAmountAndPrice(amount, price){
    if (parseFloat(amount) <=0){
        alert('amount cannot be less then zero');
        return false;
    }
    if (parseFloat(price) <=0){
        alert('price cannot be less then zero');
        return false;
    }
    return true;
}
function validateFormRequirements(name, amount, price){
    if(name == ''){
        alert('name field is requiered')
        return false;
    }
    if (amount == ''){
        alert('amount field is requiered');
        return false;
    }
    if (price == 0){
        alert('price  field is requiered');
        return false;
    }
    return true;
}


fetchData(planes_url);
