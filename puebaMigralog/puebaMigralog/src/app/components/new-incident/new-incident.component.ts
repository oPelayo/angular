import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Incident } from 'src/app/models/incident';
import { IncidentService } from '../../services/incident.service';
import { DatePipe } from '@angular/common';
import { NgModel } from '@angular/forms';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-new-incident',
  templateUrl: './new-incident.component.html',
  styleUrls: ['./new-incident.component.css']
})
export class NewIncidentComponent implements OnInit {
  incident: Incident = new Incident();
  userId: number; 
  startDate: Date;
  currentDate: Date;
  endDate: Date;
  backgroundColorClass: string = '';
  isEditing: boolean = false; // Variable para indicar si se está editando un incidente existente
  showGeneralError = false; // Variable para mostrar el mensaje de error general
  @ViewChild('startTimeField', { static: true }) startTimeField: NgModel;
  @ViewChild('endTimeField', { static: true }) endTimeField: NgModel;

  constructor(private incidentService: IncidentService, private datePipe: DatePipe, private router: Router, private route: ActivatedRoute, private themeService: ThemeService) { }

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');

    this.themeService.getSelectedBackgroundColor().subscribe(color => {
      this.backgroundColorClass = color;
    });

    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.userId = user.user.id;
    }
    this.currentDate = new Date();

    this.route.queryParams.subscribe(params => {
      const incidentId = params['id'];
      if (incidentId) {
        this.isEditing = true;
        this.incidentService.getIncidentById(parseInt(incidentId)).subscribe((incident: Incident) => {
          this.incident = incident;
          this.startDate = new Date(incident.startTime);
          this.endDate = new Date(incident.endTime);
        });
      }
    });
  }

  validateDates() {
    if (this.incident.startTime && this.incident.endTime) {
      const startDate = new Date(this.incident.startTime);
      const endDate = new Date(this.incident.endTime);

      if (startDate > endDate) {
        this.startTimeField.control.setErrors({ invalidDate: true });
        this.endTimeField.control.setErrors({ invalidDate: true });
      } else {
        this.startTimeField.control.setErrors(null);
        this.endTimeField.control.setErrors(null);
      }
    }

    const currentDate = new Date();
    if (this.incident.endTime && new Date(this.incident.endTime) > currentDate) {
      this.endTimeField.control.setErrors({ futureDate: true });
    } else {
      this.endTimeField.control.setErrors(null);
    }
  }

  onSubmit(form: any) {
    if (form.invalid) {
      this.showGeneralError = true;
      return;
    }
    this.showGeneralError = false;
    this.saveIncident();
  }

  saveIncident(): void {
    if (this.incident.startTime && this.incident.endTime) {
      const startDate = new Date(this.incident.startTime);
      const endDate = new Date(this.incident.endTime);

      if (startDate > endDate) {
        console.error('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
      }
    }

    const currentDate = new Date();
    if (this.incident.endTime && new Date(this.incident.endTime) > currentDate) {
      console.error('La fecha de fin no puede ser posterior a la fecha actual.');
      return;
    }

    if (this.isEditing) {
      this.incidentService.updateIncident(this.incident).subscribe(response => {
        console.log('Incident updated:', response);
        this.router.navigate(['personal-area']);
      });
    } else {
      this.incidentService.newIncident(this.incident, this.userId).subscribe(response => {
        console.log('Incident created:', response);
        this.router.navigate(['personal-area']);
      });
    }
  }
}
