import { Task } from './task.js';
export class TodoApp {
    constructor() {
        this.tasks = [],
            this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        this.tasksPerPage = 4;
        this.nextId = 1;
        this.editingTaskId = null;
        this.darkMode = false;
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');


        this.priorityInput = document.getElementById('priorityInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.totalTasks = document.getElementById('totalTasks');
        this.searchInput = document.getElementById('searchInput');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.taskList = document.getElementById('taskList');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.notification = document.getElementById('notification');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.emptyState = document.getElementById('emptyState');
        this.pagination = document.getElementById('pagination');
        this.pageNumbers = document.getElementById('pageNumbers');
        this.prevPage = document.getElementById('prevPage');
        this.nextPage = document.getElementById('nextPage');
        this.editModal = document.getElementById('editModal');
        this.closeEditBtn = document.getElementById('closeEditBtn');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.themeBtn = document.getElementById('themeBtn');
        this.editDescriptionInput = document.getElementById('editDescriptionInput');
        this.editPriorityInput = document.getElementById('editPriorityInput');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.notification = document.getElementById('notification');
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }
    setupEventListeners() {
        this.addTaskBtn.addEventListener('click', (e) => {

            e.preventDefault();
            this.addTask();
        })
        this.filterButtons.forEach((button) => {
            button.addEventListener("click", () => {

                this.currentFilter = button.dataset.filter;
                this.currentPage = 1;

                // je met tous les boutons en blanc sauf le bouton cliqué
                this.filterButtons.forEach((btn) => {
                    btn.classList.remove(
                        'bg-[#5146f5]',
                        'text-white'
                    );

                    btn.classList.add(
                        'border',
                        'border-[#dedee8]',
                        'text-gray-600'
                    );
                });


                // je met le bouton cliqué en bleu
                button.classList.remove(
                    'border',
                    'border-[#dedee8]',
                    'text-gray-600'
                );

                button.classList.add(
                    'bg-[#5146f5]',
                    'text-white'
                );


                this.renderTasks();
            });
        });

        this.closeEditBtn.addEventListener('click', () => {
            this.closeEditModal();
        });

        this.cancelEditBtn.addEventListener('click', () => {
            this.closeEditModal();
        });

        this.saveEditBtn.addEventListener('click', () => {
            this.saveTaskEdit();
        });

        this.searchInput.addEventListener('input', () => {
            this.searchQuery = this.searchInput.value.trim().toLowerCase();
            this.currentPage = 1;

            this.renderTasks();
        });
        this.prevPage.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTasks();
            }
        });
        this.nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(
                this.getFilteredTasks().length / this.tasksPerPage
            );

            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTasks();
            }
        });
        this.themeBtn.addEventListener('click', () => {
    this.toggleDarkMode();
});
    }

    addTask() {
        const text = this.taskInput.value.trim();
        console.log(text);

        const priority = this.priorityInput.value;
        const dueDate = this.dueDateInput ? this.dueDateInput.value || null : null;
        if (text === '') {
            console.log('Aucune tache ajouter');
            return;
        }
        const existingTask = this.tasks.find(task => task.text.toLowerCase() === text.toLowerCase()
        );

        if (existingTask) {
            this.showNotification('Cette tâche existe déjà');
            return;
        }

        const task = new Task(this.nextId, text, priority, new Date(), dueDate);
        this.tasks.push(task);
        this.nextId++;
        console.log("tasks", this.tasks);
        console.log("tache ajoute");
        this.saveTasks();
        this.currentPage = 1;
        this.renderTasks();
    }

    deleteTask(id) {
    const taskElement = document.querySelector(
        `[data-task-id="${id}"]`
    );

    if (taskElement) {
        taskElement.classList.add(
            'opacity-0',
            'translate-x-5'
        );
    }

    setTimeout(() => {
        this.tasks = this.tasks.filter(
            task => task.id !== id
        );

        this.saveTasks();

        this.showNotification('Tâche supprimée');

        this.renderTasks();

    }, 300);
}

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }
        if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }
        if (this.searchQuery !== '') {
            filteredTasks = filteredTasks.filter(task =>
                task.text
                    .toLowerCase()
                    .includes(this.searchQuery)
            );
        }
        return filteredTasks;
    }

    getPaginatedTasks() {
        const filteredTasks = this.getFilteredTasks();

        const startIndex =
            (this.currentPage - 1) * this.tasksPerPage;

        const endIndex =
            startIndex + this.tasksPerPage;

        return filteredTasks.slice(startIndex, endIndex);
    }
    renderTasks() {
        this.taskList.innerHTML = '';
        this.updateStats();

        const filteredTasks = this.getFilteredTasks();
        const paginatedTasks = this.getPaginatedTasks();

        if (filteredTasks.length === 0) {
            const div = document.createElement('div');
            const icon = document.createElement('i');
            const title = document.createElement('p');

            div.className =
                'flex flex-col items-center justify-center p-10 gap-2 text-gray-500';

            icon.className =
                'fa-solid fa-clipboard-list text-[38px] text-gray-400';

            title.textContent = 'Aucune tâche à afficher';

            div.appendChild(icon);
            div.appendChild(title);

            this.taskList.appendChild(div);
            this.updatePagination();


            return;

        }

        paginatedTasks.forEach(task => {

            const taskElement = document.createElement('div');
            taskElement.dataset.id = task.id;

            taskElement.className =
                'flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white';


            const leftContent = document.createElement('div');

            leftContent.className =
                'flex items-center gap-3';
            
            // ici cest le Bouton pour terminer la tâche
            const completeBtn = document.createElement('button');
            completeBtn.addEventListener('click', () => {
                this.toggleComplete(task.id);
            });
            this.updatePagination();

            completeBtn.className =
                'w-4 h-4 rounded-full border-2 border-[#5146f5] flex items-center justify-center shrink-0';

            if (task.completed) {
                completeBtn.classList.add(
                    'bg-[#5146f5]',
                    'text-white'
                );

                completeBtn.innerHTML =
                    '<i class="fa-solid fa-check text-[9px]"></i>';
            }


            // ici cest pour les Informations de la tâche
            const info = document.createElement('div');


            const taskText = document.createElement('p');

            taskText.textContent = task.text;

            taskText.className =
                'text-[12px] font-semibold text-gray-700';


            if (task.completed) {
                completeBtn.classList.add(
                    'bg-[#5146f5]',
                    'text-white'
                );

                completeBtn.innerHTML =
                    '<i class="fa-solid fa-check text-[9px]"></i>';
            }

            if (task.completed) {
                taskText.classList.add(
                    'line-through',
                    'opacity-50'
                );
            }


            const details = document.createElement('div');

            details.className =
                'flex items-center gap-2 mt-1';



            const priority = document.createElement('span');

            priority.textContent = task.priority;

            priority.className =
                'text-[8px] px-2 py-1 rounded-full';


            if (task.priority === 'high') {
                priority.classList.add(
                    'bg-red-100',
                    'text-red-600'
                );
            }

            else if (task.priority === 'medium') {
                priority.classList.add(
                    'bg-yellow-100',
                    'text-yellow-600'
                );
            }

            else {
                priority.classList.add(
                    'bg-green-100',
                    'text-green-600'
                );
            }


            details.appendChild(priority);



            if (task.dueDate) {

                const dueDate = document.createElement('span');

                dueDate.className =
                    'text-[9px] text-gray-400';

                dueDate.innerHTML =
                    `<i class="fa-regular fa-calendar"></i> ${task.dueDate}`;

                details.appendChild(dueDate);
            }


            info.appendChild(taskText);
            info.appendChild(details);


            leftContent.appendChild(completeBtn);
            leftContent.appendChild(info);


            // pour pouvoir modifier et suprimer 
            const actions = document.createElement('div');

            actions.className =
                'flex items-center gap-2';


            const editBtn = document.createElement('button');

            editBtn.innerHTML =
                '<i class="fa-solid fa-pen"></i>';

            editBtn.className =
                'text-[#5146f5] text-[11px]';

            editBtn.addEventListener('click', () => {
                this.openEditModal(task.id);
            });


            const deleteBtn = document.createElement('button');

            deleteBtn.innerHTML =
                '<i class="fa-solid fa-trash"></i>';

            deleteBtn.className =
                'text-red-500 text-[11px]';

            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });


            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);


            taskElement.appendChild(leftContent);
            taskElement.appendChild(actions);


            this.taskList.appendChild(taskElement);
        });
    }

    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);

        if (!task) {
            return;
        }

        task.toggleCompleted();
        this.saveTasks();
        this.renderTasks();
    }
    updateStats() {
        const total = this.tasks.length;

        const completed = this.tasks.filter(
            task => task.completed
        ).length;

        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    openEditModal(id) {
        const task = this.tasks.find(task => task.id === id);

        if (!task) {
            return;
        }

        this.editingTaskId = id;

        this.editTaskInput.value = task.text;
        this.editDescriptionInput.value = task.description || '';
        this.editPriorityInput.value = task.priority;

        this.editModal.classList.remove('hidden');
        this.editModal.classList.add('flex');
    }
    closeEditModal() {
        this.editModal.classList.add('hidden');
        this.editModal.classList.remove('flex');

        this.editingTaskId = null;
    }

    saveTaskEdit() {
        const task = this.tasks.find(
            task => task.id === this.editingTaskId
        );

        if (!task) {
            return;
        }

        const newText = this.editTaskInput.value.trim();

        if (newText === '') {
            return;
        }

        task.text = newText;
        task.description = this.editDescriptionInput.value.trim();
        task.priority = this.editPriorityInput.value;
        this.saveTasks();
        this.showNotification('Tâche modifiée avec succès');

        this.closeEditModal();
        this.renderTasks();
    }
    updatePagination() {
        const filteredTasks = this.getFilteredTasks();

        const totalPages = Math.ceil(
            filteredTasks.length / this.tasksPerPage
        );

        this.pageNumbers.innerHTML = '';

        if (totalPages <= 1) {
            this.pagination.classList.add('hidden');
            return;
        }

        this.pagination.classList.remove('hidden');
        this.pagination.classList.add('flex');

        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement('button');

            button.textContent = page;

            button.className =
                'w-7 h-7 rounded-md text-[10px] border border-gray-300';

            if (page === this.currentPage) {
                button.classList.add(
                    'bg-[#5146f5]',
                    'text-white'
                );
            }

            button.addEventListener('click', () => {
                this.currentPage = page;
                this.renderTasks();
            });

            this.pageNumbers.appendChild(button);
        }
    }
    saveTasks() {
    localStorage.setItem(
        'tasks',
        JSON.stringify(this.tasks)
    );
}
loadTasks() {
    const savedTasks = JSON.parse(
        localStorage.getItem('tasks')
    ) || [];

    this.tasks = savedTasks.map(savedTask => {

        const task = new Task(
            savedTask.id,
            savedTask.text,
            savedTask.priority,
            savedTask.createdAt,
            savedTask.dueDate,
            savedTask.description || ''
        );

        task.completed = savedTask.completed;

        return task;
    });

     if (this.tasks.length > 0) {
        this.nextId =
            Math.max(
                ...this.tasks.map(task => task.id)
            ) + 1;
    }
}
    showNotification(message) {
    this.notification.textContent = message;

    this.notification.classList.remove('hidden');

    setTimeout(() => {
        this.notification.classList.add('hidden');
    }, 2000);

}

toggleDarkMode() {
    this.darkMode = !this.darkMode;

    const icon = this.themeBtn.querySelector('i');

    if (this.darkMode) {

        document.documentElement.setAttribute(
            'data-theme',
            'dark'
        );

        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');

    } else {

        document.documentElement.setAttribute(
            'data-theme',
            'light'
        );

        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    this.saveDarkModePreference();
}

saveDarkModePreference() {
    localStorage.setItem(
        'darkMode',
        JSON.stringify(this.darkMode)
    );
}

loadDarkModePreference() {
    const savedDarkMode = JSON.parse(
        localStorage.getItem('darkMode')
    );

    this.darkMode = savedDarkMode === true;

    const icon = this.themeBtn.querySelector('i');

    if (this.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');

        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');

        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}
    initialize() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadDarkModePreference();
        this.loadTasks();
        this.renderTasks();
    }
}
