import { Component, OnInit, output, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Api } from '../../../../api/api';
import { productInsert, ProductInsert$Params, categoryGetall, laboratoryGetall } from '../../../../api/functions';

interface CatalogoItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-insert',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    RadioButtonModule,
    TextareaModule,
    ProgressSpinnerModule
  ],
  templateUrl: './product-insert.html',
  styleUrl: './product-insert.css',
})
export class ProductInsert implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(Api);

  productoRegistrado = output<void>();
  cerrarDialog = output<void>();

  frmInsertProduct: FormGroup;
  isLoading = signal<boolean>(false);
  isLoadingCatalogos = signal<boolean>(true);

  catalogoCategorias = signal<CatalogoItem[]>([]);
  catalogoLaboratorios = signal<CatalogoItem[]>([]);

  selectedFile: File | null = null;
  selectedFileName = signal<string>('');
  previewUrl = signal<string | null>(null);

  categorySearchText = signal<string>('');
  showCategoryDropdown = signal<boolean>(false);
  categorySuggestions = signal<CatalogoItem[]>([]);

  laboratorySearchText = signal<string>('');
  showLaboratoryDropdown = signal<boolean>(false);
  laboratorySuggestions = signal<CatalogoItem[]>([]);

  formDisabled = computed(() => this.isLoading() || this.isLoadingCatalogos());

  get nameFb() { return this.frmInsertProduct.controls['name']; }
  get barcodeFb() { return this.frmInsertProduct.controls['barcode']; }
  get categoryFb() { return this.frmInsertProduct.controls['category']; }
  get laboratoryFb() { return this.frmInsertProduct.controls['laboratory']; }
  get priceSaleFb() { return this.frmInsertProduct.controls['priceSale']; }
  get totalStockFb() { return this.frmInsertProduct.controls['totalStock']; }
  get stockMinimumFb() { return this.frmInsertProduct.controls['stockMinimum']; }
  get nextExpirationFb() { return this.frmInsertProduct.controls['nextExpiration']; }
  get requiresPrescriptionFb() { return this.frmInsertProduct.controls['requiresPrescription']; }
  get descriptionFb() { return this.frmInsertProduct.controls['description']; }

  constructor() {
    this.frmInsertProduct = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      barcode: ['', [Validators.required]],
      category: [null, [Validators.required]],
      laboratory: [null, [Validators.required]],
      priceSale: [null, [Validators.required, Validators.min(0)]],
      totalStock: [null, [Validators.required, Validators.min(0)]],
      stockMinimum: [null, [Validators.required, Validators.min(0)]],
      nextExpiration: [null],
      requiresPrescription: [false, [Validators.required]],
      description: ['', [Validators.maxLength(250)]],
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.isLoadingCatalogos.set(true);
    Promise.all([
      this.api.invoke$Response(categoryGetall),
      this.api.invoke$Response(laboratoryGetall)
    ]).then(([resCat, resLab]: any[]) => {
      const dataCat = typeof resCat.body === 'string' ? JSON.parse(resCat.body) : resCat.body;
      if (dataCat.type === 'success' && dataCat.listCategories) {
        this.catalogoCategorias.set(
          dataCat.listCategories.map((c: any) => ({ label: c.name, value: c.idCategory }))
        );
      }
      const dataLab = typeof resLab.body === 'string' ? JSON.parse(resLab.body) : resLab.body;
      if (dataLab.type === 'success' && dataLab.listLaboratories) {
        this.catalogoLaboratorios.set(
          dataLab.listLaboratories.map((l: any) => ({ label: l.name, value: l.idLaboratory }))
        );
      }
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los catálogos.',
        life: 4000
      });
    }).finally(() => {
      this.isLoadingCatalogos.set(false);
    });
  }

  onFocusCategory(): void {
    this.showCategoryDropdown.set(true);
    this.categorySuggestions.set(this.catalogoCategorias());
  }

  onSearchCategory(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.categorySearchText.set(q);
    this.showCategoryDropdown.set(true);
    const qLower = q.toLowerCase();
    this.categorySuggestions.set(
      this.catalogoCategorias().filter(c => c.label.toLowerCase().includes(qLower))
    );
    if (this.categoryFb.value?.label !== q) {
      this.categoryFb.setValue(null);
    }
  }

  selectCategory(item: CatalogoItem): void {
    this.categoryFb.setValue(item);
    this.categorySearchText.set(item.label);
    this.showCategoryDropdown.set(false);
  }

  onBlurCategory(): void {
    setTimeout(() => this.showCategoryDropdown.set(false), 150);
    if (!this.categoryFb.value) {
      this.categorySearchText.set('');
    }
    this.categoryFb.markAsTouched();
  }

  onFocusLaboratory(): void {
    this.showLaboratoryDropdown.set(true);
    this.laboratorySuggestions.set(this.catalogoLaboratorios());
  }

  onSearchLaboratory(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.laboratorySearchText.set(q);
    this.showLaboratoryDropdown.set(true);
    const qLower = q.toLowerCase();
    this.laboratorySuggestions.set(
      this.catalogoLaboratorios().filter(l => l.label.toLowerCase().includes(qLower))
    );
    if (this.laboratoryFb.value?.label !== q) {
      this.laboratoryFb.setValue(null);
    }
  }

  selectLaboratory(item: CatalogoItem): void {
    this.laboratoryFb.setValue(item);
    this.laboratorySearchText.set(item.label);
    this.showLaboratoryDropdown.set(false);
  }

  onBlurLaboratory(): void {
    setTimeout(() => this.showLaboratoryDropdown.set(false), 150);
    if (!this.laboratoryFb.value) {
      this.laboratorySearchText.set('');
    }
    this.laboratoryFb.markAsTouched();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFile = file;
    this.selectedFileName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  sendInsertProduct(event: Event): void {
    if (!this.frmInsertProduct.valid) {
      this.frmInsertProduct.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario incompleto',
        detail: 'Complete y corrija todos los campos requeridos.',
        life: 4000
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Confirmar registro del nuevo producto?',
      header: 'Confirmación',
      icon: 'pi pi-box',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Registrar', severity: 'primary' },
      accept: () => {
        this.isLoading.set(true);

        const bodyParams: ProductInsert$Params = {
          body: {
            name: this.nameFb.value,
            barcode: this.barcodeFb.value,
            idCategory: this.categoryFb.value?.value,
            idLaboratory: this.laboratoryFb.value?.value,
            priceSale: this.priceSaleFb.value,
            totalStock: this.totalStockFb.value,
            stockMinimum: this.stockMinimumFb.value,
            nextExpiration: this.nextExpirationFb.value || undefined,
            requiresPrescription: this.requiresPrescriptionFb.value,
            description: this.descriptionFb.value || undefined
          }
        };

        this.api.invoke$Response(productInsert, bodyParams).then((raw: any) => {
          const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
          switch (res.type) {
            case 'success':
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: res.listMessage[0], life: 4000 });
              this.resetForm();
              this.productoRegistrado.emit();
              break;
            case 'warning':
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: res.listMessage[0], life: 5000 });
              break;
            case 'error':
              this.messageService.add({ severity: 'error', summary: 'Error', detail: res.listMessage[0], life: 5000 });
              break;
            default:
              this.messageService.add({ severity: 'error', summary: 'Error inesperado', detail: 'Contacte al administrador.', life: 5000 });
          }
        }).catch(() => {
          this.messageService.add({ severity: 'error', summary: 'Sin conexión', detail: 'No se pudo conectar con el servidor.', life: 5000 });
        }).finally(() => {
          this.isLoading.set(false);
        });
      },
      reject: () => { }
    });
  }

  resetForm(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.frmInsertProduct.reset({ requiresPrescription: false });
    this.categorySearchText.set('');
    this.laboratorySearchText.set('');
    this.showCategoryDropdown.set(false);
    this.showLaboratoryDropdown.set(false);
    this.selectedFile = null;
    this.selectedFileName.set('');
    this.previewUrl.set(null);
  }

  closeDialog(): void {
    this.resetForm();
    this.cerrarDialog.emit();
  }
}