import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-shift-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    DragDropModule,
  ],
  template: `
    <div class="schedule" cdkDropListGroup>
      <div class="table-wrapper">
        <table mat-table [dataSource]="staffData" class="mat-elevation-z8">
          <!-- Staff Name Column -->
          <ng-container matColumnDef="staffName">
            <th mat-header-cell *matHeaderCellDef>Staff</th>
            <td mat-cell *matCellDef="let staff" class="staff-name">
              <div class="staff-info">
                <img
                  [src]="staff.avatar"
                  alt="{{ staff.name }}"
                  class="staff-avatar"
                />
                <div class="staff-name-text">{{ staff.name }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Day Columns -->
          <ng-container
            *ngFor="let day of days; let i = index"
            [matColumnDef]="day"
          >
            <th
              mat-header-cell
              *matHeaderCellDef
              [ngClass]="{
                'odd-column': i % 2 !== 0,
                'even-column': i % 2 === 0
              }"
            >
              {{ day }}
            </th>
            <td
              mat-cell
              *matCellDef="let staff"
              [ngClass]="{
                'odd-column': i % 2 !== 0,
                'even-column': i % 2 === 0,
                'selected-day': isSelected(staff, day)
              }"
              cdkDropList
              [cdkDropListData]="{ staff, day }"
              (cdkDropListDropped)="onDrop($event)"
              (mouseenter)="onHoverSelect(staff, day)"
            >
              <div class="shift-cell" [class.dragging]="isDragging">
                <ng-container
                  *ngFor="let shift of staff.shifts[day]; let i = index"
                >
                  <div
                    class="shift"
                    cdkDrag
                    [cdkDragData]="{ staff, day, shift }"
                    (cdkDragStarted)="onDragStart($event, shift, staff, day)"
                    (click)="onShiftClick($event, staff, day, shift)"
                  >
                    <div *cdkDragPreview class="drag-preview">
                      <span>{{ shift.name }}</span>
                      <i *ngIf="shift.icon" class="material-icons">{{
                        shift.icon
                      }}</i>
                    </div>
                    <span>{{ shift.name }}</span>
                    <i *ngIf="shift.icon" class="material-icons">{{
                      shift.icon
                    }}</i>
                  </div>
                </ng-container>

                <button
                  *ngIf="staff.shifts[day].length < 2"
                  class="add-shift"
                  (mousedown)="startMultiSelection(staff, day, $event)"
                  (mouseup)="endMultiSelection(staff)"
                >
                  Add
                </button>
              </div>
            </td>
          </ng-container>

          <!-- Row Definitions -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .schedule {
        margin: 20px;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .table-wrapper {
        position: relative;
        overflow: auto;
      }
      table {
        width: 100%;
        height: 100%;
        border-collapse: collapse;
      }
      .shift {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #e3f2fd;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid #90caf9;
        cursor: pointer;
      }
      .shift:hover {
        background: #bbdefb;
      }
      .shift-cell {
        display: flex;
        flex-direction: column;
        gap: 5px;
        position: relative;
        min-height: 70px;
      }

      .add-shift {
        background: #e8f5e9;
        border: 1px dashed #4caf50;
        padding: 5px;
        border-radius: 4px;
        cursor: pointer;
        text-align: center;
        font-size: 0.8rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .selected-day {
        background: #cce5ff !important;
        border: 1px solid #007bff;
      }

      .shift-cell:hover:not(.dragging) .add-shift {
        opacity: 1;
      }

      .add-shift:hover {
        background: #c8e6c9;
      }

      .shift-cell.dragging .add-shift {
        opacity: 0 !important;
      }

      td,
      th {
        border-collapse: collapse;
        border-spacing: 0;
      }

      th {
        text-align: center;
        position: sticky;
        top: 0;
        background: #fafafa;
        z-index: 2;
        box-shadow: 0 4px 4px -4px rgba(0, 0, 0, 0.1);
      }

      td {
        padding: 5px;
        min-width: 90px;
        position: relative;
        height: 90px;
        vertical-align: top;
      }

      td:first-child {
        position: sticky;
        left: 0;
        background: #fff;
        z-index: 1;
        font-weight: bold;
        box-shadow: 4px 0 4px -4px rgba(0, 0, 0, 0.1);
      }

      .even-column {
        background-color: #f9f9f9 !important;
      }
      .odd-column {
        background-color: #ffffff;
      }

      .drag-preview {
        background: #e3f2fd;
        border: 1px solid #90caf9;
        padding: 5px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .cdk-drag-preview {
        position: fixed !important;
        pointer-events: none;
      }

      .staff-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 5px;
      }

      .staff-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #ddd;
      }

      .staff-name-text {
        font-weight: bold;
        font-size: 0.75rem;
        color: #333;
      }
    `,
  ],
})
export class ShiftScheduleComponent {
  days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  displayedColumns = ['staffName', ...this.days];
  draggedShift: any = null;
  isDragging: boolean = false;
  draggedFrom: { staff: any; day: string } | null = null;
  shiftCategories = [
    { name: 'E1', icon: 'wb_sunny', startTime: '06:00', endTime: '14:00' },
    { name: 'D2', icon: 'light_mode', startTime: '14:00', endTime: '22:00' },
    { name: 'N3', icon: 'light_mode', startTime: '14:00', endTime: '22:00' },
    { name: 'B4', icon: 'alarm_on', startTime: '06:00', endTime: '06:00' },
  ];
  staffData = this.generateStaffData();

