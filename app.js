// Aplicação PWA - Agenda Inteligente Cérebro Zinco

// Verificar se há suporte para service workers e registrar
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar ServiceWorker:', error);
            });
    });
}

// Dados iniciais da aplicação
let appData = {
    tasks: [
        { id: 1, title: 'Finalizar relatório mensal', description: 'Completar o relatório financeiro do mês passado', dueDate: '2023-06-15', priority: 'high', category: 'work', completed: false },
        { id: 2, title: 'Comprar mantimentos', description: 'Ir ao supermercado para comprar alimentos da semana', dueDate: '2023-06-12', priority: 'medium', category: 'personal', completed: false },
        { id: 3, title: 'Estudar para prova de matemática', description: 'Revisar capítulos 5 e 6 do livro', dueDate: '2023-06-20', priority: 'high', category: 'study', completed: true },
        { id: 4, title: 'Agendar consulta médica', description: 'Ligar para o consultório do Dr. Silva', dueDate: '2023-06-10', priority: 'medium', category: 'health', completed: false },
        { id: 5, title: 'Pagar conta de luz', description: 'Vencimento dia 15', dueDate: '2023-06-15', priority: 'high', category: 'personal', completed: false }
    ],
    events: [
        { id: 1, title: 'Reunião de equipe', date: '2023-06-10', time: '10:00', description: 'Reunião semanal com a equipe de desenvolvimento' },
        { id: 2, title: 'Consulta dentista', date: '2023-06-12', time: '14:30', description: 'Check-up dentário semestral' },
        { id: 3, title: 'Aniversário da mãe', date: '2023-06-15', time: '19:00', description: 'Jantar de aniversário' },
        { id: 4, title: 'Apresentação do projeto', date: '2023-06-18', time: '09:00', description: 'Apresentar o novo projeto para os stakeholders' }
    ],
    transactions: [
        { id: 1, date: '2023-06-01', description: 'Salário', category: 'Receita', amount: 3500.00, type: 'income' },
        { id: 2, date: '2023-06-05', description: 'Aluguel', category: 'Moradia', amount: 1200.00, type: 'expense' },
        { id: 3, date: '2023-06-07', description: 'Supermercado', category: 'Alimentação', amount: 450.00, type: 'expense' },
        { id: 4, date: '2023-06-10', description: 'Freelance', category: 'Receita', amount: 700.00, type: 'income' },
        { id: 5, date: '2023-06-12', description: 'Transporte', category: 'Transporte', amount: 100.00, type: 'expense' }
    ],
    notes: [
        { id: 1, title: 'Ideias para o projeto', content: 'Desenvolver um sistema de gamificação para aumentar a produtividade da equipe.', date: '2023-06-01', category: 'work' },
        { id: 2, title: 'Lista de livros para ler', content: '1. Hábitos Atômicos\n2. A Coragem de Ser Imperfeito\n3. Mindset', date: '2023-06-03', category: 'personal' },
        { id: 3, title: 'Metas para o próximo trimestre', content: '1. Aprender React Native\n2. Economizar R$ 2.000,00\n3. Fazer curso de inglês', date: '2023-06-05', category: 'study' }
    ],
    memory: {
        recurring: [
            { id: 1, title: 'Pagar condomínio', frequency: 'monthly', day: 10, description: 'Vencimento todo dia 10' },
            { id: 2, title: 'Reunião de equipe', frequency: 'weekly', day: 'monday', description: 'Toda segunda-feira às 10h' },
            { id: 3, title: 'Academia', frequency: 'daily', description: 'Todos os dias às 19h' }
        ],
        important: [
            { id: 1, title: 'Senha do email', value: '********', description: 'Email principal' },
            { id: 2, title: 'Número do médico', value: '(11) 99999-9999', description: 'Dr. Carlos Silva' },
            { id: 3, title: 'Placa do carro', value: 'ABC-1234', description: 'Carro modelo 2020' }
        ]
    },
    settings: {
        theme: 'light',
        notifications: true
    }
};

