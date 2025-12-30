import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile-edit.scss']
})
export class ProfileEditComponent implements OnInit {
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user = signal<any>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);

  roles = [
    { value: 'donor', label: 'Donateur' },
    { value: 'beneficiary', label: 'Bénéficiaire' },
    { value: 'both', label: 'Les deux' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[0-9]{10,15}$/)]],
      role: ['donor', Validators.required],
      address: this.fb.group({
        street: [''],
        city: [''],
        postalCode: [''],
        coordinates: [[]]
      })
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadProfile(): void {
    const userId = this.authService.currentUser()?._id;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading.set(true);

    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        console.log('👤 Profile loaded:', response);
        const userData = response.data?.user || response.user || response.data;
        this.user.set(userData);
        
        // Remplir le formulaire
        this.profileForm.patchValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role,
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            postalCode: userData.address?.postalCode || '',
            coordinates: userData.address?.coordinates || []
          }
        });

        this.previewUrl.set(userData.avatar || null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading profile:', error);
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    const userId = this.user()?._id;
    if (!userId) return;

    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.saving.set(true);

    this.userService.updateAvatar(userId, formData).subscribe({
      next: (response) => {
        console.log('✅ Avatar updated:', response);
        alert('✅ Photo de profil mise à jour !');
        this.selectedFile = null;
        this.saving.set(false);
        
        // Recharger l'utilisateur dans AuthService
        this.authService.loadCurrentUser();
      },
      error: (error) => {
        console.error('❌ Error updating avatar:', error);
        alert('❌ Erreur lors de la mise à jour de la photo');
        this.saving.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const userId = this.user()?._id;
    if (!userId) return;

    this.saving.set(true);

    this.userService.updateProfile(userId, this.profileForm.value).subscribe({
      next: (response) => {
        console.log('✅ Profile updated:', response);
        alert('✅ Profil mis à jour avec succès !');
        this.saving.set(false);
        
        // Recharger l'utilisateur dans AuthService
        this.authService.loadCurrentUser();
        
        // Rediriger vers le profil
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('❌ Error updating profile:', error);
        alert('❌ ' + (error.error?.message || 'Erreur lors de la mise à jour'));
        this.saving.set(false);
      }
    });
  }

  onPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    // Appeler l'API de changement de mot de passe
    this.authService.updatePassword(this.passwordForm.value).subscribe({
      next: (response) => {
        console.log('✅ Password updated:', response);
        alert('✅ Mot de passe modifié avec succès !');
        this.passwordForm.reset();
        this.saving.set(false);
      },
      error: (error) => {
        console.error('❌ Error updating password:', error);
        alert('❌ ' + (error.error?.message || 'Erreur lors de la modification'));
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  getErrorMessage(field: string, formGroup: FormGroup = this.profileForm): string {
    const control = formGroup.get(field);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (control?.hasError('pattern')) {
      return 'Format invalide';
    }
    
    return '';
  }
}