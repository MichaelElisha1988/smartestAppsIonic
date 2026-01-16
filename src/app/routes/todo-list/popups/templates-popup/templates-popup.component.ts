import { Component, EventEmitter, inject, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { TaskTemplate } from 'src/app/models/task-template.model';

@Component({
  selector: 'app-templates-popup',
  templateUrl: './templates-popup.component.html',
  styleUrls: ['./templates-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TemplatesPopupComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  dataSrv = inject(DataService);
  
  templates = signal<TaskTemplate[]>([]);
  showSaveInput = signal(false);
  newTemplateName = signal('');

  editingTemplateId = signal<string | null>(null);
  editingName = signal('');
  editingTasks = signal<string[]>([]);

  ngOnInit() {
      this.refreshTemplates();
  }

  refreshTemplates() {
      this.templates.set(this.dataSrv.getTemplates());
  }

  toggleSaveMode() {
      this.showSaveInput.set(!this.showSaveInput());
      this.newTemplateName.set('');
  }

  saveCurrentList() {
      if (this.newTemplateName().trim().length < 2) {
          alert('Please enter a valid name for the template.');
          return;
      }

      // Get current visible tasks
      const currentListId = this.dataSrv.selectedId();
      const currentTasks = this.dataSrv.taskList()
          .filter(t => t.listID === currentListId)
          .map(t => t.task);

      if (currentTasks.length === 0) {
          alert('The current list is empty. Add tasks before saving as a template.');
          return;
      }

      this.dataSrv.saveTemplate(this.newTemplateName(), currentTasks);
      this.refreshTemplates();
      this.toggleSaveMode();
  }

  startEditing(template: TaskTemplate) {
      this.editingTemplateId.set(template.id);
      this.editingName.set(template.name);
      this.editingTasks.set([...template.tasks]); // Copy array
  }

  cancelEditing() {
      this.editingTemplateId.set(null);
      this.editingName.set('');
      this.editingTasks.set([]);
  }

  saveEditing() {
      if (this.editingName().trim().length < 2) {
          alert('Please enter a valid name.');
          return;
      }
      
      const updatedTemplate: TaskTemplate = {
          id: this.editingTemplateId()!,
          name: this.editingName(),
          tasks: this.editingTasks()
      };
      
      this.dataSrv.updateTemplate(updatedTemplate);
      this.refreshTemplates();
      this.cancelEditing();
  }

  removeTaskFromEdit(index: number) {
      this.editingTasks.update(tasks => tasks.filter((_, i) => i !== index));
  }

  addTaskToEdit() {
      const newTask = prompt('Enter new task:');
      if(newTask && newTask.trim()) {
           this.editingTasks.update(tasks => [...tasks, newTask.trim()]);
      }
  }
  
  updateTaskInEdit(index: number, newValue: any) {
       this.editingTasks.update(tasks => {
           const newTasks = [...tasks];
           newTasks[index] = newValue.target.value;
           return newTasks;
       });
  }

  loadTemplate(templateId: string) {
      const currentListId = this.dataSrv.selectedId();
      if(confirm('Load this template into the current list?')) {
          this.dataSrv.loadTemplateIntoList(templateId, currentListId);
          this.close.emit();
      }
  }

  deleteTemplate(templateId: string) {
      if(confirm('Are you sure you want to delete this template?')) {
          this.dataSrv.deleteTemplate(templateId);
          this.refreshTemplates();
      }
  }
}
