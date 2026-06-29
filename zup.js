
let RES_ID=601000448;// 601000284   "11_ККЗ"  601000448  "KKZ_Gluhiv"
let ftp_id = 601000441; //20233


//===========================БазаДаних=======================================================================================
//===========================БазаДаних=======================================================================================
//===========================БазаДаних=======================================================================================
//===========================БазаДаних=======================================================================================
//===========================БазаДаних=======================================================================================

function async_write(id, folder, fileName, content) {
    return new Promise((resolve, reject) => {
        const remote = wialon.core.Remote.getInstance();
        const path = '//' + (folder ? folder + '/' : '') + fileName;
        remote.remoteCall('file/write', {itemId: id, storageType: 1, path: path,content: content,  writeType: 0, contentType: 0}, (error) => {
            if (error) {
                const errorText = wialon.core.Errors.getErrorText(error);
                console.error(errorText);
                return reject(errorText);
            }
            
            console.log(`Записано в ${path}`);
            resolve();
        });
    });
}
function async_write_end(id, folder, fileName, content) {
    return new Promise((resolve, reject) => {
        const remote = wialon.core.Remote.getInstance();
        const path = '//' + (folder ? folder + '/' : '') + fileName;
        remote.remoteCall('file/write', {itemId: id, storageType: 1, path: path,content: content,  writeType: 1, contentType: 0}, (error) => {
            if (error) {
                const errorText = wialon.core.Errors.getErrorText(error);
                console.error(errorText);
                return reject(errorText);
            }
            
            console.log(`Доаписано в ${path}`);
            resolve();
        });
    });
}
function async_read(id, folder, fileName) {
    return new Promise((resolve, reject) => {
        const remote = wialon.core.Remote.getInstance();
        const path = '//' + (folder ? folder + '/' : '') + fileName;
        remote.remoteCall('file/read', {itemId: id, storageType: 1, path: path, contentType: 0}, (error, data) => {
            if (error) {
                const errorText = wialon.core.Errors.getErrorText(error);
                console.error(errorText);
                return reject(errorText);
            }
           // console.log(`Прочитано ${path}`);
            resolve(data.content);  
        });
    });
}
function async_filelist(id, folder) {
    return new Promise((resolve, reject) => {
        const remote = wialon.core.Remote.getInstance();
        const path = '//' + (folder ? folder : '');
        const params = {itemId: id,storageType: 1,path: path,mask: '*',recursive: 0,fullPath: 0};

        remote.remoteCall('file/list', {itemId: id,storageType: 1,path: path,mask: '*',recursive: 0,fullPath: 0}, (error, data) => {
            if (error) return reject(wialon.core.Errors.getErrorText(error));

             const files = data
                .filter(item => item.s !== undefined)
                .map(item => item.n);
                
            resolve(files);
        });
    });
}
function async_delete(id, folder, fileName) {
    return new Promise((resolve, reject) => {
        const remote = wialon.core.Remote.getInstance();
        const path = '//' + (folder ? folder + '/' : '') + fileName;
        remote.remoteCall('file/rm', {itemId: id, storageType: 1, path: path}, (error) => {
            if (error) {
                const errorText = wialon.core.Errors.getErrorText(error);
                msg("Ошибка удаления: " + errorText);
                return reject(errorText);
            }
            
            msg(`Файл ${fileName} видалено`);
            resolve();
        });
    });
}



//==================================================================================================================
//==================================================================================================================
//==================================================================================================================
//==================================================================================================================


function init() { // Execute after login succeed
  var session = wialon.core.Session.getInstance();
  var flags = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.lastPosition |  wialon.item.Unit.dataFlag.sensors | wialon.item.Unit.dataFlag.lastMessage;
  var res_flags = wialon.item.Item.dataFlag.base | wialon.item.Resource.dataFlag.zones| wialon.item.Resource.dataFlag.zoneGroups | wialon.item.Resource.dataFlag.trailers | wialon.item.Resource.dataFlag.drivers;
  var remote= wialon.core.Remote.getInstance();
  remote.remoteCall('render/set_locale',{"tzOffset":7200,"language":'ru',"formatDate":'%Y-%m-%E %H:%M:%S'});
  wialon.util.Gis.geocodingParams.flags =1490747392;//{flags: "1255211008", city_radius: "10", dist_from_unit: "5", txt_dist: "km from"};
  session.loadLibrary("resourceDrivers");
  session.loadLibrary("resourceTrailers"); 

  session.updateDataFlags( // load items to current session
		[{type: 'type', data: 'avl_resource', flags:res_flags , mode: 0}, // 'avl_resource's specification
		 {type: 'type', data: 'avl_unit', flags: flags, mode: 0}], // 'avl_unit's specification
	function (error) { // updateDataFlags callback       
      if (error) {
      } else {
        initUIData();
      }
    }
  );
}


