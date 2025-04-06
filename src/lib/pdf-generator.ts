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
  termsAndConditions?: string;
  addressLine1?: string;
  postcode?: string;
  city?: string;
  country?: string;
  paymentMethod?: string;
  bankAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  qrImageUrl?: string;
}

// Use WeakMap for caching logo images to allow garbage collection
const logoCache = new WeakMap<object, HTMLImageElement>();
const logoKeyMap = new Map<string, object>();

/**
 * Load the logo image with caching
 */
function loadLogoImage(logoUrl: string): Promise<HTMLImageElement> {
  // Create a key object for the WeakMap
  if (!logoKeyMap.has(logoUrl)) {
    logoKeyMap.set(logoUrl, {});
  }
  
  const keyObj = logoKeyMap.get(logoUrl)!;
  
  // Check if we have a cached image
  if (logoCache.has(keyObj)) {
    return Promise.resolve(logoCache.get(keyObj)!);
  }
  
  // Load the image
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    // Set a timeout in case the image loading gets stuck
    const timeoutId = setTimeout(() => {
      console.warn('Logo image loading timed out');
      logoKeyMap.delete(logoUrl); // Clean up on timeout
      reject(new Error('Image loading timed out'));
    }, 3000); // 3 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      logoCache.set(keyObj, img);
      resolve(img);
    };
    
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      console.warn('Failed to load logo image:', logoUrl);
      logoKeyMap.delete(logoUrl); // Clean up on error
      reject(err);
    };
    
    // Try to load the image with better error handling
    try {
      img.src = logoUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error setting image source:', error);
      reject(error);
    }
  });
}

// Clean up function to remove unused logo cache entries
export function cleanupLogoCache(): void {
  // This will allow the garbage collector to clean up any unused logo images
  for (const [url, keyObj] of logoKeyMap.entries()) {
    if (!logoCache.has(keyObj)) {
      logoKeyMap.delete(url);
    }
  }
}

/**
 * Create a text-based logo as fallback
 */
function createTextLogo(doc: jsPDF, pageWidth: number, y: number): void {
  // Calculate positions for centered logo and text
  const textWidth = 30; // Approximate text width
  const logoRadius = 4;
  const combinedWidth = (logoRadius * 2) + 2 + textWidth; // Logo + spacing + text
  const startX = (pageWidth / 2) - (combinedWidth / 2);
  
  // Create a blue circle for logo
  doc.setFillColor(0, 51, 153); // Dark blue circle
  doc.circle(startX + logoRadius, y - 1, logoRadius, 'F');
  
  // Add "I" in the circle
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('I', startX + logoRadius, y, { align: 'center' });
  
  // Add "Powered by Invo" text to the right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Powered by Invo', startX + (logoRadius * 2) + 2, y, { align: 'left' });
}

/**
 * A minimal base64 encoded PNG logo as fallback
 * This is a simple blue circle with "I" in it as a data URL
 */
const FALLBACK_LOGO_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABl0lEQVR4nO2UvUtCURjGf9dLF7W0xaVFXIOWoCFoaGjIJYKGoL/AJYKGoKEhaAgagoYIGoKGoEFoCBqChqAhaAgaIsharuV9ek/cbtdrej3deuDZzjnP+5zfOed8B/5rTJl9qFQq5oWFxb7X60XXXXieF9O0hWihUOiZJmi329NGo8GtVqtddrsiNpaLRqN0Op0nFyMmk0k2NDS8PD4+TgE4QDmZTPbm5+ckn8+TMYqurKzspdPpgcViQYzAPjs7S6vVIsCKLYFgMMjc3BwAa5qW8vl8yJiPD3I4HNzd3Y0CDPJutxvL2q45nU7q9TqAf2pqSubm5vB6vRwdHT3yYlwzEAigqiqFQoGlpSWWl5c5Pz8HwGaz8ZPkcjmq1SpXV1cuoOrxeGRsbIzh4WHC4TBer5fj42NisRiapsWBs263K8/PzzIyMiLAiMPh4Pb2lkQiQTwe5+DggJubGwDW19d5eHiQRCLB6emppFIpASbGx8dlampK1tfXqdVqMjExIYAK7NqAXcva/v5+rlAo/Mm+OhwODvn9/qjZP5ef6jUB3yB8LF/8kOgAAAAASUVORK5CYII=';

