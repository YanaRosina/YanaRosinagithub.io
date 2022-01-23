'use strict';

let dataBaseUrl = 'db.json';
const rowShow = 10; // Колличество отображаемых строк на странице
//Функция для получения данных из json-файла
const getData = async (dataBaseUrl) => { 
    const res = await fetch(dataBaseUrl);

    if (!res.ok) {  //Ловим ошибки в получении данных, если ответ не ok
        throw new Error(`Could not fatch ${dataBaseUrl}, status: ${res.status}`);
    }

    return await res.json();
};

// Класс, который создает строки таблицы
class Person {
    constructor(firstName, lastName, about, eyeColor) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.about = about;
        this.eyeColor = eyeColor;
    }

    newHtmlTableRow() {
        //Создание элементов таблицы
        const tableBody = document.querySelector('.table_body'),
            tableRow = document.createElement('tr'),
            cellFirstName = document.createElement('td'),
            cellLastName = document.createElement('td'),
            cellAbout = document.createElement('td'),
            cellEyeColor = document.createElement('td'),
            cellEdits = document.createElement('td'),
            editDiv = document.createElement('div');

        //Присваиваем классы и передаем значения в текст ячейки
        cellFirstName.innerHTML = this.firstName;
        cellFirstName.classList = 'cell_first_name';
        cellLastName.innerHTML = this.lastName;
        cellLastName.classList = 'cell_last_name';
        cellAbout.innerHTML = this.about;
        cellAbout.classList = 'module';
        cellEyeColor.innerHTML = this.eyeColor;
        cellEyeColor.classList = 'cell_eye_color';
        editDiv.classList = 'editing_div';
        editDiv.innerHTML = '<i class="far fa-edit"></i>';
        cellEdits.classList = 'cell_edits';

        tableRow.classList = 'row';

        //Формируем строку, присваивая ей ячейки
        tableRow.appendChild(cellFirstName);
        tableRow.appendChild(cellLastName);
        tableRow.appendChild(cellAbout);
        tableRow.appendChild(cellEyeColor);
        cellEdits.appendChild(editDiv);
        tableRow.appendChild(cellEdits);
        //Присваиваем строку таблице
        tableBody.appendChild(tableRow);

    }

}
// Вывод таблицы на экран, передача данных из файла json для заполнения таблицы
getData(dataBaseUrl)
    .then(data => {
        data.forEach((obj) => {
            //Создание нового экземляра класса Person
            new Person(obj.name.firstName, obj.name.lastName, obj.about, obj.eyeColor).newHtmlTableRow();   
        });
    EyeColor(); // Выводим цвет глаз в виде цвета
    CutTable(rowShow);  // Обрезаем таблицу на необходимое колличество строк
    });


// Table Sort
//Сортировка столбцов таблицы
const getSort = ({
    target
}) => {
    const order = (target.dataset.order = -(target.dataset.order || -1));
    const index = [...target.parentNode.cells].indexOf(target);
    const collator = new Intl.Collator(['en', 'ru']); //языкозависимый сортировщик
    //Создаем объект для сортировки, записывая индексы объектов
    const comparator = (index, order) => (a, b) => order * collator.compare( 
        a.children[index].innerHTML,
        b.children[index].innerHTML
    );

    for (const tBody of target.closest('table').tBodies)
        tBody.append(...[...tBody.rows].sort(comparator(index, order))); // Применяем .sort

    for (const cell of target.parentNode.cells)
        cell.classList.toggle('sorted', cell === target);
};

//Сортируем нашу таблицу
document.querySelectorAll('.table_sort thead').forEach(tableTH =>
    tableTH.addEventListener('click', (event) => getSort(event))); 


//Modal
//Модальное окно, которое появится при щелчке на div справа от строки
function OpenModalBlock(modalSelector) {   //Функция для показа модального окна
    const modalWindow = document.querySelector(modalSelector);
    modalWindow.classList.add('show');
    modalWindow.classList.remove('hide');
}

function CloseModalBlock(modalSelector) { // Функция для скрытия модального окна
    const modalWindow = document.querySelector(modalSelector);
    modalWindow.classList.add('hide');
    modalWindow.classList.remove('show');
    RemoveActiveClass('.row'); // Убираем класс активности

}

function RemoveActiveClass(arr) { // Функция, которая убирает класс активности со строки
    const arrObj = document.querySelectorAll(arr);
    arrObj.forEach((row) => {
        row.classList.remove('active');

    });
}


//Обрабатываем событие клика на div для показа модального окна
const table = document.querySelector('.table_sort'),
    modalClose = document.querySelector('.modal_close'); // Крестик в модальном окне

