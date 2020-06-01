import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-new-goal-modal',
  templateUrl: './add-new-goal-modal.component.html',
  styleUrls: ['./add-new-goal-modal.component.scss'],
})
export class AddNewGoalModalComponent implements OnInit {
  @ViewChild("f", { static: true }) form: NgForm;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.modalCtrl.dismiss(
      {
        name: this.form.value["name"],
        amount: this.form.value["amount"],
      },
      "confirm"
    );
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }

}