  selectedDays: { [staffName: string]: Set<string> } = {};
  isSelecting = false;

  constructor(private dialog: MatDialog) {}

  generateStaffData() {
    const avatars = [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4',
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=6',
      'https://i.pravatar.cc/150?img=7',
      'https://i.pravatar.cc/150?img=8',
      'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=10',
    ];

    return [
      {
        name: 'John Doe',
        avatar: avatars[0],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Jane Doe',
        avatar: avatars[1],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Alice Smith',
        avatar: avatars[2],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Bob Johnson',
        avatar: avatars[3],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Carol White',
        avatar: avatars[4],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'David Brown',
        avatar: avatars[5],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Ella Green',
        avatar: avatars[6],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Frank Black',
        avatar: avatars[7],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Grace King',
        avatar: avatars[8],
        shifts: this.generateRandomShifts(),
      },
      {
        name: 'Hank Wilson',
        avatar: avatars[9],
        shifts: this.generateRandomShifts(),
      },
    ];
  }

  generateRandomShifts(): { [key: string]: any[] } {
    const shifts: {
      [key: string]: {
        name: string;
        icon: string;
        startTime: string;
        endTime: string;
      }[];
    } = {};
    this.days.forEach((day) => {
      const numShifts = Math.floor(Math.random() * 2);
      shifts[day] = [];
      for (let i = 0; i < numShifts; i++) {
        const randomShift =
          this.shiftCategories[
            Math.floor(Math.random() * this.shiftCategories.length)
          ];
        shifts[day].push({ ...randomShift });
      }
    });
    return shifts;
  }

  startMultiSelection(staff: any, day: string, event: MouseEvent) {
    if (event.buttons === 1) {
      // Left-click and hold
      this.isSelecting = true;
      this.selectedDays[staff.name] = new Set([day]);
    }
  }

  onHoverSelect(staff: any, day: string) {
    if (this.isSelecting) {
      this.selectedDays[staff.name].add(day);
    }
  }

  endMultiSelection(staff: any) {
    this.isSelecting = false;
    const selectedDaysArray = Array.from(
      this.selectedDays[staff.name] || []
    ).sort();

    if (selectedDaysArray.length > 0) {
      this.openAddShiftDialog(staff, selectedDaysArray);
    }
    this.selectedDays[staff.name] = new Set();
  }

  isSelected(staff: any, day: string): boolean {
    return this.selectedDays[staff.name]?.has(day);
  }

  openAddShiftDialog(staff: any, days: string[]) {
    const dialogRef = this.dialog.open(AddShiftDialog, {
      data: { shiftCategories: this.shiftCategories, days, staffName: staff.name },
    });
    dialogRef.afterClosed().subscribe((newShift) => {
      if (newShift) {
        days.forEach((day) => {
          if (staff.shifts[day].length < 2) {
            staff.shifts[day].push(newShift);
          }
        });
      }
    });
  }