let allunits = [];
let allunitsdata = [];
let trailers = [];
let drivers = [];

function initUIData() {
var session = wialon.core.Session.getInstance();

  var units = session.getItems('avl_unit');
  units.forEach(function(unit) {
    allunits.push(unit.getName());
    allunitsdata.push(unit);
});

  var resource = wialon.core.Session.getInstance().getItem(601000284); 

  let tra = resource.getTrailers();
  for (const key in tra) {trailers.push(tra[key].n);}
  let dri= resource.getDrivers();
  for (const key in dri) {drivers.push(dri[key].n);}


  naryady_list_update();
}








  setInterval(function() {
   naryady_list_update();
  }, 20000); 

  



$(document).ready(function () {
 initApp();
});

function initApp(){
  const TK = localStorage.getItem('wialon_token');
  const USER = localStorage.getItem('wialon_user');
  const host = "https://1.gpsagro.info";

  if(TK){
  wialon.core.Session.getInstance().initSession("https://hst-api.wialon.eu",null,0x800);
  wialon.core.Session.getInstance().loginToken(TK, "", // try to login
    function (code) { // login callback
      // if error code - print error message
      if (code){
         console.log(wialon.core.Errors.getErrorText(code)); 
         console.log(code); 
         if(code==1 || code==8)login(host);
         return;
         }
                let remotee= wialon.core.Remote.getInstance(); 
                remotee.remoteCall('file/read',{'itemId':ftp_id,'storageType':1,'path':'//'+'TK.txt','contentType':0},function (error,data) {
                if (error) {
                    console.log(wialon.core.Errors.getErrorText(error));
                return;
                }else{
            let token = data.content;
            let sess = wialon.core.Session.getInstance();
            if (sess && sess.getId() && token) {
                sess.logout(function() {
                    wialon.core.Session.getInstance().initSession("https://hst-api.wialon.eu",null,0x800);
                    wialon.core.Session.getInstance().loginToken(token, "", // try to login
                    function (code) { 
                    if (code){
                    console.log(wialon.core.Errors.getErrorText(code)); 
                    console.log(code); 
                    return;
                    }
                    init(); // when login suceed then run init() function
                    }
                );

                });
            } 
        }
        });


    }
  );
  }else{
  login(host);
  }
}

function login(host){
  let currentPath = window.location.pathname;
    if (!currentPath.endsWith('/')) {
        currentPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    }
    let redirect = window.location.origin + currentPath + "post_token.html";
    let encodedRedirect = encodeURIComponent(redirect);
   let url = host+"/login.html?client_id=Palgui_S_MOBILE&access_type=-1&activation_time=0&duration=2592000&flags=0x1&redirect_uri=" + encodedRedirect;
   window.location.href = url;   
}




// 1. СЛОВАРЬ ДАННЫХ: связываем класс инпута с нужным массивом данных
const dataSources = {
    'source-units': typeof allunits !== 'undefined' ? allunits : [], // Для техники
    'source-users': typeof drivers !== 'undefined' ? drivers : [], // Для исполнителей
    'source-status': ['В процессе', 'Выполнено', 'Новый', 'Отменено'] // Можно писать массив прямо тут
};

//class="autocomplete-input source-units"

// Функция скрытия конкретного блока подсказок
function hideSuggestions(box) {
    if (!box) return;
    box.innerHTML = '';
    box.style.display = 'none';
}

// Функция отрисовки подсказок
function renderSuggestions(box, list) {
    if (list.length === 0) {
        hideSuggestions(box);
        return;
    }
    box.innerHTML = list.map(item => 
        `<div class="suggestion-item">${item}</div>`
    ).join('');
    box.style.display = 'block';
}