// Elementos DOM principais
const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('.nav-btn');
const themeToggle = document.getElementById('themeToggle');
const todayDateElement = document.getElementById('todayDate');
const priorityTasksList = document.getElementById('priorityTasksList');
const tasksList = document.getElementById('tasksList');
const calendarDays = document.getElementById('calendarDays');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const calendarEventsList = document.getElementById('calendarEventsList');
const cashbookTableBody = document.getElementById('cashbookTableBody');
const notesList = document.getElementById('notesList');
const noteEditor = document.getElementById('noteEditor');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteDate = document.getElementById('noteDate');
const noteChars = document.getElementById('noteChars');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const closeEditorBtn = document.getElementById('closeEditorBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const newTaskBtn = document.getElementById('newTaskBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const generateReportButtons = document.querySelectorAll('.generate-report');
const reportPreview = document.getElementById('reportPreview');
const previewContent = document.getElementById('previewContent');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const closePreviewBtn = document.getElementById('closePreviewBtn');
const installBtn = document.getElementById('installBtn');

// Variáveis globais
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let currentFilter = 'all';
let currentNoteId = null;
let deferredPrompt;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // Carregar dados do localStorage se disponível
    loadFromLocalStorage();
    
    // Atualizar dados iniciais na interface
    updateDashboard();
    updateTasksList();
    generateCalendar(currentMonth, currentYear);
    updateCalendarEvents(currentDate);
    updateCashbookTable();
    updateNotesList();
    updateMemoryContent();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Verificar atualizações a cada 30 segundos
    setInterval(checkForUpdates, 30000);
});

// Inicializar a aplicação
function initApp() {
    // Definir data de hoje
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todayDateElement.textContent = today.toLocaleDateString('pt-BR', options);
    
    // Verificar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Verificar se é PWA instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Executando como PWA instalado');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegação entre seções
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
            
            // Atualizar estado ativo dos botões de navegação
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Alternar tema
    themeToggle.addEventListener('click', toggleTheme);
    
    // Navegação do calendário
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });
    
    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });
    
    // Filtros de tarefas
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            updateTasksList();
        });
    });
    
    // Botão de nova tarefa
    newTaskBtn.addEventListener('click', () => {
        taskForm.reset();
        taskModal.classList.remove('hidden');
    });
    
    addTaskBtn.addEventListener('click', () => {
        taskForm.reset();
        taskModal.classList.remove('hidden');
        showSection('tasks');
    });
    
    // Fechar modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            taskModal.classList.add('hidden');
        });
    });
    
    // Salvar tarefa
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
        taskModal.classList.add('hidden');
    });
    
    // Notas
    newNoteBtn.addEventListener('click', () => {
        openNoteEditor(null);
    });
    
    saveNoteBtn.addEventListener('click', saveNote);
    deleteNoteBtn.addEventListener('click', deleteNote);
    closeEditorBtn.addEventListener('click', closeNoteEditor);
    
    noteContent.addEventListener('input', () => {
        noteChars.textContent = `${noteContent.value.length} caracteres`;
    });
    
    // Relatórios
    generateReportButtons.forEach(button => {
        button.addEventListener('click', () => {
            const reportType = button.getAttribute('data-report');
            generateReportPreview(reportType);
        });
    });
    
    closePreviewBtn.addEventListener('click', () => {
        reportPreview.classList.add('hidden');
    });
    
    downloadPdfBtn.addEventListener('click', downloadPdfReport);
    
    // Instalar PWA
    installBtn.addEventListener('click', installPWA);
    
    // Evento beforeinstallprompt para PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });
}

// Mostrar seção específica
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
}