/**
 * Extract paid amount from invoice notes
 */
function extractPaidAmount(invoice: InvoiceWithDetails): number {
  if ((invoice as any).paidAmount !== undefined) {
    return (invoice as any).paidAmount;
  }
  
  // If no notes, return 0
  if (!(invoice as any).notes) return 0;
  
  // Try to extract payment information from notes
  const paymentRegex = /Payment of ([\d.]+) received/;
  const matches = ((invoice as any).notes as string).match(paymentRegex);
  
  if (matches && matches[1]) {
    return parseFloat(matches[1]);
  }
  
  return 0;
}

// Format the address from separate fields or use the single address field
function formatCompanyAddress(companyDetails: any): string {
  if (companyDetails.addressLine1) {
    // Format from separate address fields - without addressLine2
    const addressParts = [
      companyDetails.addressLine1,
      `${companyDetails.postcode || ''} ${companyDetails.city || ''}${companyDetails.country ? ', ' + companyDetails.country : ''}`
    ];
    
    // Filter only completely empty lines for final output
    return addressParts
      .filter(part => part.trim() !== '')
      .join('\n');
  }
  
  // Fall back to single address field
  return companyDetails.address || '';
}

export async function downloadInvoicePDF(
  invoice: InvoiceWithDetails, 
  companyDetails: CompanyDetails | null = null,
  settings: AppSettings = defaultSettings
): Promise<void> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true // Enable compression to reduce file size
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
    const companyAddress = formatCompanyAddress(companyDetails);
    
    if (companyAddress) {
      const addressLines = companyAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, pageWidth - margin, yPos, { align: 'right' });
        yPos += 5;
      });
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
  // Calculate balance due based on payment status
  if (invoice.status === 'PARTIAL' || invoice.status === 'PAID') {
    const paidAmount = extractPaidAmount(invoice);
    const balanceDue = invoice.total - paidAmount;
    
    // If fully paid, show 0 balance
    if (invoice.status === 'PAID') {
      doc.text(formatCurrency(0, settings), pageWidth - margin, 50, { align: 'right' });
    } else {
      doc.text(formatCurrency(balanceDue, settings), pageWidth - margin, 50, { align: 'right' });
    }
  } else {
    // For unpaid invoices, show the full amount as balance due
    doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, 50, { align: 'right' });
  }
  
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
  
  // Show customer contact information
  let yOffset = 7;
  
  // Add email
  if (invoice.customer.email) {
    doc.text(invoice.customer.email, margin, customerY + yOffset);
    yOffset += 5;
  }
  
  // Add phone number
  if (invoice.customer.phoneNumber) {
    doc.text(invoice.customer.phoneNumber, margin, customerY + yOffset);
    yOffset += 5;
  }
  
  // Add address if available
  if (invoice.customer.address) {
    const addressLines = invoice.customer.address.split('\n');
    addressLines.forEach((line: string) => {
      doc.text(line, margin, customerY + yOffset);
      yOffset += 5;
    });
  }
  
  // Invoice details - Right side
  const invoiceDetailsX = pageWidth - margin - 60;
  const invoiceDetailsValueX = pageWidth - margin;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  doc.text('Invoice #', invoiceDetailsX, customerY);
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
  const statusX = invoiceDetailsValueX - 40; // Make the badge wider
  const statusY = customerY + 30;
  const statusWidth = 40; // Increased width
  const statusHeight = 8; // Increased height
  
  // Set status badge color based on status
  let statusText = '';
  let borderR = 0, borderG = 0, borderB = 0; // Variables to store border colors
  
  switch (invoice.status) {
    case 'PAID':
      doc.setFillColor(220, 252, 231); // Light green
      doc.setTextColor(22, 101, 52); // Dark green
      borderR = 22; borderG = 101; borderB = 52;
      statusText = 'PAID';
      break;
    case 'PARTIAL':
      doc.setFillColor(254, 243, 199); // Light amber/yellow
      doc.setTextColor(146, 64, 14); // Dark amber/yellow
      borderR = 146; borderG = 64; borderB = 14;
      statusText = 'PARTIAL';
      break;
    case 'OVERDUE':
      doc.setFillColor(254, 226, 226); // Light red
      doc.setTextColor(153, 27, 27); // Dark red
      borderR = 153; borderG = 27; borderB = 27;
      statusText = 'OVERDUE';
      break;
    case 'SENT':
      doc.setFillColor(219, 234, 254); // Light blue
      doc.setTextColor(30, 64, 175); // Dark blue
      borderR = 30; borderG = 64; borderB = 175;
      statusText = 'SENT';
      break;
    case 'DRAFT':
      doc.setFillColor(229, 231, 235); // Light gray
      doc.setTextColor(75, 85, 99); // Dark gray
      borderR = 75; borderG = 85; borderB = 99;
      statusText = 'DRAFT';
      break;
    case 'CANCELLED':
      doc.setFillColor(239, 215, 239); // Light purple
      doc.setTextColor(112, 26, 117); // Dark purple
      borderR = 112; borderG = 26; borderB = 117;
      statusText = 'CANCELLED';
      break;
    default:
      doc.setFillColor(243, 244, 246); // Light gray
      doc.setTextColor(75, 85, 99); // Dark gray
      borderR = 75; borderG = 85; borderB = 99;
      statusText = invoice.status;
  }
  
  // Draw status badge background with border
  doc.roundedRect(statusX, statusY - 5, statusWidth, statusHeight, 2, 2, 'F');
  
  // Add a subtle border around the badge
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(0.1);
  doc.roundedRect(statusX, statusY - 5, statusWidth, statusHeight, 2, 2, 'S');
  
  // Add status text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, statusX + statusWidth / 2, statusY, { 
    align: 'center'
  });
  
  // Reset text color and line width
  doc.setTextColor(80, 80, 80);
  doc.setLineWidth(0.3);
  
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
  
  // Define column widths - adjusted for better visibility of quantity and price
  const colWidths = {
    item: contentWidth * 0.05,
    description: contentWidth * 0.35, // Reduced to give more space to other columns
    quantity: contentWidth * 0.20,
    unitPrice: contentWidth * 0.20,
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
  if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
    invoice.items.forEach((item, index) => {
      xPos = margin;
      
      // Item number
      doc.text(`${index + 1}`, xPos + 5, yPos);
      xPos += colWidths.item;
      
      // Item name and description
      doc.setFont('helvetica', 'bold');
      doc.text(item.product?.name || item.description || 'Item', xPos, yPos);
      doc.setFont('helvetica', 'normal');
      
      if (item.description) {
        yPos += 5;
        doc.text(item.description || '', xPos, yPos);
      }
      
      xPos += colWidths.description;
      
      // Reset yPos if we added a description line
      if (item.description) {
        yPos -= 5;
      }
      
      // Quantity - make it more prominent
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.quantity}`, xPos, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      xPos += colWidths.quantity;
      
      // Unit price - make it more prominent
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.unitPrice, settings), xPos, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      xPos += colWidths.unitPrice;
      
      // Amount - make it more prominent
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.quantity * item.unitPrice, settings), pageWidth - margin, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += tableRowHeight + 5;
    });
  } else {
    // No items - display a message
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('No items in this invoice', margin + contentWidth / 2, yPos, { align: 'center' });
    yPos += tableRowHeight + 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
  }
  
  // Totals Section
  const totalsWidth = 80;
  const totalsX = pageWidth - margin - totalsWidth;
  const totalsY = yPos + 10;
  
  // Show payment QR code beside subtotal if enabled
  if (companyDetails?.paymentMethod === 'qr' && companyDetails.qrImageUrl) {
    try {
      // Position QR code in the left area beside the totals section
      const qrSize = 50; // QR code size in mm
      const qrX = margin;
      const qrY = totalsY - 10;
      
      // Add Payment Information title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text('Payment Information', qrX, qrY - 5);
      
      // Add white background for QR code
      doc.setFillColor(255, 255, 255);
      doc.rect(qrX, qrY, qrSize + 10, qrSize + 15, 'F');
      
      // Add border around QR code
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(qrX, qrY, qrSize + 10, qrSize + 15, 'S');
      
      // Add the QR code image
      doc.addImage(
        companyDetails.qrImageUrl,
        'PNG',
        qrX + 5,
        qrY + 5,
        qrSize,
        qrSize
      );
      
      // Add a caption
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Scan to pay', qrX + (qrSize + 10)/2, qrY + qrSize + 10, { align: 'center' });
      doc.setFontSize(10);
      
      // Reset text color
      doc.setTextColor(80, 80, 80);
    } catch (qrError) {
      console.error('Error adding QR code to PDF:', qrError);
    }
  }
  
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
  
  // Show paid amount and balance due for partial payments
  if (invoice.status === 'PARTIAL' || invoice.status === 'PAID') {
    const paidAmount = extractPaidAmount(invoice);
    const balanceDue = invoice.total - paidAmount;
    
    // If fully paid, show 0 balance
    if (invoice.status === 'PAID') {
      doc.text(formatCurrency(0, settings), pageWidth - margin, currentY, { align: 'right' });
    } else {
      doc.text(formatCurrency(balanceDue, settings), pageWidth - margin, currentY, { align: 'right' });
    }
    
    // Add paid amount information
    currentY += 15;
    doc.setFillColor(220, 252, 231); // Light green for paid amount
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
    
    doc.setTextColor(22, 101, 52); // Dark green text
    doc.text('Amount Paid', totalsX, currentY);
    doc.text(formatCurrency(paidAmount, settings), pageWidth - margin, currentY, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(50, 50, 50);
  } else {
    // For unpaid invoices, show the full amount as balance due
    doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, currentY, { align: 'right' });
  }
  
  // Payment Information - Bank details - Add if payment method is bank
  // This section is now handled after Terms & Conditions
  // if (companyDetails?.paymentMethod === 'bank') { ... }
  
  // Terms & Conditions
  const termsY = currentY + 25;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Terms & Conditions', margin, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  // Use custom terms if provided, otherwise use default
  const termsText = companyDetails?.termsAndConditions || 
    'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.';
  
  // Split terms into multiple lines if needed
  const maxWidth = pageWidth - (margin * 2);
  const termsLines = doc.splitTextToSize(termsText, maxWidth);
  
  // Add each line of terms
  let termsBottomY = termsY + 8;
  termsLines.forEach((line: string, index: number) => {
    doc.text(line, margin, termsBottomY + (index * 6));
  });
  termsBottomY += (termsLines.length * 6);

  // Unified Payment Information Section - Bottom Left
  if (companyDetails?.paymentMethod) {
    const paymentInfoY = termsBottomY + 15; // Position below terms
    const paymentInfoX = margin;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Payment Information', paymentInfoX, paymentInfoY - 5);

    if (companyDetails.paymentMethod === 'bank') {
      // Display bank transfer details in a table format
      const tableWidth = 100;
      const rowHeight = 10;
      const tableX = paymentInfoX;
      const tableY = paymentInfoY;

      // Draw white background for the entire table
      doc.setFillColor(255, 255, 255);
      doc.rect(tableX, tableY, tableWidth, rowHeight * 3, 'F');

      // Draw table borders
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(tableX, tableY, tableWidth, rowHeight * 3, 'S'); // Outer border
      doc.line(tableX, tableY + rowHeight, tableX + tableWidth, tableY + rowHeight); // Row 1 divider
      doc.line(tableX, tableY + rowHeight * 2, tableX + tableWidth, tableY + rowHeight * 2); // Row 2 divider
      const colDivider = tableX + tableWidth * 0.4;
      doc.line(colDivider, tableY, colDivider, tableY + rowHeight * 3); // Column divider

      // Add table content
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('Bank Name', tableX + 2, tableY + rowHeight * 0.65);
      doc.text('Account Name', tableX + 2, tableY + rowHeight * 1.65);
      doc.text('Account Number', tableX + 2, tableY + rowHeight * 2.65);
      doc.setFont('helvetica', 'normal');
      doc.text(companyDetails.bankName || '', colDivider + 2, tableY + rowHeight * 0.65);
      doc.text(companyDetails.bankAccountName || '', colDivider + 2, tableY + rowHeight * 1.65);
      doc.text(companyDetails.bankAccountNumber || '', colDivider + 2, tableY + rowHeight * 2.65);

    } else if (companyDetails.paymentMethod === 'qr' && companyDetails.qrImageUrl) {
      // Display QR code image with white background
      try {
        const qrSize = 40; // QR code size in mm
        const qrX = paymentInfoX;
        const qrY = paymentInfoY;

        // Add white background for QR code box
        doc.setFillColor(255, 255, 255);
        doc.rect(qrX, qrY, qrSize + 10, qrSize + 15, 'F');

        // Add border around QR code box
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(qrX, qrY, qrSize + 10, qrSize + 15, 'S');

        // Add the QR code image
        doc.addImage(
          companyDetails.qrImageUrl,
          'PNG',
          qrX + 5,
          qrY + 5,
          qrSize,
          qrSize
        );

        // Add caption
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Scan to pay', qrX + (qrSize + 10) / 2, qrY + qrSize + 10, { align: 'center' });
        doc.setFontSize(10); // Reset font size

      } catch (qrError) {
        console.error('Error adding QR code to PDF:', qrError);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('QR code payment available (scan not displayed)', paymentInfoX, paymentInfoY + 8);
      }
    }
  }

  // Footer
  const footerHeight = 15; // Keep footer height definition
  const footerTopY = pageHeight - footerHeight; // Calculate top Y of the footer area
  
  // Add a light gray footer bar that extends to the bottom
  doc.setFillColor(245, 245, 245);
  doc.rect(0, footerTopY, pageWidth, footerHeight, 'F'); // Position rectangle at the very bottom
  
  // Company name and registration number - centered
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const companyTextY = footerTopY + 6; // Position text relative to footer top (approx center)
  if (companyDetails?.registrationNumber) {
    doc.text(`${companyDetails.legalName} (${companyDetails.registrationNumber})`, pageWidth / 2, companyTextY, { align: 'center' });
  } else {
    doc.text('Your Company Name | SSM: 123456-A', pageWidth / 2, companyTextY, { align: 'center' });
  }
  
  // "Powered by Invo" logo and text (adjust Y position if needed, maybe remove?)
  // Let's keep it simple and just have company name for now to ensure no overlap
  // TODO: Re-add Powered by Invo if space allows and adjust positioning carefully
  
  // Remove Powered by Invo for now to simplify footer adjustments
  /*
  try {
    // ... existing logo loading and drawing code ...
    // Ensure all Y coordinates (e.g., logoY, text Y) are relative to footerTopY
    const logoWidth = 6;
    const logoHeight = 6;
    const textWidth = 25; 
    const combinedWidth = logoWidth + 2 + textWidth;
    const startX = (pageWidth / 2) - (combinedWidth / 2);
    const logoY = footerTopY + footerHeight - logoHeight - 2; // Position near bottom
    
    // Add logo on the left
    // doc.addImage(img, 'PNG', startX, logoY, logoWidth, logoHeight);
    
    // Add text to the right of the logo
    // doc.text('Powered by Invo', startX + logoWidth + 2, logoY + (logoHeight/2) + 1, { align: 'left' });
    
  } catch (error) {
    console.error('Error adding logo to PDF, using text fallback:', error);
    // Fallback to text-based logo, adjusted Y position
    // createTextLogo(doc, pageWidth, footerTopY + X); // Adjust X as needed
  }
  */
  
  // Save the PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

/**
 * Generate and download a receipt for a paid invoice
 */
export async function downloadReceiptPDF(
  invoice: InvoiceWithDetails, 
  companyDetails: CompanyDetails | null = null,
  settings: AppSettings = defaultSettings
): Promise<void> {
  // Create a new PDF document with elongated receipt size (80mm width, taller height)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200], // Custom elongated receipt size (width, height)
    compress: true
  });
  
  // Set up document properties
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 5; // Smaller margins for receipt
  const contentWidth = pageWidth - (margin * 2);
  
  // Set monospace font for the whole receipt
  doc.setFont('courier', 'normal');
  
  // Format dates properly
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };
  
  const formatTime = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };
  
  // Company header (centered)
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text(companyDetails?.legalName || 'Fish & Chips Fast Foods', pageWidth / 2, margin + 5, { align: 'center' });
  
  // Company address (centered)
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  
  let yPos = margin + 10;
  
  const companyAddress = formatCompanyAddress(companyDetails);
  
  if (companyAddress) {
    const addressLines = companyAddress.split('\n');
    addressLines.forEach(line => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
    });
  } else {
    doc.text('address', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('Malaysia', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  }
  
  // Phone number
  doc.text(companyDetails?.phoneNumber || '888-888-8888', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  // Order number (centered and bold)
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text(`Order: ${invoice.invoiceNumber}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  // Host and date information
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  
  // Get current user/host name - replace with actual user data if available
  const hostName = companyDetails?.ownerName || 'Host';
  doc.text(`Host: ${hostName}`, margin, yPos);
  
  // Transaction date and time
  const issueDate = new Date(invoice.issueDate);
  const formattedDate = formatDate(issueDate);
  const formattedTime = formatTime(issueDate);
  
  // Make sure date and time fit on the same line for narrow receipt
  doc.text(formattedDate, pageWidth - margin, yPos - 4, { align: 'right' });
  doc.text(formattedTime, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 4;
  
  // Draw a horizontal line
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  
  // Column headers
  doc.setFont('courier', 'bold');
  doc.text('Qty', margin, yPos);
  doc.text('Item', margin + 8, yPos);
  doc.text('Price', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 4;
  
  // Draw another horizontal line
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 6;
  
  // List items
  doc.setFont('courier', 'normal');
  
  if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
    invoice.items.forEach(item => {
      const quantityText = item.quantity.toString();
      const priceText = formatCurrency(item.unitPrice * item.quantity, settings);
      const itemName = item.product?.name || item.description || 'Item';
      const unitPriceText = formatCurrency(item.unitPrice, settings);
      
      // Handle long item names by wrapping if needed
      if (itemName.length > 15) {
        // Bold quantity
        doc.setFont('courier', 'bold');
        doc.text(quantityText, margin, yPos);
        doc.setFont('courier', 'normal');
        
        const lines = doc.splitTextToSize(itemName, pageWidth - margin - 18);
        doc.text(lines[0], margin + 8, yPos);
        
        // Bold price
        doc.setFont('courier', 'bold');
        doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });
        doc.setFont('courier', 'normal');
        
        // If there are more lines, add them
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            yPos += 4;
            doc.text(lines[i], margin + 8, yPos);
          }
        }
        
        // Add unit price underneath
        yPos += 4;
        doc.text(`@ ${unitPriceText} each`, margin + 8, yPos);
      } else {
        // Bold quantity
        doc.setFont('courier', 'bold');
        doc.text(quantityText, margin, yPos);
        doc.setFont('courier', 'normal');
        
        doc.text(itemName, margin + 8, yPos);
        
        // Bold total price
        doc.setFont('courier', 'bold');
        doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });
        doc.setFont('courier', 'normal');
        
        // Add unit price underneath
        yPos += 4;
        doc.text(`@ ${unitPriceText} each`, margin + 8, yPos);
      }
      
      yPos += 6;
    });
  } else {
    // No items - display a message
    doc.setFont('courier', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('No items in this receipt', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFont('courier', 'normal');
    doc.setTextColor(80, 80, 80);
  }
  
  // Draw another horizontal line
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  
  // Payment details - Changed from VISA to CASH
  doc.text('CASH', margin, yPos);
  doc.text('Sale', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 8;
  
  // Totals
  doc.text('Subtotal', margin, yPos);
  doc.text(formatCurrency(invoice.subtotal, settings), pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  // Tax
  const taxAmount = invoice.total - invoice.subtotal;
  doc.text('Tax', margin, yPos);
  doc.text(formatCurrency(taxAmount, settings), pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  // SalesTax (could be duplicate, but keeping with the receipt example)
  doc.text('SalesTax', margin, yPos);
  doc.text(formatCurrency(taxAmount, settings), pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  // Total
  doc.setFont('courier', 'bold');
  doc.text('Total:', margin, yPos);
  doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, yPos, { align: 'right' });
  yPos += 8;
  
  // Transaction information
  doc.setFont('courier', 'normal');
  doc.text('Transaction Type:', margin, yPos);
  doc.text('Sale', pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  doc.text('Authorization:', margin, yPos);
  doc.text('APPROVED', pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  // Generate a deterministic but unique payment code and ID for the receipt
  // based on the invoice ID to ensure they're unique per invoice but consistent
  // on repeated generation
  const uniqueStr = invoice.id + new Date(invoice.issueDate).getTime();
  const paymentCode = 'BS' + Array.from(uniqueStr)
    .map(c => c.charCodeAt(0))
    .reduce((a, b) => a + b, 0) 
    + Math.floor(Math.random() * 1000000);
  
  const paymentId = parseInt(invoice.id.replace(/\D/g, '').substring(0, 8) || '0') 
    + Math.floor(Math.random() * 10000000);
  
  doc.text('Payment Code:', margin, yPos);
  doc.text(paymentCode.toString(), pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  doc.text('Payment ID:', margin, yPos);
  doc.text(paymentId.toString(), pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;
  
  // Total after tip (no tip field)
  doc.setFont('courier', 'bold');
  doc.text('=Total:', margin, yPos);
  doc.text(formatCurrency(invoice.total, settings), pageWidth - margin, yPos, { align: 'right' });
  yPos += 12;
  
  // Signature line
  doc.text('X ___________________', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  
  // Footer
  doc.setFont('courier', 'normal');
  doc.text('Customer Copy', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('Thanks for visiting', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text(companyDetails?.legalName || 'Fish & Chips Fast Foods', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // Add "Powered by Invo" at the bottom
  doc.setFontSize(8);
  doc.setFont('courier', 'bold');
  
  // Try to load the Invo logo
  try {
    // In a browser environment, load the logo
    let logoUrl = window.location.origin + '/invo-logo.png';
    
    // Use custom logo if provided in company details
    if (companyDetails?.logoUrl) {
      logoUrl = companyDetails.logoUrl;
    }
    
    // Try to load the logo image with proper error handling
    let img;
    try {
      img = await loadLogoImage(logoUrl);
      
      // Position the logo to the left of "Powered by Invo" text
      const logoWidth = 4; // Smaller for receipt
      const textWidth = 25; // Approximate text width
      const combinedWidth = logoWidth + 2 + textWidth; // Logo + spacing + text
      const startX = (pageWidth / 2) - (combinedWidth / 2);
      
      // Add logo on the left
      doc.addImage(img, 'PNG', startX, yPos - 3, logoWidth, 4);
      
      // Add text to the right of the logo with a small gap
      doc.text('Powered by Invo', startX + logoWidth + 2, yPos, { align: 'left' });
    } catch (logoError) {
      console.warn('Primary logo loading failed, trying alternate path:', logoError);
      
      // Try alternative path (relative URL)
      try {
        const altLogoUrl = '/invo-logo.png';
        img = await loadLogoImage(altLogoUrl);
        
        // Position the logo to the left of "Powered by Invo" text
        const logoWidth = 4; // Smaller for receipt
        const textWidth = 25; // Approximate text width
        const combinedWidth = logoWidth + 2 + textWidth; // Logo + spacing + text
        const startX = (pageWidth / 2) - (combinedWidth / 2);
        
        // Add logo on the left
        doc.addImage(img, 'PNG', startX, yPos - 3, logoWidth, 4);
        
        // Add text to the right of the logo with a small gap
        doc.text('Powered by Invo', startX + logoWidth + 2, yPos, { align: 'left' });
      } catch (altLogoError) {
        console.warn('Alternative logo loading failed, using data URL fallback:', altLogoError);
        
        // Try using the embedded data URL as a last resort
        try {
          // Position the logo to the left of "Powered by Invo" text
          const logoWidth = 4; // Smaller for receipt
          const textWidth = 25; // Approximate text width
          const combinedWidth = logoWidth + 2 + textWidth; // Logo + spacing + text
          const startX = (pageWidth / 2) - (combinedWidth / 2);
          
          // Add logo on the left
          doc.addImage(FALLBACK_LOGO_DATA_URL, 'PNG', startX, yPos - 3, logoWidth, 4);
          
          // Add text to the right of the logo with a small gap
          doc.text('Powered by Invo', startX + logoWidth + 2, yPos, { align: 'left' });
        } catch (dataUrlError) {
          // All attempts failed, fall back to text only
          throw dataUrlError;
        }
      }
    }
  } catch (error) {
    console.error('Error adding logo to receipt PDF, using text only:', error);
    // If image loading fails, just show text
    doc.text('Powered by Invo', pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Determine if we need to add more pages based on content height
  if (yPos > pageHeight - margin) {
    // Add extra length to the page if needed
    doc.internal.pageSize.height = yPos + margin + 10;
  }
  
  // Save the PDF with a name including invoice number
  doc.save(`Receipt-${invoice.invoiceNumber}.pdf`);
}