// Функция для определения, какой массив данных использовать для инпута
function getDatasetForInput(input) {
    // Перебираем ключи из словаря dataSources
    for (const className in dataSources) {
        if (input.classList.contains(className)) {
            return dataSources[className]; // Возвращаем найденный массив
        }
    }
    return []; // Если совпадений нет, возвращаем пустой массив
}

// 2. Отслеживаем ввод текста (только для инпутов со специальным классом 'autocomplete-input')
document.addEventListener('input', function(e) {
    if (!e.target.classList.contains('autocomplete-input')) return;

    const input = e.target;
    const suggestionsBox = input.parentElement.querySelector('.suggestions-top');
    const query = input.value.toLowerCase().trim();
    
    if (query.length < 1) {
        hideSuggestions(suggestionsBox);
        return;
    }

    // Автоматически получаем нужный массив данных на основе класса инпута
    const currentDataset = getDatasetForInput(input);

    // Фильтруем выбранный массив
    const matched = currentDataset
        .filter(name => name.toLowerCase().includes(query))
        .slice(0, 10); 

    renderSuggestions(suggestionsBox, matched);
});

// 3. Клик по подсказке
document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('suggestion-item')) {
        const suggestionItem = e.target;
        const suggestionsBox = suggestionItem.closest('.suggestions-top');
        const input = suggestionsBox.parentElement.querySelector('.autocomplete-input');
        
        input.value = suggestionItem.textContent;
        hideSuggestions(suggestionsBox);

 if (input.classList.contains('source-units')) {
            try {
                // 2. Ждем выполнения промиса
                let lok = await find_item_lokation(suggestionItem.textContent);
                
                // Находим вторую строку таблицы (индекс 1)
                let dataRow = document.querySelectorAll("#mh_naryad tr")[1];
                
                // 3. Исправлено: cells с двумя "l". Индекс 4 — это пятая ячейка (локация)
                dataRow.cells[3].textContent = lok; 
                
            } catch (error) {
                // Если сработал reject("невідомо"), записываем это в ячейку
                let dataRow = document.querySelectorAll("#mh_naryad tr")[1];
                dataRow.cells[3].textContent = error; 
            }
        }

        
        // Вызываем функцию поиска и передаем ей инпут
        if (typeof serch_unit === 'function') {
            serch_unit(input); 
        }
    }
});

// 4. Закрытие подсказок при клике вне зоны поиска
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrapper')) {
        document.querySelectorAll('.suggestions-top').forEach(box => hideSuggestions(box));
    }
});


 $('#bt_mh_naryad').css('background', ' #c4d3fd');
$('#menu > button').click(async function() {

    $('#menu > button').css('background', '');
    $(this).css('background', ' #c4d3fd');


    if (this.id === 'bt_mh_naryad') {
        $('#naryad_div').show();
        $('#dovidnyk_div').hide();
        $('#complate_div').hide();
    }
    if (this.id === 'bt_mh_dovidnuk') {
        $('#naryad_div').hide();
        $('#dovidnyk_div').show();
        $('#complate_div').hide();
    }
    if (this.id === 'bt_mh_remont') {
        $('#naryad_div').hide();
        $('#dovidnyk_div').hide();
        $('#complate_div').show();
        await update_complate();
    }
    if (this.id === 'bt_mh_zamina') {
        $('#naryad_div').hide();
        $('#dovidnyk_div').hide();
        $('#complate_div').hide();
    }
    if (this.id === 'bt_mh_zvit') {
        $('#naryad_div').hide();
        $('#dovidnyk_div').hide();
        $('#complate_div').hide();
    }
});



$('#bt_dv_traktora, #bt_dv_to, #bt_dv_ludi').click(function() {

    $('#bt_dv_traktora, #bt_dv_to, #bt_dv_ludi').css('background', '');
    $(this).css('background', ' #c4d3fd');

        if (this.id === 'bt_dv_traktora') {
        $('#dv_table').empty();
        $('#dv_table').append('<tr><th>ТЗ</th><th>механізатор1</th><th>механізатор2</th><th>серія</th></tr>');
        }
        if (this.id === 'bt_dv_to') {
        $('#dv_table').empty();
        $('#dv_table').append('<tr><th>назва</th><th>запчастини</th><th></th><th></th></tr>');
        }
        if (this.id === 'bt_dv_ludi') {
        $('#dv_table').empty();
        $('#dv_table').append('<tr><th>сервісний інженер</th><th>ID Telegram</th><th></th><th></th></tr>');
        }

    $('#bt_dv_crt').show();
    $('#bt_dv_save').show();
});