// Alternar tema claro/escuro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Atualizar ícone do tema
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Atualizar dashboard
function updateDashboard() {
    // Atualizar tarefas prioritárias
    const priorityTasks = appData.tasks
        .filter(task => task.priority === 'high' && !task.completed)
        .slice(0, 3);
    
    priorityTasksList.innerHTML = '';
    priorityTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" data-id="${task.id}">
            <span class="task-text">${task.title}</span>
            <span class="task-priority priority-high">Alta</span>
        `;
        priorityTasksList.appendChild(li);
    });
    
    // Adicionar event listeners para checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            toggleTaskCompletion(taskId);
        });
    });
}

// Atualizar lista de tarefas
function updateTasksList() {
    tasksList.innerHTML = '';
    
    let filteredTasks = appData.tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = filteredTasks.filter(task => task.priority === 'high');
    }
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-state">Nenhuma tarefa encontrada.</p>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-due">Vence em: ${formatDate(task.dueDate)}</div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-task" data-id="${task.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-task" data-id="${task.id}" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
    });
    
    // Adicionar event listeners para as ações das tarefas
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            toggleTaskCompletion(taskId);
        });
    });
    
    document.querySelectorAll('.edit-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            editTask(taskId);
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            deleteTask(taskId);
        });
    });
}

// Salvar tarefa
function saveTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const category = document.getElementById('taskCategory').value;
    
    const newTask = {
        id: appData.tasks.length > 0 ? Math.max(...appData.tasks.map(t => t.id)) + 1 : 1,
        title,
        description,
        dueDate,
        priority,
        category,
        completed: false
    };
    
    appData.tasks.push(newTask);
    updateTasksList();
    updateDashboard();
    saveToLocalStorage();
    
    // Mostrar notificação
    showNotification('Tarefa adicionada com sucesso!', 'success');
}

// Editar tarefa
function editTask(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskCategory').value = task.category;
    
    taskModal.classList.remove('hidden');
    
    // Modificar o formulário para edição
    const form = document.getElementById('taskForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Atualizar Tarefa';
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        task.title = document.getElementById('taskTitle').value;
        task.description = document.getElementById('taskDescription').value;
        task.dueDate = document.getElementById('taskDueDate').value;
        task.priority = document.getElementById('taskPriority').value;
        task.category = document.getElementById('taskCategory').value;
        
        updateTasksList();
        updateDashboard();
        saveToLocalStorage();
        taskModal.classList.add('hidden');
        
        showNotification('Tarefa atualizada com sucesso!', 'success');
        
        // Restaurar formulário para adição
        submitBtn.textContent = 'Salvar Tarefa';
        form.onsubmit = function(e) {
            e.preventDefault();
            saveTask();
        };
    };
}

// Excluir tarefa
function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        appData.tasks = appData.tasks.filter(task => task.id !== taskId);
        updateTasksList();
        updateDashboard();
        saveToLocalStorage();
        showNotification('Tarefa excluída com sucesso!', 'success');
    }
}

// Alternar conclusão da tarefa
function toggleTaskCompletion(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        updateTasksList();
        updateDashboard();
        saveToLocalStorage();
        
        const message = task.completed ? 'Tarefa marcada como concluída!' : 'Tarefa marcada como pendente!';
        showNotification(message, 'success');
    }
}

// Gerar calendário
function generateCalendar(month, year) {
    calendarDays.innerHTML = '';
    
    // Atualizar título do mês
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    // Dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, ...)
    const firstDayIndex = firstDay.getDay();
    // Dia da semana do último dia
    const lastDayIndex = lastDay.getDay();
    // Número de dias no mês
    const daysInMonth = lastDay.getDate();
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevMonthLastDay - i;
        calendarDays.appendChild(day);
    }
    
    // Dias do mês atual
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        day.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
        
        // Marcar se é hoje
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            day.classList.add('today');
        }
        
        // Verificar se há eventos neste dia
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = appData.events.some(event => event.date === dateStr);
        if (hasEvent) {
            day.classList.add('has-event');
        }
        
        // Adicionar event listener para selecionar o dia
        day.addEventListener('click', function() {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            
            const selectedDate = new Date(year, month, i);
            updateCalendarEvents(selectedDate);
        });
        
        calendarDays.appendChild(day);
    }
    
    // Dias do próximo mês
    const daysNextMonth = 42 - (firstDayIndex + daysInMonth); // 6 semanas * 7 dias = 42
    for (let i = 1; i <= daysNextMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
    
    // Selecionar o dia atual
    if (month === today.getMonth() && year === today.getFullYear()) {
        const todayElement = document.querySelector(`.calendar-day.today`);
        if (todayElement) {
            todayElement.click();
        }
    }
}

// Atualizar eventos do calendário
function updateCalendarEvents(date) {
    const dateStr = date.toISOString().split('T')[0];
    const events = appData.events.filter(event => event.date === dateStr);
    
    calendarEventsList.innerHTML = '';
    
    if (events.length === 0) {
        calendarEventsList.innerHTML = '<p class="empty-state">Nenhum evento para este dia.</p>';
        return;
    }
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
            <div class="event-info">
                <h4>${event.title}</h4>
                <div class="event-time">${event.time}</div>
            </div>
            <div class="event-actions">
                <button class="icon-btn edit-event" data-id="${event.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn delete-event" data-id="${event.id}" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        calendarEventsList.appendChild(eventElement);
    });
    
    // Adicionar event listeners para ações dos eventos
    document.querySelectorAll('.edit-event').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            editEvent(eventId);
        });
    });
    
    document.querySelectorAll('.delete-event').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            deleteEvent(eventId);
        });
    });
}

// Atualizar tabela do livro caixa
function updateCashbookTable() {
    cashbookTableBody.innerHTML = '';
    
    appData.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = transaction.type === 'income' ? 'income-row' : 'expense-row';
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="transaction-value">${transaction.type === 'income' ? '+' : '-'} R$ ${transaction.amount.toFixed(2).replace('.', ',')}</td>
            <td>
                <button class="icon-btn edit-transaction" data-id="${transaction.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn delete-transaction" data-id="${transaction.id}" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        cashbookTableBody.appendChild(row);
    });
    
    // Atualizar totais
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Atualizar resumo
    document.querySelector('.balance').textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
    document.querySelector('.income').textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`;
    document.querySelector('.expense').textContent = `R$ ${totalExpense.toFixed(2).replace('.', ',')}`;
    
    // Adicionar event listeners para ações das transações
    document.querySelectorAll('.edit-transaction').forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = parseInt(this.getAttribute('data-id'));
            editTransaction(transactionId);
        });
    });
    
    document.querySelectorAll('.delete-transaction').forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = parseInt(this.getAttribute('data-id'));
            deleteTransaction(transactionId);
        });
    });
}

