import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadCouponPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // Mejora la calidad para que el texto no se vea borroso
    useCORS: true, 
    logging: false,
    backgroundColor: '#ffffff' // Asegura fondo blanco
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Añadimos la imagen con un pequeño margen superior
  pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};
