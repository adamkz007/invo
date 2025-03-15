import { jsPDF } from 'jspdf';
import { InvoiceWithDetails } from '@/types';
import { formatCurrency, AppSettings, defaultSettings } from './utils';

// Define company details interface
interface CompanyDetails {
  legalName: string;
  ownerName: string;
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
}

export function downloadInvoicePDF(
  invoice: InvoiceWithDetails, 
  companyDetails: CompanyDetails | null = null,
  settings: AppSettings = defaultSettings
) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set up document properties
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Format dates properly
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };
  
  // Add a blue header bar
  doc.setFillColor(2, 33, 142); // Dark blue background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add INVOICE text in white
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('INVOICE', margin, 25);
  
  // Company Header - Right side
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text(companyDetails?.legalName || 'Zylker PC Builds', pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Use company details if available, otherwise use default values
  if (companyDetails) {
    let yPos = 20;
    if (companyDetails.address) {
      doc.text(companyDetails.address, pageWidth - margin, yPos, { align: 'right' });
      yPos += 5;
    }
    if (companyDetails.email) {
      doc.text(companyDetails.email, pageWidth - margin, yPos, { align: 'right' });
      yPos += 5;
    }
    if (companyDetails.phoneNumber) {
      doc.text(companyDetails.phoneNumber, pageWidth - margin, yPos, { align: 'right' });
    }
  } else {
    doc.text('14B, Northern Street', pageWidth - margin, 20, { align: 'right' });
    doc.text('Greater South Avenue', pageWidth - margin, 25, { align: 'right' });
    doc.text('New York New York 10001', pageWidth - margin, 30, { align: 'right' });
    doc.text('U.S.A', pageWidth - margin, 35, { align: 'right' });
  }
  
  // Add light blue balance due section
  doc.setFillColor(220, 230, 255); // Light blue background
  doc.rect(0, 40, pageWidth, 15, 'F');
  
  // Add balance due text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50); // Dark gray text
  doc.text('BALANCE DUE', pageWidth - margin - 80, 50);
  
  doc.setFontSize(14);
  doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, 50, { align: 'right' });
  
  // Customer and Invoice Details Section
  const customerY = 70;
  
  // Customer details - Left side
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(invoice.customer.name, margin, customerY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  // Add customer address if available, otherwise use email
  const customerAddress = (invoice.customer as any).address;
  if (customerAddress) {
    const addressLines = customerAddress.split('\n');
    let addressY = customerY + 7;
    addressLines.forEach((line: string) => {
      doc.text(line, margin, addressY);
      addressY += 5;
    });
  } else {
    doc.text(invoice.customer.email, margin, customerY + 7);
  }
  
  // Invoice details - Right side
  const invoiceDetailsX = pageWidth - margin - 60;
  const invoiceDetailsValueX = pageWidth - margin;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  doc.text('Invoice#', invoiceDetailsX, customerY);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, invoiceDetailsValueX, customerY, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice Date', invoiceDetailsX, customerY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(invoice.issueDate), invoiceDetailsValueX, customerY + 10, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Due Date', invoiceDetailsX, customerY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(invoice.dueDate), invoiceDetailsValueX, customerY + 20, { align: 'right' });
  
  // Status with badge style
  doc.setFont('helvetica', 'normal');
  doc.text('Status', invoiceDetailsX, customerY + 30);
  
  // Add colored status badge
  const statusX = invoiceDetailsValueX - 30;
  const statusY = customerY + 30;
  const statusWidth = 30;
  const statusHeight = 6;
  
  // Set status badge color based on status
  switch (invoice.status) {
    case 'PAID':
      doc.setFillColor(220, 252, 231); // Light green
      doc.setTextColor(22, 101, 52); // Dark green
      break;
    case 'OVERDUE':
      doc.setFillColor(254, 226, 226); // Light red
      doc.setTextColor(153, 27, 27); // Dark red
      break;
    case 'SENT':
      doc.setFillColor(219, 234, 254); // Light blue
      doc.setTextColor(30, 64, 175); // Dark blue
      break;
    case 'DRAFT':
      doc.setFillColor(229, 231, 235); // Light gray
      doc.setTextColor(75, 85, 99); // Dark gray
      break;
    default:
      doc.setFillColor(243, 244, 246); // Light gray
      doc.setTextColor(75, 85, 99); // Dark gray
  }
  
  // Draw status badge background
  doc.roundedRect(statusX, statusY - 5, statusWidth, statusHeight, 1, 1, 'F');
  
  // Add status text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase(), statusX + statusWidth / 2, statusY, { 
    align: 'center'
  });
  
  // Reset text color
  doc.setTextColor(80, 80, 80);
  
  // Invoice Items Table
  const tableTop = 110;
  const tableRowHeight = 10;
  
  // Table header
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(margin, tableTop - 6, contentWidth, tableRowHeight, 'F');
  
  // Table header text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  
  // Define column widths
  const colWidths = {
    item: contentWidth * 0.05,
    description: contentWidth * 0.45,
    quantity: contentWidth * 0.15,
    unitPrice: contentWidth * 0.15,
    amount: contentWidth * 0.20
  };
  
  let xPos = margin;
  doc.text('#', xPos + 5, tableTop);
  xPos += colWidths.item;
  
  doc.text('ITEM & DESCRIPTION', xPos, tableTop);
  xPos += colWidths.description;
  
  doc.text('QUANTITY', xPos, tableTop, { align: 'right' });
  xPos += colWidths.quantity;
  
  doc.text('UNIT PRICE', xPos, tableTop, { align: 'right' });
  xPos += colWidths.unitPrice;
  
  doc.text('AMOUNT', pageWidth - margin, tableTop, { align: 'right' });
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  let yPos = tableTop + tableRowHeight + 5;
  
  // Draw table rows
  invoice.items.forEach((item, index) => {
    xPos = margin;
    
    // Item number
    doc.text(`${index + 1}`, xPos + 5, yPos);
    xPos += colWidths.item;
    
    // Item name and description
    doc.setFont('helvetica', 'bold');
    doc.text(item.product.name, xPos, yPos);
    doc.setFont('helvetica', 'normal');
    
    if (item.product.description) {
      yPos += 5;
      doc.text(item.product.description, xPos, yPos);
    }
    
    xPos += colWidths.description;
    
    // Reset yPos if we added a description line
    if (item.product.description) {
      yPos -= 5;
    }
    
    // Quantity, unit price, and amount
    doc.text(`${item.quantity} Piece`, xPos, yPos, { align: 'right' });
    xPos += colWidths.quantity;
    
    doc.text(formatCurrency(item.unitPrice, settings).replace(settings.currency.code, ''), xPos, yPos, { align: 'right' });
    xPos += colWidths.unitPrice;
    
    doc.text(formatCurrency(item.quantity * item.unitPrice, settings).replace(settings.currency.code, ''), pageWidth - margin, yPos, { align: 'right' });
    
    yPos += tableRowHeight + 5;
  });
  
  // Totals Section
  const totalsWidth = 80;
  const totalsX = pageWidth - margin - totalsWidth;
  const totalsY = yPos + 10;
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', totalsX, totalsY);
  doc.text(formatCurrency(invoice.subtotal, settings).replace(settings.currency.code, ''), pageWidth - margin, totalsY, { align: 'right' });
  
  // Tax (if applicable)
  let currentY = totalsY + 8;
  if (invoice.taxRate > 0) {
    doc.text(`Tax Rate`, totalsX, currentY);
    doc.text(`${invoice.taxRate.toFixed(2)}%`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 8;
  }
  
  // Total
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX, currentY);
  doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, currentY, { align: 'right' });
  
  currentY += 15;
  
  // Balance Due
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
  
  doc.text('Balance Due', totalsX, currentY);
  doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, currentY, { align: 'right' });
  
  // Terms & Conditions
  const termsY = currentY + 25;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Terms & Conditions', margin, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the', margin, termsY + 8);
  doc.text('applicable laws.', margin, termsY + 16);
  
  // Footer
  const footerY = pageHeight - 25;
  
  // Add a light gray footer bar
  doc.setFillColor(245, 245, 245);
  doc.rect(0, footerY - 15, pageWidth, 25, 'F');
  
  // Thanks for your business and company details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Thanks for your business.', margin, footerY);
  
  // Company name and SSM number
  if (companyDetails?.registrationNumber) {
    doc.text(`${companyDetails.legalName} | SSM: ${companyDetails.registrationNumber}`, margin, footerY + 7);
  } else {
    doc.text('Zylker PC Builds | SSM: 123456-A', margin, footerY + 7);
  }
  
  // Add "Powered by Invo" with logo
  try {
    // In a browser environment, we need to use a different approach
    // since jsPDF can't directly access the file system
    const logoUrl = window.location.origin + '/invo-logo.png';
    
    // Create an image element to load the logo
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS if needed
    
    // Set up onload handler to add the image once it's loaded
    img.onload = function() {
      try {
        doc.addImage(img, 'PNG', pageWidth - margin - 40, footerY - 5, 8, 8);
        
        // Add "Powered by Invo" text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text('Powered by Invo', pageWidth - margin, footerY, { align: 'right' });
        
        // Save the PDF after the image is loaded
        doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
      } catch (err) {
        console.error('Error adding image to PDF:', err);
        // Fallback to text-based logo and save
        createTextLogo();
        doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
      }
    };
    
    // Handle image loading errors
    img.onerror = function() {
      console.error('Error loading logo image');
      // Fallback to text-based logo and save
      createTextLogo();
      doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    };
    
    // Start loading the image
    img.src = logoUrl;
    
    // Don't save the PDF here - it will be saved in the onload or onerror handlers
    return;
  } catch (error) {
    console.error('Error setting up logo:', error);
    // Fallback to text-based logo
    createTextLogo();
    // Continue to save the PDF below
  }
  
  // Function to create a text-based logo
  function createTextLogo() {
    // Create a blue circle
    doc.setFillColor(0, 51, 153); // Dark blue circle
    doc.circle(pageWidth - margin - 35, footerY - 1, 4, 'F');
    
    // Add "I" in the circle
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('I', pageWidth - margin - 35, footerY, { align: 'center' });
    
    // Add "Powered by Invo" text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Powered by Invo', pageWidth - margin, footerY, { align: 'right' });
  }
  
  // Save the PDF (this will only be reached if the try block had an error)
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
