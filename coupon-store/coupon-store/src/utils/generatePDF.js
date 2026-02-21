import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadCouponPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // Mejora la calidad del texto
    useCORS: true, // Permite cargar imágenes externas como el logo
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Calculamos el ancho para que el cupón no se deforme
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};