// Atualizar lista de anotações
function updateNotesList() {
    notesList.innerHTML = '';
    
    appData.notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.setAttribute('data-id', note.id);
        
        // Limitar conteúdo para visualização
        const previewContent = note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content;
        
        noteElement.innerHTML = `
            <h4>${note.title}</h4>
            <div class="note-preview">${previewContent}</div>
            <div class="note-date">${formatDate(note.date)}</div>
        `;
        
        noteElement.addEventListener('click', () => {
            openNoteEditor(note.id);
        });
        
        notesList.appendChild(noteElement);
    });
}

// Abrir editor de anotações
function openNoteEditor(noteId) {
    noteEditor.classList.remove('hidden');
    document.querySelector('.notes-list').classList.add('hidden');
    
    if (noteId) {
        // Editar anotação existente
        const note = appData.notes.find(n => n.id === noteId);
        if (note) {
            currentNoteId = noteId;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            noteDate.textContent = `Última edição: ${formatDate(note.date)}`;
            noteChars.textContent = `${note.content.length} caracteres`;
        }
    } else {
        // Nova anotação
        currentNoteId = null;
        noteTitle.value = '';
        noteContent.value = '';
        noteDate.textContent = `Nova anotação`;
        noteChars.textContent = '0 caracteres';
    }
}

