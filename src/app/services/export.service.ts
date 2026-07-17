import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportPDFData {
    idSale: string;
    cliente: { name: string; documentType: string; documentNumber: string } | null;
    metodoPago: string;
    items: Array<{
        productName: string;
        lotCode: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    subtotal: number;
    descuento: number;
    igv: number;
    total: number;
}

@Injectable({
    providedIn: 'root',
})
export class ExportService {

    generarPDFConPestana(data: ExportPDFData, pestanaAbierta: Window | null): void {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Tipado estricto para evitar el error de asignación de Color en jsPDF
            const primaryColor: [number, number, number] = [219, 39, 119]; // #db2777
            const textColor: [number, number, number] = [55, 65, 81];      // #374151

            // --- ENCABEZADO DE LA EMPRESA ---
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.text('FARMA-SALUD S.A.C.', 14, 20);

            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            doc.setFont('helvetica', 'normal');
            doc.text('Av. Principal 123 - Arequipa, Perú', 14, 25);
            doc.text('RUC: 20123456789', 14, 29);
            doc.text('Contacto: contacto@farmasalud.com', 14, 33);

            // --- CUADRO DE BOLETA DE VENTA ---
            doc.setDrawColor(243, 244, 246);
            doc.setFillColor(249, 250, 251);
            doc.roundedRect(120, 12, 76, 23, 3, 3, 'FD');

            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('BOLETA DE VENTA ELECTRÓNICA', 123, 18);

            doc.setTextColor(55, 65, 81);
            doc.setFontSize(10);
            doc.text(`N°: ${data.idSale.substring(0, 8).toUpperCase()}`, 123, 24);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 123, 29);

            // Línea divisoria
            doc.setDrawColor(229, 231, 235);
            doc.line(14, 40, 196, 40);

            // --- INFORMACIÓN DEL CLIENTE ---
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.text('DATOS DEL ADQUIRENTE', 14, 47);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            if (data.cliente) {
                doc.text(`Cliente: ${data.cliente.name}`, 14, 53);
                doc.text(`${data.cliente.documentType}: ${data.cliente.documentNumber}`, 14, 58);
            } else {
                doc.text('Cliente: PÚBLICO EN GENERAL', 14, 53);
                doc.text('Documento: S/D', 14, 58);
            }
            doc.text(`Método de pago: ${data.metodoPago}`, 120, 53);

            // --- TABLA DE PRODUCTOS ---
            const headers = [['PRODUCTO', 'LOTE', 'CANT.', 'P. UNIT', 'SUBTOTAL']];
            const tableRows = data.items.map(item => [
                item.productName,
                item.lotCode,
                `${item.quantity} u.`,
                `S/ ${item.unitPrice.toFixed(2)}`,
                `S/ ${item.subtotal.toFixed(2)}`
            ]);

            autoTable(doc, {
                startY: 65,
                head: headers,
                body: tableRows,
                theme: 'grid',
                headStyles: {
                    fillColor: primaryColor,
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'left'
                },
                bodyStyles: {
                    fontSize: 8.5,
                    textColor: textColor
                },
                columnStyles: {
                    2: { halign: 'center' },
                    3: { halign: 'right' },
                    4: { halign: 'right' }
                },
                margin: { left: 14, right: 14 }
            });

            // --- POSICIÓN DE LOS TOTALES ---
            const lastAutoTable = (doc as any).lastAutoTable;
            const finalY = lastAutoTable && lastAutoTable.finalY ? lastAutoTable.finalY + 10 : 120;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);

            doc.text('Subtotal:', 140, finalY);
            doc.text('Descuento:', 140, finalY + 5);
            doc.text('IGV (18%):', 140, finalY + 10);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.text('TOTAL:', 140, finalY + 16);

            // Valores numéricos
            doc.setFont('helvetica', 'normal');
            doc.text(`S/ ${data.subtotal.toFixed(2)}`, 195, finalY, { align: 'right' });
            doc.text(`S/ ${data.descuento.toFixed(2)}`, 195, finalY + 5, { align: 'right' });
            doc.text(`S/ ${data.igv.toFixed(2)}`, 195, finalY + 10, { align: 'right' });

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(11);
            doc.text(`S/ ${data.total.toFixed(2)}`, 195, finalY + 16, { align: 'right' });

            // --- PIE DE PÁGINA ---
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text('Representación impresa de la Boleta de Venta Electrónica.', 14, finalY + 30);
            doc.text('Gracias por su preferencia.', 14, finalY + 34);

            // --- CONVERSIÓN A BLOB Y APERTURA DIRECTA ---
            const pdfBlob = doc.output('blob');
            const blobURL = URL.createObjectURL(pdfBlob);

            if (pestanaAbierta) {
                pestanaAbierta.location.href = blobURL;
            } else {
                window.open(blobURL, '_blank');
            }

        } catch (pdfError) {
            console.error('Error generando el PDF en el servicio:', pdfError);
            if (pestanaAbierta) pestanaAbierta.close();
            throw pdfError; // Propagamos el error para que el componente lo maneje con el Toast
        }
    }

    // --- FUTURA IMPLEMENTACIÓN DE EXCEL ---
    exportarAExcel(data: any): void {
        console.log('Aquí irá tu lógica para exportar a Excel usando xlsx o similar', data);
        // Pronto podrás importar xlsx y generar hojas de cálculo estructuradas aquí mismo.
    }
}