table.addEventListener('click', (event) => { //Используем делегирование событий, ставим событие на всю таблицу
    //Отлавливаем событие на классе editing_div и far fa-edit( это иконка, лежащая в div)
    if (event.target.className === 'editing_div' || event.target.className === 'far fa-edit') { 
        OpenModalBlock('.modal_block'); // Открываем модальное окно
        event.target.closest('.row').classList.add('active'); // Присваиваем класс активности строке, которую будем редактировать

    }
});
 //Закрываем модальное окно при нажатии на крестик
modalClose.addEventListener('click', () => {
    CloseModalBlock('.modal_block');

});



//Form Submit
//Собираем данные из формы модального окна
function getFormData(event) {

    event.preventDefault(); // Отменяем стандарное поведение ( что бы не было перезагрузки страницы)
    const formFirstName = form.querySelector('[name="first_name"]'),
        formLastName = form.querySelector('[name="last_name"]'),
        formAbout = form.querySelector('[name="about"]'),
        formEyeColor = form.querySelector('[name="eye_color"]');

    //Формируем объект для передачи данных с формы
    const data = {
        name: formFirstName.value,
        surName: formLastName.value,
        about: formAbout.value,
        eyeColor: formEyeColor.value
    }
    recordDataToTable(data); //Записываем данные из объекта в таблицу
    CloseModalBlock('.modal_block'); // Закрываем  модальное окно

};

form = document.getElementById('form');
form.addEventListener('submit', getFormData); // Обрабатываем отправку формы, передавая функцию getFormData


//RecordDataToTable
//Записываем данные из объекта, которые собрали с формы в таблицу
function recordDataToTable(obj) {
    const arr = document.querySelectorAll('.row');
    //Ищем строку с классом активности и записываем в нее новые данные
    arr.forEach((item) => {
        if (item.classList.contains('active')) {
            const recordName = item.querySelector('.cell_first_name'),
                recordSurname = item.querySelector('.cell_last_name'),
                recordAbout = item.querySelector('.module'),
                recordEyeColor = item.querySelector('.cell_eye_color');
            recordName.innerHTML = obj.name;
            console.log(recordName);
            recordSurname.innerHTML = obj.surName;
            recordAbout.innerHTML = obj.about;
            recordEyeColor.innerHTML = obj.eyeColor;
            EyeColor(); // Выводим цвет глаз в необходимом формате
        }
    });
}

//Eye Color
//Выводим цвет глаз как цвет ячейки
function EyeColor() {
    const arrEyeColors = document.querySelectorAll('.cell_eye_color');
    arrEyeColors.forEach((el) => {
        //Читаем, текст записанный в ячейке и обрабатываем его кострукцией switch - case
        switch (el.innerHTML) {
            case 'blue':
                el.style.backgroundColor = 'blue'; // Заливаем ячейку элемента необходимым цветом
                el.style.color = 'blue'; // Меняем цвет текста на такой же цвет
                break;
            case 'brown':
                el.style.backgroundColor = 'rgb(165, 61, 42)';
                el.style.color = 'rgb(165, 61, 42)';
                break;
            case 'red':
                el.style.backgroundColor = 'red';
                el.style.color = 'red';
                break;
            case 'green':
                el.style.backgroundColor = 'green';
                el.style.color = 'green';
                break;
            default:
                console.log('Error!'); // Обрабатываем ошибки
        }

    });
}

//Hide Collumns
//Скритие ячеек ( данная задача выволнена не полностью, ячейки после скрытия и повторного отображения 
// не кореектно отображаются на экане)
const hideButtons = document.querySelector('.buttons_hide'); //Div, где находятся кнопки скрытия/показа

//Функция для скрытия ячеек
function hideCollumn(button, cellClass, headId) { // В функцию передается кнопка собития, класс столбца и id заголовка столбца
    const cellArr = document.querySelectorAll(`.${cellClass}`); 

    document.getElementById(headId).style.display = "none"; // Скрываем заголовок столбца
    button.classList.add('active_button'); //Присваиваем кнопке скрытия класс активности
    cellArr.forEach((el) => { // Проходимся по всему столбцу и скрываем ячейки
        el.style.display = 'none'; //Блокируем показ ячейки
    });

}