// Fechar editor de anotações
function closeNoteEditor() {
    noteEditor.classList.add('hidden');
    document.querySelector('.notes-list').classList.remove('hidden');
    currentNoteId = null;
}

// Salvar anotação
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title || !content) {
        showNotification('Título e conteúdo são obrigatórios!', 'error');
        return;
    }
    
    const now = new Date().toISOString().split('T')[0];
    
    if (currentNoteId) {
        // Atualizar anotação existente
        const note = appData.notes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.date = now;
        }
    } else {
        // Criar nova anotação
        const newNote = {
            id: appData.notes.length > 0 ? Math.max(...appData.notes.map(n => n.id)) + 1 : 1,
            title,
            content,
            date: now,
            category: 'personal'
        };
        appData.notes.push(newNote);
    }
    
    updateNotesList();
    saveToLocalStorage();
    closeNoteEditor();
    showNotification('Anotação salva com sucesso!', 'success');
}

// Excluir anotação
function deleteNote() {
    if (!currentNoteId) return;
    
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
        appData.notes = appData.notes.filter(note => note.id !== currentNoteId);
        updateNotesList();
        saveToLocalStorage();
        closeNoteEditor();
        showNotification('Anotação excluída com sucesso!', 'success');
    }
}

// Atualizar conteúdo da memória
function updateMemoryContent() {
    // Compromissos recorrentes
    const recurringList = document.getElementById('recurringList');
    recurringList.innerHTML = '';
    
    appData.memory.recurring.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'recurring-item';
        itemElement.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div>
                <span class="frequency">${getFrequencyText(item.frequency, item.day)}</span>
            </div>
        `;
        recurringList.appendChild(itemElement);
    });
    
    // Informações importantes
    const importantList = document.getElementById('importantList');
    importantList.innerHTML = '';
    
    appData.memory.important.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'important-item';
        itemElement.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div>
                <span class="value">${item.value}</span>
            </div>
        `;
        importantList.appendChild(itemElement);
    });
}

// Gerar pré-visualização do relatório
function generateReportPreview(reportType) {
    previewContent.innerHTML = '';
    reportPreview.classList.remove('hidden');
    
    let content = '';
    
    switch(reportType) {
        case 'productivity':
            content = generateProductivityReport();
            break;
        case 'financial':
            content = generateFinancialReport();
            break;
        case 'activities':
            content = generateActivitiesReport();
            break;
        default:
            content = '<p>Relatório não disponível.</p>';
    }
    
    previewContent.innerHTML = content;
    
    // Armazenar tipo de relatório para download
    downloadPdfBtn.setAttribute('data-report-type', reportType);
}

// Gerar relatório de produtividade
function generateProductivityReport() {
    const completedTasks = appData.tasks.filter(task => task.completed).length;
    const totalTasks = appData.tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const highPriorityTasks = appData.tasks.filter(task => task.priority === 'high' && !task.completed);
    
    return `
        <div class="report-header">
            <h2>Relatório de Produtividade</h2>
            <p>Período: ${formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>
        
        <div class="report-section">
            <h3>Resumo de Tarefas</h3>
            <div class="report-stats">
                <div class="stat">
                    <span class="stat-label">Total de Tarefas</span>
                    <span class="stat-value">${totalTasks}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Tarefas Concluídas</span>
                    <span class="stat-value">${completedTasks}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Taxa de Conclusão</span>
                    <span class="stat-value">${completionRate}%</span>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h3>Tarefas Prioritárias Pendentes</h3>
            ${highPriorityTasks.length > 0 ? 
                `<ul>${highPriorityTasks.map(task => `<li>${task.title} (Vence: ${formatDate(task.dueDate)})</li>`).join('')}</ul>` :
                '<p>Nenhuma tarefa prioritária pendente.</p>'
            }
        </div>
        
        <div class="report-section">
            <h3>Distribuição por Categoria</h3>
            <div class="category-distribution">
                ${getCategoryDistribution()}
            </div>
        </div>
        
        <div class="report-footer">
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
        </div>
    `;
}