$('#bt_dv_crt').click(function() {
 $('#dv_table').append('<tr><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>');
  });


$('#bt_mh_crt').click(function() {
const dataRow = document.querySelectorAll("#mh_naryad tr")[1];

if (dataRow) {
    // 1. Очищаем ячейки с редактируемым текстом (contenteditable)
    const editableCells = dataRow.querySelectorAll('[contenteditable="true"]');
    editableCells.forEach(cell => {
        cell.textContent = ""; // Удаляет текст "--------"
    });

    // 2. Очищаем поля ввода (input) внутри ячеек
    const inputs = dataRow.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.value = ""; // Сбрасывает введенный пользователем текст
    });
}
  });



$("#bt_mh_save").on("click", async function (){
  const fileName = Date.now();

   const table = document.getElementById("mh_naryad");
    const rows = table.querySelectorAll("tr");
    const result = [];

    // Ключи для объекта JSON (соответствуют колонкам)
    const keys = ["naryad", "transport", "to", "location", "customer", "comment"];

    // Цикл со второй строки (индекс 1), так как индекс 0 — это заголовок
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        const rowData = {};

        cells.forEach((cell, index) => {
            const key = keys[index];
            const input = cell.querySelector("input");

            if (input) {
                // Если внутри ячейки есть инпут, берем его значение
                rowData[key] = input.value.trim();
            } else {
                // Иначе берем текстовое содержимое ячейки
                rowData[key] = cell.textContent.trim();
            }
        });
        rowData["status"] = "створено";
        rowData["status_time"] = fileName;
        rowData["t0"] = fileName;
        rowData["t1"] = 0;
        rowData["t2"] = 0;
        rowData["t3"] = 0;
        rowData["t4"] = 0;
        rowData["vik"] = '';
        rowData["vik_id"] = 0;
        rowData["meseg_id"] = 0;

        result.push(rowData);
    }

      if(!result[0].transport){alert("Вкажіть техніку"); return;}



    const content =  JSON.stringify(result, null, 2); // Возвращаем красивый JSON-текст
    try {
        await async_write(ftp_id, 'Servis/new', fileName + '.json', content);
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }
     naryady_list_update();
});