  openEditShiftDialog(staff: any, day: string, shift: any) {
    const dialogRef = this.dialog.open(EditShiftDialog, {
      data: { staff, day, shift },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === null) {
        const shifts = staff.shifts[day];
        const index = shifts.indexOf(shift);
        if (index > -1) {
          shifts.splice(index, 1);
        }
      } else if (result) {
        const shifts = staff.shifts[day];
        const index = shifts.indexOf(shift);
        if (index > -1) {
          shifts[index] = result;
        }
      }
    });
  }

  onShiftClick(event: MouseEvent, staff: any, day: string, shift: any) {
    if (this.isDragging) {
      event.stopPropagation();
      return;
    }
    this.openEditShiftDialog(staff, day, shift);
  }

  onDragStart(event: any, shift: any, staff: any, day: string) {
    this.draggedShift = shift;
    this.draggedFrom = { staff, day };
    this.isDragging = true;
  }

  isDropDisabled(staff: any, day: string): boolean {
    return staff.shifts[day]?.length >= 2;
  }

  onDrop(event: any) {
    if (!this.draggedShift || !this.draggedFrom) return;

    const targetData = event.container.data;

    if (targetData.staff.shifts[targetData.day]?.length >= 2) {
      return;
    }

    if (
      targetData.staff === this.draggedFrom.staff &&
      targetData.day === this.draggedFrom.day
    ) {
      this.resetDragState();
      return;
    }

    const dialogRef = this.dialog.open(ConfirmMoveDialog, {
      data: {
        shift: this.draggedShift,
        from: this.draggedFrom,
        to: { staff: targetData.staff, day: targetData.day },
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        const fromShifts = this.draggedFrom?.staff.shifts[this.draggedFrom.day];
        const index = fromShifts.indexOf(this.draggedShift);
        if (index > -1) {
          fromShifts.splice(index, 1);
        }

        const toShifts = targetData.staff.shifts[targetData.day];
        toShifts.push(this.draggedShift);

        this.staffData = [...this.staffData];
      }

      this.resetDragState();
    });
  }

  resetDragState() {
    this.draggedShift = null;
    this.draggedFrom = null;
    this.isDragging = false;
  }
}

@Component({
  selector: 'add-shift-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Add Shift for {{ data.staffName }}</h2>
      <p class="dialog-subtitle">
        Selected Days:
        <strong *ngIf="data.days.length === 1">{{ data.days[0] }}</strong>
        <strong *ngIf="data.days.length > 1">
          {{ data.days[0] }} → {{ data.days[data.days.length - 1] }}
        </strong>
      </p>
      <div class="shift-options">
        <div
          class="shift-option"
          *ngFor="let shift of data.shiftCategories"
          (click)="addShift(shift)"
        >
          <span>{{ shift.name }}</span>
          <i class="material-icons">{{ shift.icon }}</i>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-raised-button color="warn" (click)="dialogRef.close()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 20px;
        max-width: 400px;
      }
      .dialog-title {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.5rem;
        font-weight: bold;
      }
      .shift-options {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        gap: 10px;
      }
      .shift-option {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 4px;
        padding: 10px;
        cursor: pointer;
        transition: background 0.3s;
      }
      .shift-option:hover {
        background: #bbdefb;
      }
      .dialog-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
    `,
  ],
})
export class AddShiftDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddShiftDialog>
  ) {}

  addShift(shift: any) {
    this.dialogRef.close(shift);
  }
}

@Component({
  selector: 'edit-shift-dialog',
  imports: [MatButtonModule],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Edit Shift</h2>
      <div class="shift-preview">
        <span>{{ data.shift.name }}</span>
        <i class="material-icons">{{ data.shift.icon }}</i>
      </div>
      <div class="dialog-actions">
        <button
          mat-raised-button
          color="primary"
          (click)="editShift('🚩 ' + data.shift.name, data.shift.icon)"
        >
          Update
        </button>
        <button mat-raised-button color="warn" (click)="deleteShift()">
          Delete
        </button>
        <button mat-raised-button color="accent" (click)="dialogRef.close()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 20px;
        max-width: 400px;
      }
      .dialog-title {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.5rem;
        font-weight: bold;
      }
      .shift-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 20px;
        font-size: 1.2rem;
      }
      .dialog-actions {
        display: flex;
        justify-content: space-around;
        gap: 10px;
      }
    `,
  ],
})
export class EditShiftDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditShiftDialog>
  ) {}

  editShift(name: string, icon: string) {
    this.dialogRef.close({ name, icon });
  }

  deleteShift() {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'confirm-move-dialog',
  imports: [MatButtonModule],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">Confirm Move</h2>
      <p class="dialog-message">
        Are you sure you want to move this shift from
        <strong>{{ data.from.staff.name }}</strong> on
        <strong>{{ data.from.day }}</strong> to
        <strong>{{ data.to.staff.name }}</strong> on
        <strong>{{ data.to.day }}</strong
        >?
      </p>
      <div class="dialog-actions">
        <button mat-raised-button color="primary" (click)="confirm(true)">
          Yes
        </button>
        <button mat-raised-button color="warn" (click)="confirm(false)">
          No
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 20px;
        max-width: 400px;
      }
      .dialog-title {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.5rem;
        font-weight: bold;
      }
      .dialog-message {
        text-align: center;
        margin-bottom: 20px;
        font-size: 1rem;
      }
      .dialog-actions {
        display: flex;
        justify-content: space-around;
        gap: 10px;
      }
    `,
  ],
})
export class ConfirmMoveDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmMoveDialog>
  ) {}

  confirm(result: boolean) {
    this.dialogRef.close(result);
  }
}
