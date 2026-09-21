import { TestBed } from '@angular/core/testing';
import { ExportService, ExportPDFData } from './export.service';
import { vi } from 'vitest';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportService]
    });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate PDF and open a blob URL', () => {
    const data: ExportPDFData = {
      idSale: 'sale-123456789',
      cliente: { name: 'Juan Perez', documentType: 'DNI', documentNumber: '12345678' },
      metodoPago: 'Efectivo',
      items: [
        { productName: 'Paracetamol', lotCode: 'L-123', quantity: 2, unitPrice: 1.5, subtotal: 3.0 }
      ],
      subtotal: 3.0,
      descuento: 0.0,
      igv: 0.54,
      total: 3.54
    };

    const mockWindow = {
      location: { href: '' },
      close: vi.fn()
    } as unknown as Window;

    const createObjectURLOriginal = URL.createObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue('blob:foo');

    service.generarPDFConPestana(data, mockWindow);

    expect(mockWindow.location.href).toBe('blob:foo');

    URL.createObjectURL = createObjectURLOriginal;
  });

  it('should handle public general client and null tab', () => {
    const data: ExportPDFData = {
      idSale: 'sale-123456789',
      cliente: null,
      metodoPago: 'Tarjeta',
      items: [
        { productName: 'Paracetamol', lotCode: 'L-123', quantity: 2, unitPrice: 1.5, subtotal: 3.0 }
      ],
      subtotal: 3.0,
      descuento: 0.0,
      igv: 0.54,
      total: 3.54
    };

    const originalOpen = window.open;
    window.open = vi.fn();
    const createObjectURLOriginal = URL.createObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue('blob:foo');

    service.generarPDFConPestana(data, null);

    expect(window.open).toHaveBeenCalledWith('blob:foo', '_blank');

    window.open = originalOpen;
    URL.createObjectURL = createObjectURLOriginal;
  });

  it('should run exportarAExcel without crash', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    service.exportarAExcel({ test: 'data' });
    expect(consoleSpy).toHaveBeenCalledWith('Aquí irá tu lógica para exportar a Excel usando xlsx o similar', { test: 'data' });
    consoleSpy.mockRestore();
  });
});