// Gerar relatório financeiro
function generateFinancialReport() {
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    const incomeTransactions = appData.transactions.filter(t => t.type === 'income');
    const expenseTransactions = appData.transactions.filter(t => t.type === 'expense');
    
    return `
        <div class="report-header">
            <h2>Relatório Financeiro</h2>
            <p>Período: ${formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>
        
        <div class="report-section">
            <h3>Resumo Financeiro</h3>
            <div class="report-stats">
                <div class="stat">
                    <span class="stat-label">Total de Receitas</span>
                    <span class="stat-value income">R$ ${totalIncome.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Total de Despesas</span>
                    <span class="stat-value expense">R$ ${totalExpense.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Saldo</span>
                    <span class="stat-value ${balance >= 0 ? 'income' : 'expense'}">R$ ${balance.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h3>Principais Receitas</h3>
            ${incomeTransactions.length > 0 ? 
                `<ul>${incomeTransactions.slice(0, 5).map(t => `<li>${t.description}: R$ ${t.amount.toFixed(2).replace('.', ',')}</li>`).join('')}</ul>` :
                '<p>Nenhuma receita registrada.</p>'
            }
        </div>
        
        <div class="report-section">
            <h3>Principais Despesas</h3>
            ${expenseTransactions.length > 0 ? 
                `<ul>${expenseTransactions.slice(0, 5).map(t => `<li>${t.description}: R$ ${t.amount.toFixed(2).replace('.', ',')}</li>`).join('')}</ul>` :
                '<p>Nenhuma despesa registrada.</p>'
            }
        </div>
        
        <div class="report-footer">
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
        </div>
    `;
}

// Gerar relatório de atividades
function generateActivitiesReport() {
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = appData.events.filter(event => event.date === today);
    const recentNotes = appData.notes.slice(-3).reverse();
    
    return `
        <div class="report-header">
            <h2>Relatório de Atividades</h2>
            <p>Período: ${formatDate(today)}</p>
        </div>
        
        <div class="report-section">
            <h3>Eventos de Hoje</h3>
            ${todayEvents.length > 0 ? 
                `<ul>${todayEvents.map(event => `<li>${event.time} - ${event.title}</li>`).join('')}</ul>` :
                '<p>Nenhum evento agendado para hoje.</p>'
            }
        </div>
        
        <div class="report-section">
            <h3>Anotações Recentes</h3>
            ${recentNotes.length > 0 ? 
                recentNotes.map(note => `
                    <div class="note-summary">
                        <h4>${note.title}</h4>
                        <p>${note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content}</p>
                        <p class="note-date">${formatDate(note.date)}</p>
                    </div>
                `).join('') :
                '<p>Nenhuma anotação recente.</p>'
            }
        </div>
        
        <div class="report-section">
            <h3>Compromissos Recorrentes</h3>
            ${appData.memory.recurring.length > 0 ? 
                `<ul>${appData.memory.recurring.map(item => `<li>${item.title} (${getFrequencyText(item.frequency, item.day)})</li>`).join('')}</ul>` :
                '<p>Nenhum compromisso recorrente registrado.</p>'
            }
        </div>
        
        <div class="report-footer">
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
        </div>
    `;
}