async function naryady_list_update(){
   let data = await async_filelist(ftp_id,'Servis/new');
   let html = "";
   if(data.length>0){
    for (let i = 0; i < data.length; i++) {
        try {
        let naryad = await async_read(ftp_id, 'Servis/new', data[i]);
        naryad = JSON.parse(naryad);
        let date = new Date(Number(data[i].replace(".json", ""))).toLocaleString();
        let date_st = new Date(Number(naryad[0].status_time)).toLocaleString();
        html += "<tr><td>"+date+"</td><td>"+naryad[0].naryad+"</td><td>"+naryad[0].status+"<br>"+date_st+"</td><td>"+naryad[0].vik+"</td><td>"+naryad[0].transport+"</td><td>"+naryad[0].to+"</td><td>"+naryad[0].location+"</td><td>"+naryad[0].customer+"</td><td>"+naryad[0].comment+"</td></tr>";
       } catch (e) {
        console.error("Ошибка сохранения:", e);
       }
       
    }
    $('#mh_naryady tbody').empty();
     $("#mh_naryady  tbody").append(html); 
   }else{
    $('#mh_naryady tbody').empty();
   }
}
let naryadsArray=[];
async function update_complate(){
        try {
        let rawText = await async_read(ftp_id, 'Servis/story', 'complete.txt');
         $('#comolate_naryady tbody').empty();
        if (!rawText || rawText.trim() === "") {
        console.log("Файл истории пуст.");
        return;
        }
         rawText = rawText.trim();
         if (rawText.endsWith(',')) {
            rawText = rawText.slice(0, -1);
            }
        const validJsonArray = `[${rawText}]`;
        naryadsArray = JSON.parse(validJsonArray).reverse();
             try {
                 let rawText2 = await async_read(ftp_id, 'Servis/story', 'provedeno.txt');
                    rawText2 = rawText2.trim();
                    if (rawText2.endsWith(',')) {
                        rawText2 = rawText2.slice(0, -1);
                        }
                    const validJsonArray2 = `[${rawText2}]`;
                    const provedenoArray = JSON.parse(validJsonArray2);
                      const lastStatusMap = {};
                    for (const row of provedenoArray) {
                        if (row && row.naryad !== undefined) {
                            lastStatusMap[String(row.naryad)] = row.chek;
                        }
                    }
                    for (const item of naryadsArray) {
                             const itemKey = String(item.naryad);
                            if (itemKey in lastStatusMap) {
                                item.chek = !!lastStatusMap[itemKey];
                            } else {
                                item.chek = false;
                            }
                    }

                  } catch (e) {
                console.error("Ошибка загрузки проведених:", e);
                   for (const item of naryadsArray) {
                item.chek = false;
            }
            }

        for (const item of naryadsArray) {
             let t0 = new Date(Number(item.t0)).toLocaleString();
             let t1 = new Date(Number(item.t1)).toLocaleString();
             let t2 = new Date(Number(item.t2)).toLocaleString();
             let t3 = new Date(Number(item.t3)).toLocaleString();
             let t4 = new Date(Number(item.t4)).toLocaleString();
             let t5 = formatMilliseconds(item.t4-item.t3);
             let isChecked = item.chek ? 'checked' : '';
             if(isChecked){
                 $("#comolate_naryady tbody").append("<tr style='background-color: #e2fcd5;'><td><input type='checkbox' " + isChecked + "></td><td>"+t0+"</td><td>"+item.naryad+"</td><td>"+t1+"</td><td>"+t2+"</td><td>"+t3+"</td><td>"+t4+"</td><td>"+t5+"</td><td>"+item.vik+"</td><td>"+item.transport+"</td><td>"+item.to+"</td><td>"+item.location+"</td><td>"+item.customer+"</td><td>"+item.comment+"</td></tr>"); 
             }else{
                $("#comolate_naryady tbody").append("<tr><td><input type='checkbox' " + isChecked + "></td><td>"+t0+"</td><td>"+item.naryad+"</td><td>"+t1+"</td><td>"+t2+"</td><td>"+t3+"</td><td>"+t4+"</td><td>"+t5+"</td><td>"+item.vik+"</td><td>"+item.transport+"</td><td>"+item.to+"</td><td>"+item.location+"</td><td>"+item.customer+"</td><td>"+item.comment+"</td></tr>"); 
             }

        }
       } catch (e) {
        console.error("Ошибка загрузки истории:", e);
       }
}

function find_item_lokation(name) {
    // 1. Оборачиваем ВСЮ функцию в Promise, чтобы правильно работать с асинхронным Wialon
    return new Promise((resolve, reject) => {
        let foundUnit = null;

        // 2. Ищем объект в массиве allunits
        for (var i = 0; i < allunitsdata.length; i++) {
            // Исправлено: getNmae() -> getName() [проверьте опечатку в вашем методе!]
            if (allunitsdata[i].getName() === name) { 
                foundUnit = allunitsdata[i];
                break; // Нашли, выходим из цикла
            }
        }

        // Если объект не найден в массиве
        if (!foundUnit) {
            return reject("объект не найден");
        }

        // 3. Получаем позицию и проверяем её корректность
        let unitPos = foundUnit.getPosition();
        if (!unitPos || unitPos.x === 0 || unitPos.y === 0) {
            return reject("невідомо");
        }

        // 4. Запрос к геокодеру Wialon
        wialon.util.Gis.getLocations([{ lat: unitPos.y, lon: unitPos.x }], function(code, data) {
            if (code || !data || data.length === 0) {
                reject("невідомо"); 
            } else {
                let adr = data[0].split(', ');
                let result = adr[adr.length - 1].replace(/[0-9]| km from |\.|\s/g, '');
                resolve(result); // Успешно возвращаем локацию
            }
        });
    });
}