//Функция для показа ячеек
function showCollumn(button, cellClass, headId) { //Передаются те же параметры, что и в hideCollumn()
    const cellArr = document.querySelectorAll(`.${cellClass}`);

    document.getElementById(headId).style.display = "block"; // отображаем заголовок
    button.classList.remove('active_button'); // убираем класс активности с кнопки
    cellArr.forEach((el) => {
        if (cellClass == 'module') { //Для корректного отображения описания обрабатываем случай с ним отдельно
            el.style.display = "-webkit-box";

        } else { // Включаем отображение ячеек для остальных столбцов
            el.style.display = "block";
        }
    });
}
//Обработка события при нажатии кнопки "скрыты/показать столбец"
hideButtons.addEventListener('click', (event) => { // Вешаем обработчик на div с кнопками, используем делегирование

    switch (event.target.id) { // Отлавливаем id кнопки и в зависмоси от него скрываем/показываем тот или иной столбец
        case ('first_name'):
            if (event.target.className == 'active_button') {
                showCollumn(event.target, 'cell_first_name', 'first_name_head'); // Показываем столбец
                event.target.innerHTML = 'Скрыть имя'; // Меняем текст кнопки
            } else {
                hideCollumn(event.target, 'cell_first_name', 'first_name_head'); //Скрываем столбец
                event.target.innerHTML = 'Показать имя';
            }
            break;

        case ('last_name'):
            if (event.target.className == 'active_button') {
                showCollumn(event.target, 'cell_last_name', 'last_name_head');
                event.target.innerHTML = 'Скрыть фамилию';
            } else {
                hideCollumn(event.target, 'cell_last_name', 'last_name_head');
                event.target.innerHTML = 'Показать фамилию';
            }
            break;

        case ('about'):
            if (event.target.className == 'active_button') {
                showCollumn(event.target, 'module', 'about_head');
                event.target.innerHTML = 'Скрыть описание';
            } else {
                hideCollumn(event.target, 'module', 'about_head');
                event.target.innerHTML = 'Показать описание';
            }
            break;

        case ('eye_color'):
            if (event.target.className == 'active_button') {
                showCollumn(event.target, 'cell_eye_color', 'eye_color_head');
                event.target.innerHTML = 'Скрыть цвет глаз';
            } else {
                hideCollumn(event.target, 'cell_eye_color', 'eye_color_head');
                event.target.innerHTML = 'Показать цвет глаз';
            }
            break;

        default:
            console.log('Hide/Show Error');
    }
});

// Pagination
//Пагинация таблицы
const  divPagination = document.querySelector('.pagination_button'); // div с кнопками пагинации
//Изначальная обрезка таблицы на заданное колличество строк
function CutTable(rowShow) { 
    const rows = document.querySelectorAll('.row');
    let i = 0;

    rows.forEach((row)=> { // Скрываем все ячейки после 10(заданое колличество)
        i++;
        if(i>rowShow) {
            row.classList.add('hide');
        }
    });
    addButton(i); // Создаем необходимое колличество кнопок пагинации

};
//Выводим необходимую страницу пагинации
function showPage (count) { //Передаем в функцию id кнопки ( он же и ее порядковый номер)
    const rows = document.querySelectorAll('.row'),  
        upperRow = rowShow*((+count)-1), // определяем номер первой отображаемой стоки
        endRow = upperRow+rowShow; // Определяем номер последней отображаемой строки
    let i = 0;
    rows.forEach((row)=> { // Перебираем строки и скрываем все меньше первой отображаемой и больше последней
        console.log(i, upperRow, endRow);
        if((i <= (upperRow-1)) || (i >= endRow)) {
            row.classList.add('hide');
        } else {
            row.classList.remove('hide'); // Убираем класс скрытия с необходимых для отображения ячеек
        }
        i++;
    });


}
 // Создаем кнопки пагинации
function addButton(count) { 
    let numberOfButtons = Math.ceil(count/rowShow); //Делим колличество всех строк на кол-во отображаемых и округляем до ближайшего целого

    for(let i = 1; i<=numberOfButtons; i++ ) { //Создаем необходимое кол-во кнопок
        const paginationButton = document.createElement('button'); // Создаем кнопку
        paginationButton.innerHTML = i; // отображаем ее номер
        paginationButton.id = i; // Присваиваем id как номер
        paginationButton.classList = 'pagination'; // присваиваем общий для всех кнопок пагинации класс
        divPagination.appendChild(paginationButton); //Добавляем кнопки в div
    }
};
// Обрабатываем событие на кнопках переключения страниц пагинации
divPagination.addEventListener('click',(event) => { // Используем делигирование на общий для данных кнопок div
    if(event.target.className == 'pagination') { //Отлавливаем кнопки по классу
        const count = event.target.id; // получаем id кнопки
        showPage(count); //Запускаем функцию отображения ячеек и передаем ей номер кнопки
    }
    const pagButtons = document.querySelectorAll('.pagination'); //Выделяем цветом ту страницу, которая сейчас открыта
    pagButtons.forEach((button) => {
        if(button.id == event.target.id) {
            button.style.color = 'red';
        } else {
            button.style.color = 'black';
        }
    });
})



