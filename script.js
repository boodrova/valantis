let offset = 0;
let currentPage = 1;
let flag = false;
let ping = -1;

//получение массива id (50 штук, начиная с offset)
async function fetchItems(offset) {
  const requestOptions = {
    method: 'POST',
      headers: {
        'X-Auth' : md5("Valantis_20240226"),
        'Content-Type': 'application/json',
        'charset': 'utf-8'
      },
      body: JSON.stringify({
        action: 'get_ids',
        params: {
        offset: offset,
        limit: 50
        }
      })
  };

  try {
    const response = await fetch('http://api.valantis.store:40000/', requestOptions);
      if (response.ok) {
        const data = await response.json();
        return data.result;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
  } catch (error) {
    console.error(error);
  }
}

//получаю информацию о товаре по id
async function fetchItemsDetails(itemIds) {
    const requestOptions = {
        method: 'POST',
        headers: {
          'X-Auth' : md5("Valantis_20240226"),
          'Content-Type': 'application/json',
          'charset': 'utf-8'
        },
        body: JSON.stringify({
          action: 'get_items',
          params: {
            ids: itemIds
          }
        })
    };
    
    try {
      const response = await fetch('http://api.valantis.store:40000/', requestOptions);
      if (response.ok) {
        const data = await response.json();
        return data.result;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
        console.error(error);
        return null;
    }
}

//отображение таблицы товаров
function renderProductTable(allItemsDetails) {
    let tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = '';
        
    for (let i = 0; i < allItemsDetails.length; i++) {
    let tr = document.createElement('tr');
        
        for (let key in allItemsDetails[i]) {
            let td = document.createElement('td');
            td.textContent = allItemsDetails[i][key];
            tr.appendChild(td);
        }
        tableBody.appendChild(tr);
        document.getElementById('currentPage').innerText = `${currentPage}`;
    }
}

//страница вперед
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        offset -= 50;
        itemDetails();
    }
}
  
//страница назад
function nextPage() {
    currentPage++;
    offset += 50;
    itemDetails();
}

//применяю фильтр
async function applyFilter(offset) {
  if (ping == 1) {
    options = applyFilterBrand();
  } else if (ping == 2) {
    options = applyFiltePrice();
  } else if (ping == 3) {
    options = applyFilterName();
  }
  try {
    const response = await fetch('http://api.valantis.store:40000/', options);
    if (response.ok) {
      const items = await response.json();
      return items.result.slice(offset, offset+50);
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(error);
  }
}

//далее три функции, определяющие по каким параметрам будет проходить фильтрация.
//да, они очень кривые, медленные, но как-то работают.
//к сожалению, пока не получилось, что хотела.
function applyFilterBrand() {
  ping = 1;
  flag = true;
  itemDetails();
  let input = document.getElementById('filterInputBrand');
  let toFind = input.value;

  const requestOptions = {
    method: 'POST',
    headers: {
      'X-Auth' : md5("Valantis_20240226"),
      'Content-Type': 'application/json',
      'charset': 'utf-8'
    },
    body: JSON.stringify({
      action: 'filter',
      params: {
        brand: toFind
      }
    })
  };
  return requestOptions;
}

function applyFiltePrice() {
  ping = 2;
  flag = true;
  itemDetails();
  let input = document.getElementById('filterInputPrice');
  let toFind = input.value;

  const requestOptions = {
    method: 'POST',
    headers: {
      'X-Auth' : md5("Valantis_20240226"),
      'Content-Type': 'application/json',
      'charset': 'utf-8'
    },
    body: JSON.stringify({
      action: 'filter',
      params: {
        price: toFind
      }
    })
  };
  return requestOptions;
}

function applyFilterName() {
  ping = 3;
  flag = true;
  itemDetails();
  let input = document.getElementById('filterInputName');
  let toFind = input.value;

  const requestOptions = {
    method: 'POST',
    headers: {
      'X-Auth' : md5("Valantis_20240226"),
      'Content-Type': 'application/json',
      'charset': 'utf-8'
    },
    body: JSON.stringify({
      action: 'filter',
      params: {
        product: toFind
      }
    })
  };
  return requestOptions;
}

async function itemDetails() {
  let itemIds = [];
  if (flag === true) {
    itemIds = await applyFilter(offset);
    flag = false;
  } else {
    itemIds = await fetchItems(offset);
  }

  let allItemsDetails = [];
  allItemsDetails = await fetchItemsDetails(itemIds);
  
  const table = {};
  const res = allItemsDetails.filter(({id}) =>(!table[id] && (table[id] = 1)));
  renderProductTable(res);
}

itemDetails();
//displayItems();