document.querySelector('#comolate_naryady thead').addEventListener('click', function(e) {
    const row = e.target.closest('tr');
    const cell = e.target.closest('td');
    if (!cell || !row) return;
    row.querySelectorAll('td').forEach(td => {
        td.style.backgroundColor ='#dfe7ff'; 
    });
    cell.style.backgroundColor = '#ffdfdf';

     const colIndex = cell.cellIndex;
         const fields = [
        'chek',        // 0: дата створення
        't0',        // 0: дата створення
        'naryad',    // 1: наряд
        't1',        // 2: надіслано
        't2',        // 3: прийнято
        't3',        // 4: розпочато
        't4',        // 5: виконано
        't5',        // 6: робота
        'vik',       // 7: виконавець
        'transport', // 8: транспорт
        'to',        // 9: ТО
        'location',  // 10: локація
        'customer',  // 11: замовник
        'comment'    // 12: коментар
    ];
    const sortField = fields[colIndex];
        // 3. Сортируем массив naryadsArray
    naryadsArray.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

          if (sortField === 'chek') {
            return Number(a.chek ?? 0) - Number(b.chek ?? 0);
        }


        // Если сортируем даты (t0, t1, t2, t3, t4) или числа (naryad), приводим к числам
        if (['t0', 't1', 't2', 't3', 't4','t5', 'naryad'].includes(sortField)) {
            return Number(valB) - Number(valA);
        }

        // Если сортируем обычные строки (текст), используем localeCompare для корректного украинского/русского языка
        valA = valA ? String(valA) : '';
        valB = valB ? String(valB) : '';
        return valA.localeCompare(valB);
    });

         $('#comolate_naryady tbody').empty();
     for (const item of naryadsArray) {
             let t0 = new Date(Number(item.t0)).toLocaleString();
             let t1 = new Date(Number(item.t1)).toLocaleString();
             let t2 = new Date(Number(item.t2)).toLocaleString();
             let t3 = new Date(Number(item.t3)).toLocaleString();
             let t4 = new Date(Number(item.t4)).toLocaleString();
             let t5 = formatMilliseconds(item.t4 -item.t3);
             let isChecked = item.chek ? 'checked' : '';
             if(isChecked){
                 $("#comolate_naryady tbody").append("<tr style='background-color: #e2fcd5;'><td><input type='checkbox' " + isChecked + "></td><td>"+t0+"</td><td>"+item.naryad+"</td><td>"+t1+"</td><td>"+t2+"</td><td>"+t3+"</td><td>"+t4+"</td><td>"+t5+"</td><td>"+item.vik+"</td><td>"+item.transport+"</td><td>"+item.to+"</td><td>"+item.location+"</td><td>"+item.customer+"</td><td>"+item.comment+"</td></tr>"); 
             }else{
                $("#comolate_naryady tbody").append("<tr><td><input type='checkbox' " + isChecked + "></td><td>"+t0+"</td><td>"+item.naryad+"</td><td>"+t1+"</td><td>"+t2+"</td><td>"+t3+"</td><td>"+t4+"</td><td>"+t5+"</td><td>"+item.vik+"</td><td>"+item.transport+"</td><td>"+item.to+"</td><td>"+item.location+"</td><td>"+item.customer+"</td><td>"+item.comment+"</td></tr>"); 
             }
             

        }

    
});


function formatMilliseconds(totalMs) {

  const totalSeconds = Math.floor(totalMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

$(document).on('change', '#comolate_naryady tbody input[type="checkbox"]', async function() {
    const $checkbox = $(this);
    const $row = $checkbox.closest('tr');
    const rowIndex = $row.index();
    const id = $row[0].cells[2].textContent;

    
    try {
        const dataObject = {naryad: id, chek: $checkbox.prop('checked')};
        let content = JSON.stringify(dataObject) + ",\n";
        await async_write_end(ftp_id, 'Servis/story', 'provedeno.txt', content);
        if (naryadsArray[rowIndex])    naryadsArray[rowIndex].chek = $checkbox.prop('checked');
    if ($checkbox.prop('checked')) {
        $row.css('background-color', '#e2fcd5'); // Светло-зеленый цвет
    } else {
        $row.css('background-color', ''); // Возвращаем стандартный цвет
    }
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }


});
