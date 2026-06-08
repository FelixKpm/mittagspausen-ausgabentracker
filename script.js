
const now = new Date();
const month = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
let today = new Date().toISOString().split('T')[0];


document.getElementById("month-h2").innerHTML = month;
document.getElementById("date").value = today;

const _form = document.getElementById('expense-form');
const _description = document.getElementById('description');
const _total = document.getElementById('total');
const _category = document.getElementById('category');
const _date = document.getElementById('date');
const _addBtn = document.getElementById('add-expense');
const _entryContainer = document.getElementById('entryList-container')
const STORAGE_KEY = 'items';
let editingId = null;
let items = [];

_addBtn.addEventListener('click', () => {
    
    
    if (editingId === null) {
        const object = { 
            id: Date.now(),
            title: _description.value.trim(),
            total: parseFloat(_total.value.replace(',', '.')),
            category: _category.value,
            date: _date.value,
            createdAt: new Date().toISOString(),
        };
        items.push(object);
    } else {
        const eintrag = items.find(item => item.id === editingId);
        eintrag.title = _description.value.trim();
        eintrag.total = parseFloat(_total.value.replace(',', '.'));
        eintrag.category = _category.value;
        eintrag.date = _date.value;
        editingId = null;
        _addBtn.textContent = 'Hinzufügen';
        document.getElementById('form-header').textContent = "Neue Ausgabe";
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    buildEntries();
    updateStats();
    _description.value = '';
    _total.value = '';
    _category.value = '';
    _date.value = today;
    _addBtn.disabled = true;
});

function checkForm() {

    const isValid = _description.value.trim() && _total.value.trim() && _category.value && _date.value 

    _addBtn.disabled = !isValid;

}
 

_description.addEventListener('input', checkForm);
_total.addEventListener('input', checkForm);
_category.addEventListener('change', checkForm);
_date.addEventListener('change', checkForm);
_total.addEventListener('change', checkForm);
const _sortSelect = document.getElementById('sort-select');
let currentSort = _sortSelect.value;
 
_sortSelect.addEventListener('change', () => {
    currentSort = _sortSelect.value;
    buildEntries();
 });

function buildEntries () {
    _entryContainer.innerHTML = '';
    
    let sortedItems = [...items];
        switch (currentSort) {
            case 'date-new':
                sortedItems.sort((a, b) => new Date (b.date) - new Date(a.date));
                break;
            case 'date-old':
                sortedItems.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'total-high':
                sortedItems.sort((a, b) => b.total - a.total);
                break;
            case 'total-low':
                sortedItems.sort((a, b) => a.total - b.total);
                break;
            default:
                sortedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    
        sortedItems.forEach(element => {
            let iconPath;
            console.log(element.category);   
            switch (element.category) {
                case 'edeka':
                    iconPath = './media/edeka.png';
                    break;
                case 'mcdonalds':
                    iconPath = './media/mcdonald-s.svg';
                    break;
                case 'trinkgut':
                    iconPath = './media/trinkgut.png';
                    break;
                case 'other':
                    iconPath = './media/restaurant_icon.png';
                    break;
            }
            
                const entry = document.createElement('div');
                entry.className = 'entries';
                entry.innerHTML = `
                    <img class="icons" src="${iconPath}">
                    <div class="entry-info">
                        <p class="entry-name">${element.title}</p>
                        <p class="entry-meta">${element.date.split('-').reverse().join('.')} - ${element.category.toUpperCase()}</p>
                    </div>
                    <div class="entry-actions">
                        <p class="entry-price">${element.total.toFixed(2).replace('.', ',')}€</p>
                        <button id="edit-${element.id}" class="edit-button"><img class="action-icons" src="./media/edit_icon.png"></button>
                        <button id="delete-${element.id}" class="delete-button"><img class="action-icons" src="./media/delete_icon.png"></button>
                    </div>
                        `;
                    _entryContainer.appendChild(entry);
                    console.log('Hier ist was!');
                    
                    document.getElementById(`delete-${element.id}`).addEventListener('click', () => {
                        items = items.filter(item => item.id !== element.id);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
                        buildEntries();
                        updateStats();
                        if (editingId === element.id) {
                            let header = document.getElementById('form-header').textContent = "Neue Ausgabe";

                            editingId = null;
                            _addBtn.textContent = 'Hinzufügen';
                            _description.value = '';
                            _total.value = '';
                            _category.value = '';
                            _date.value = today;
                            _addBtn.disabled = true;
                        }
                    });

                    document.getElementById(`edit-${element.id}`).addEventListener('click', () => {
                        let header = document.getElementById('form-header').textContent = "Eintrag bearbeiten";
                        editingId = element.id;
                        _description.value = element.title;
                        _total.value = element.total;
                        _category.value = element.category;
                        _date.value = element.date;
                        _addBtn.textContent = "Änderung speichern";
                    })

                    });
            
        
        

};

//Diese Funktion ist KI generiert.
function updateStats () {
    const now = new Date();

    console.log(now);
    
    let weeklySpend = 0;
    let monthlySpend = 0;
    
    const monday = new Date();
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    console.log(monday);
    
    items.forEach(item => {
        const itemDate = new Date(item.date);
        
        // Monat
        if (itemDate.getMonth() === now.getMonth() && 
            itemDate.getFullYear() === now.getFullYear()) {
            monthlySpend += item.total;
        }
        
        // Woche
        if (itemDate >= monday && itemDate <= now) {
            weeklySpend += item.total;
        }
    });
    
    const monthlyEntries = items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === now.getMonth() && 
               itemDate.getFullYear() === now.getFullYear();
    });
    
    const avgSpend = monthlyEntries.length > 0 
        ? monthlySpend / monthlyEntries.length 
        : 0;
    
    // Kacheln befüllen
    document.getElementById('weekly-th').innerHTML = `Diese Woche<br>${weeklySpend.toFixed(2)}€`;
    document.getElementById('monthly-th').innerHTML = `Dieser Monat<br>${monthlySpend.toFixed(2)}€`;
    document.getElementById('average-th').innerHTML = `Ø Pro Tag (Dieser Monat)<br>${avgSpend.toFixed(2)}€`;
    console.log("Stats geupdated!");
    console.log('Heute:', now);
    console.log('Montag:', monday);
    console.log('Items:', items);
}

document.addEventListener('DOMContentLoaded', () => {
    items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    buildEntries();
    updateStats();
});