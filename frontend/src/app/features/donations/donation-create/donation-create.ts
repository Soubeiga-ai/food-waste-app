// src/app/features/donations/donation-create/donation-create.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services + types
import { DonationService } from '../../../core/services/donation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateDonationRequest, FoodCategory, Unit } from '../../../models/donation.model';

@Component({
  selector: 'app-donation-create',
  standalone: true,
  templateUrl: './donation-create.html',
  styleUrls: ['./donation-create.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ]
})
export class DonationCreateComponent {

  donationForm: FormGroup;
  isLoading = signal(false);

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  categories = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'legumes', label: 'Légumes' },
    { value: 'pain', label: 'Pain' },
    { value: 'produits_laitiers', label: 'Produits laitiers' },
    { value: 'viande', label: 'Viande' },
    { value: 'poisson', label: 'Poisson' },
    { value: 'plats_prepares', label: 'Plats préparés' },
    { value: 'patisseries', label: 'Pâtisseries' },
    { value: 'conserves', label: 'Conserves' },
    { value: 'boissons', label: 'Boissons' },
    { value: 'autre', label: 'Autre' }
  ];

  units = [
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'g', label: 'Gramme (g)' },
    { value: 'l', label: 'Litre (l)' },
    { value: 'piece', label: 'Pièce(s)' },
    { value: 'portion', label: 'Portion(s)' },
    { value: 'paquet', label: 'Paquet(s)' }
  ];

  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.donationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required],
      expiryDate: ['', Validators.required],
      address: ['', Validators.required],
      longitude: [-1.5247, Validators.required],
      latitude: [12.3702, Validators.required],
    });
  }

  //----------------------------------------------------------------------
  // UPLOAD IMAGES
  //----------------------------------------------------------------------
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (!files) return;

    if (this.selectedFiles.length + files.length > 5) {
      this.notification.warning('Maximum 5 images autorisées');
      return;
    }

    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        this.notification.error('Seules les images sont autorisées');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.notification.error('Taille maximale : 5MB par image');
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  removeImage(i: number): void {
    this.selectedFiles.splice(i, 1);
    this.previewUrls.splice(i, 1);
  }

  //----------------------------------------------------------------------
  // SUBMIT FORM
  //----------------------------------------------------------------------
  onSubmit(): void {
    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      this.notification.error('Veuillez remplir tous les champs correctement');
      return;
    }

    this.isLoading.set(true);

    const formValue = this.donationForm.value;

    const expiryDateISO = new Date(formValue.expiryDate).toISOString();

    const donationData: CreateDonationRequest = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category as FoodCategory,
      quantity: formValue.quantity,
      unit: formValue.unit as Unit,
      expiryDate: expiryDateISO,
      pickupLocation: {
        address: formValue.address,
        coordinates: [
          Number(formValue.longitude),
          Number(formValue.latitude)
        ]
      },
      images: []
    };

    console.log("📤 Données envoyées :", donationData);

    this.donationService.createDonation(donationData).subscribe({

      next: () => {
        this.notification.success("Donation créée avec succès !");
        this.router.navigate(['/my-donations']);
      },

      //------------------------------------------------------------------
      // 🔥 AJOUTS IMPORTANTS POUR VOIR L’ERREUR BACKEND
      //------------------------------------------------------------------
      error: (err: any) => {
        this.isLoading.set(false);

        console.error("🔥 ERREUR COMPLÈTE :", err);
        console.error("🔥 BODY (err.error) :", err.error);
        console.error("🔥 STATUS :", err.status);
        console.error("🔥 MESSAGE :", err.error?.message);

        this.notification.error(err.error?.message || "Erreur lors de la création");
      }
    });
  }

  //----------------------------------------------------------------------
  // GETTERS
  //----------------------------------------------------------------------
  get title() { return this.donationForm.get('title'); }
  get description() { return this.donationForm.get('description'); }
  get category() { return this.donationForm.get('category'); }
  get quantity() { return this.donationForm.get('quantity'); }
  get unit() { return this.donationForm.get('unit'); }
  get expiryDate() { return this.donationForm.get('expiryDate'); }
  get address() { return this.donationForm.get('address'); }
}