// Baixar relatório em PDF
function downloadPdfReport() {
    const reportType = downloadPdfBtn.getAttribute('data-report-type');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações do documento
    doc.setFont("helvetica");
    
    // Cabeçalho do relatório
    doc.setFontSize(20);
    doc.setTextColor(67, 97, 238); // Cor primária
    doc.text("Cérebro Zinco - Relatório", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: "center" });
    
    // Linha divisória
    doc.setDrawColor(67, 97, 238);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Conteúdo do relatório baseado no tipo
    let reportTitle = "";
    let reportContent = [];
    
    switch(reportType) {
        case 'productivity':
            reportTitle = "Relatório de Produtividade";
            reportContent = generatePdfProductivityContent();
            break;
        case 'financial':
            reportTitle = "Relatório Financeiro";
            reportContent = generatePdfFinancialContent();
            break;
        case 'activities':
            reportTitle = "Relatório de Atividades";
            reportContent = generatePdfActivitiesContent();
            break;
    }
    
    // Título do relatório
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text(reportTitle, 20, 45);
    
    // Adicionar conteúdo
    let yPos = 55;
    
    reportContent.forEach(item => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        if (item.type === 'text') {
            doc.setFontSize(item.size || 12);
            doc.setTextColor(item.color || 30, 30, 30);
            doc.text(item.text, 20, yPos);
            yPos += 7;
        } else if (item.type === 'table') {
            doc.autoTable({
                startY: yPos,
                head: item.headers,
                body: item.data,
                theme: 'grid',
                headStyles: { fillColor: [67, 97, 238] },
                margin: { left: 20 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
    }
    
    // Baixar o PDF
    doc.save(`relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('Relatório baixado com sucesso!', 'success');
}

// Gerar conteúdo PDF para relatório de produtividade
function generatePdfProductivityContent() {
    const completedTasks = appData.tasks.filter(task => task.completed).length;
    const totalTasks = appData.tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const content = [
        { type: 'text', text: 'Resumo de Tarefas', size: 14 },
        { type: 'text', text: `Total de Tarefas: ${totalTasks}` },
        { type: 'text', text: `Tarefas Concluídas: ${completedTasks}` },
        { type: 'text', text: `Taxa de Conclusão: ${completionRate}%` },
    ];
    
    // Tarefas prioritárias pendentes
    const highPriorityTasks = appData.tasks.filter(task => task.priority === 'high' && !task.completed);
    if (highPriorityTasks.length > 0) {
        content.push({ type: 'text', text: ' ', size: 12 });
        content.push({ type: 'text', text: 'Tarefas Prioritárias Pendentes', size: 14 });
        
        highPriorityTasks.forEach(task => {
            content.push({ type: 'text', text: `• ${task.title} (Vence: ${formatDate(task.dueDate)})` });
        });
    }
    
    return content;
}

// Gerar conteúdo PDF para relatório financeiro
function generatePdfFinancialContent() {
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    const content = [
        { type: 'text', text: 'Resumo Financeiro', size: 14 },
        { type: 'text', text: `Total de Receitas: R$ ${totalIncome.toFixed(2).replace('.', ',')}` },
        { type: 'text', text: `Total de Despesas: R$ ${totalExpense.toFixed(2).replace('.', ',')}` },
        { type: 'text', text: `Saldo: R$ ${balance.toFixed(2).replace('.', ',')}`, color: balance >= 0 ? [76, 175, 80] : [244, 67, 54] },
    ];
    
    // Tabela de transações
    const incomeTransactions = appData.transactions.filter(t => t.type === 'income');
    const expenseTransactions = appData.transactions.filter(t => t.type === 'expense');
    
    if (incomeTransactions.length > 0 || expenseTransactions.length > 0) {
        content.push({ type: 'text', text: ' ', size: 12 });
        content.push({ type: 'text', text: 'Últimas Transações', size: 14 });
        
        const tableData = [];
        const recentTransactions = appData.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        recentTransactions.forEach(transaction => {
            tableData.push([
                formatDate(transaction.date),
                transaction.description,
                transaction.type === 'income' ? 'Receita' : 'Despesa',
                `R$ ${transaction.amount.toFixed(2)}`
            ]);
        });
        
        content.push({
            type: 'table',
            headers: [['Data', 'Descrição', 'Tipo', 'Valor']],
            data: tableData
        });
    }
    
    return content;
}

// Gerar conteúdo PDF para relatório de atividades
function generatePdfActivitiesContent() {
    const content = [];
    
    // Eventos de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = appData.events.filter(event => event.date === today);
    
    if (todayEvents.length > 0) {
        content.push({ type: 'text', text: 'Eventos de Hoje', size: 14 });
        
        todayEvents.forEach(event => {
            content.push({ type: 'text', text: `• ${event.time} - ${event.title}` });
        });
        
        content.push({ type: 'text', text: ' ', size: 12 });
    }
    
    // Anotações recentes
    const recentNotes = appData.notes.slice(-3).reverse();
    
    if (recentNotes.length > 0) {
        content.push({ type: 'text', text: 'Anotações Recentes', size: 14 });
        
        recentNotes.forEach(note => {
            content.push({ type: 'text', text: note.title, size: 12 });
            const preview = note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content;
            content.push({ type: 'text', text: preview, size: 10 });
            content.push({ type: 'text', text: formatDate(note.date), size: 10 });
            content.push({ type: 'text', text: ' ', size: 12 });
        });
    }
    
    return content;
}

// Instalar PWA
function installPWA() {
    if (!deferredPrompt) {
        showNotification('O aplicativo já está instalado ou não pode ser instalado.', 'error');
        return;
    }
    
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Usuário aceitou a instalação');
            installBtn.style.display = 'none';
            showNotification('Aplicativo instalado com sucesso!', 'success');
        } else {
            console.log('Usuário recusou a instalação');
        }
        
        deferredPrompt = null;
    });
}

// Mostrar notificação
function showNotification(message, type) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#4ade80' : '#f87171'};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius-small);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Botão para fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Adicionar estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Funções utilitárias
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getFrequencyText(frequency, day) {
    switch(frequency) {
        case 'daily':
            return 'Diariamente';
        case 'weekly':
            return `Toda ${getWeekdayText(day)}`;
        case 'monthly':
            return `Todo dia ${day}`;
        default:
            return frequency;
    }
}

function getWeekdayText(day) {
    const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    return weekdays[day] || day;
}

function getCategoryDistribution() {
    const categories = {};
    appData.tasks.forEach(task => {
        categories[task.category] = (categories[task.category] || 0) + 1;
    });
    
    let html = '';
    for (const [category, count] of Object.entries(categories)) {
        const percentage = Math.round((count / appData.tasks.length) * 100);
        html += `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-count">${count} (${percentage}%)</span>
            </div>
        `;
    }
    
    return html;
}

// Salvar dados no localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('cerebroZincoData', JSON.stringify(appData));
    } catch (error) {
        console.error('Erro ao salvar dados no localStorage:', error);
    }
}

// Carregar dados do localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('cerebroZincoData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Mesclar dados salvos com dados padrão
            appData = {
                ...appData,
                ...parsedData,
                // Garantir que arrays tenham todos os campos necessários
                tasks: parsedData.tasks || appData.tasks,
                events: parsedData.events || appData.events,
                transactions: parsedData.transactions || appData.transactions,
                notes: parsedData.notes || appData.notes,
                memory: parsedData.memory || appData.memory
            };
        }
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
    }
}

// Verificar atualizações
function checkForUpdates() {
    // Esta função pode ser expandida para verificar atualizações online
    // Por enquanto, apenas verifica se há dados mais recentes no localStorage
    const savedData = localStorage.getItem('cerebroZincoData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Verificar se há diferenças (simplificado)
        if (JSON.stringify(parsedData) !== JSON.stringify(appData)) {
            // Recarregar dados se necessário
            loadFromLocalStorage();
            updateDashboard();
            updateTasksList();
            updateCalendarEvents(currentDate);
            updateCashbookTable();
            updateNotesList();
        }
    }
}

// Adicionar estilos para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    }
`;
document.head.appendChild(notificationStyles);
