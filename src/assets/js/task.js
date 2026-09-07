export class Task {
    constructor(id, text, priority, createdAt, dueDate, description) {
        this.id = id;
        this.text = text;
        this.priority = priority;
        this.completed = false;
        this.createdAt = createdAt;
        this.dueDate = dueDate;
        this.description = description;
}
toggleCompleted() {
    this.completed = !this.completed;
}
}
