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
  
  // Add address if available using individual fields
  if (invoice.customer.street) {
    doc.text(invoice.customer.street, margin, customerY + yOffset);
    yOffset += 5;
  }
  
  if (invoice.customer.city && invoice.customer.postcode) {
    doc.text(`${invoice.customer.city}, ${invoice.customer.postcode}`, margin, customerY + yOffset);
    yOffset += 5;
  } else if (invoice.customer.city) {
    doc.text(invoice.customer.city, margin, customerY + yOffset);
    yOffset += 5;
  } else if (invoice.customer.postcode) {
    doc.text(invoice.customer.postcode, margin, customerY + yOffset);
    yOffset += 5;
  }
  
  if (invoice.customer.state) {
    doc.text(invoice.customer.state, margin, customerY + yOffset);
    yOffset += 5;
  }
  
  if (invoice.customer.country) {
    doc.text(invoice.customer.country, margin, customerY + yOffset);
    yOffset += 5;
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
  
  // Status with clean badge style
  doc.setFont('helvetica', 'normal');
  doc.text('Status', invoiceDetailsX, customerY + 30);
  
  // Define status badge dimensions - compact and elegant
  const statusWidth = 32;
  const statusHeight = 6;
  const statusX = invoiceDetailsValueX - statusWidth;
  const statusY = customerY + 30;
  
  // Get status styling based on status type - using subtle, professional colors
  let statusText = '';
  let bgColor = { r: 243, g: 244, b: 246 };
  let textColor = { r: 75, g: 85, b: 99 };
  
  switch (invoice.status) {
    case 'PAID':
      bgColor = { r: 236, g: 253, b: 245 }; // Subtle mint
      textColor = { r: 5, g: 150, b: 105 }; // Emerald
      statusText = 'PAID';
      break;
    case 'PARTIAL':
      bgColor = { r: 255, g: 251, b: 235 }; // Subtle amber
      textColor = { r: 180, g: 83, b: 9 }; // Amber
      statusText = 'PARTIAL';
      break;
    case 'OVERDUE':
      bgColor = { r: 254, g: 242, b: 242 }; // Subtle red
      textColor = { r: 185, g: 28, b: 28 }; // Red
      statusText = 'OVERDUE';
      break;
    case 'SENT':
      bgColor = { r: 239, g: 246, b: 255 }; // Subtle blue
      textColor = { r: 29, g: 78, b: 216 }; // Blue
      statusText = 'SENT';
      break;
    case 'DRAFT':
      bgColor = { r: 243, g: 244, b: 246 }; // Subtle gray
      textColor = { r: 107, g: 114, b: 128 }; // Gray
      statusText = 'DRAFT';
      break;
    case 'CANCELLED':
      bgColor = { r: 243, g: 244, b: 246 }; // Subtle gray
      textColor = { r: 107, g: 114, b: 128 }; // Gray
      statusText = 'CANCELLED';
      break;
    default:
      statusText = invoice.status;
  }
  
  // Draw clean badge background (no border for cleaner look)
  doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
  doc.roundedRect(statusX, statusY - 4, statusWidth, statusHeight, 1.5, 1.5, 'F');
  
  // Add status text - centered
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor.r, textColor.g, textColor.b);
  doc.text(statusText, statusX + statusWidth / 2, statusY + 0.5, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(80, 80, 80);
  
  // Invoice Items Table
  const tableTop = 110;
  const tableRowHeight = 12;
  const cellPadding = 4;
  
  // Define column widths with better proportions for readability
  const colWidths = {
    item: contentWidth * 0.08,        // # column
    description: contentWidth * 0.42, // Item & Description
    quantity: contentWidth * 0.12,    // Qty
    unitPrice: contentWidth * 0.18,   // Unit Price
    amount: contentWidth * 0.20       // Amount
  };
  
  // Calculate column positions
  const colPositions = {
    item: margin,
    description: margin + colWidths.item,
    quantity: margin + colWidths.item + colWidths.description,
    unitPrice: margin + colWidths.item + colWidths.description + colWidths.quantity,
    amount: margin + colWidths.item + colWidths.description + colWidths.quantity + colWidths.unitPrice
  };
  
  // Draw table header background
  doc.setFillColor(2, 33, 142); // Dark blue header matching the top bar
  doc.rect(margin, tableTop - 6, contentWidth, tableRowHeight, 'F');
  
  // Table header text - white on blue
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  
  // Center text vertically in header row
  const headerTextY = tableTop + 1;
  
  // # column - centered
  doc.text('#', colPositions.item + (colWidths.item / 2), headerTextY, { align: 'center' });
  
  // Item & Description - left aligned with padding
  doc.text('ITEM & DESCRIPTION', colPositions.description + cellPadding, headerTextY);
  
  // Qty - centered
  doc.text('QTY', colPositions.quantity + (colWidths.quantity / 2), headerTextY, { align: 'center' });
  
  // Unit Price - right aligned with padding
  doc.text('UNIT PRICE', colPositions.unitPrice + colWidths.unitPrice - cellPadding, headerTextY, { align: 'right' });
  
  // Amount - right aligned with padding
  doc.text('AMOUNT', colPositions.amount + colWidths.amount - cellPadding, headerTextY, { align: 'right' });
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  
  let yPos = tableTop + tableRowHeight + 2;
  const tableBodyStart = yPos - 6;
  
  // Draw table body border (outer frame)
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  
  // Draw table rows
  if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
    invoice.items.forEach((item, index) => {
      const rowYStart = yPos - 5;
      let rowHeight = tableRowHeight;
      
      // Get item details for calculations
      const itemNameForCalc = item.product?.name || item.description || 'Item';
      const maxWidthForCalc = colWidths.description - (cellPadding * 2);
      
      // Calculate row height based on text wrapping (item name only)
      let additionalHeight = 0;
      
      doc.setFontSize(9);
      if (doc.getTextWidth(itemNameForCalc) > maxWidthForCalc) {
        const textLines = doc.splitTextToSize(itemNameForCalc, maxWidthForCalc);
        additionalHeight += (textLines.length - 1) * 4;
      }
      
      rowHeight += additionalHeight;
      
      // Draw alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 252); // Very subtle blue-gray tint
        doc.rect(margin, rowYStart, contentWidth, rowHeight, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, rowYStart, contentWidth, rowHeight, 'F');
      }
      
      // Draw row bottom border
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, rowYStart + rowHeight, margin + contentWidth, rowYStart + rowHeight);
      
      // Center text vertically in row
      const rowTextY = yPos;
      
      // Item number - centered, lighter color
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`${index + 1}`, colPositions.item + (colWidths.item / 2), rowTextY, { align: 'center' });
      
      // Item name and description
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      let descYPos = rowTextY;
      
      // Handle long item names with text wrapping
      if (doc.getTextWidth(itemNameForCalc) > maxWidthForCalc) {
        const textLines = doc.splitTextToSize(itemNameForCalc, maxWidthForCalc);
        doc.text(textLines[0], colPositions.description + cellPadding, descYPos);
        
        if (textLines.length > 1) {
          for (let i = 1; i < textLines.length; i++) {
            descYPos += 4;
            doc.text(textLines[i], colPositions.description + cellPadding, descYPos);
          }
        }
      } else {
        doc.text(itemNameForCalc, colPositions.description + cellPadding, descYPos);
      }
      
      // Quantity - centered
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.quantity}`, colPositions.quantity + (colWidths.quantity / 2), rowTextY, { align: 'center' });
      
      // Unit price - right aligned
      doc.text(formatCurrency(item.unitPrice, settings), colPositions.unitPrice + colWidths.unitPrice - cellPadding, rowTextY, { align: 'right' });
      
      // Amount - right aligned, bold
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.quantity * item.unitPrice, settings), colPositions.amount + colWidths.amount - cellPadding, rowTextY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      yPos += rowHeight;
    });
    
    // Draw table outer border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.rect(margin, tableBodyStart, contentWidth, yPos - tableBodyStart);
    
  } else {
    // No items - display a message
    const rowHeight = tableRowHeight + 5;
    
    doc.setFillColor(250, 250, 252);
    doc.rect(margin, yPos - 5, contentWidth, rowHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos - 5, contentWidth, rowHeight, 'S');
    
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('No items in this invoice', margin + contentWidth / 2, yPos + 2, { align: 'center' });
    yPos += rowHeight;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
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
  
  // Create a nice table for the totals section
  doc.setDrawColor(200, 200, 200); // Light gray border
  doc.setLineWidth(0.3);
  
  // Subtotal row
  doc.setFillColor(255, 255, 255); // White background
  doc.rect(totalsX - 5, totalsY - 5, totalsWidth + 5, 10, 'F');
  doc.rect(totalsX - 5, totalsY - 5, totalsWidth + 5, 10, 'S'); // Border
  
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', totalsX, totalsY);
  doc.text(formatCurrency(invoice.subtotal, settings).replace(settings.currency.code, ''), pageWidth - margin - 2, totalsY, { align: 'right' });
  
  // Tax (if applicable)
  let currentY = totalsY + 8;
  if (invoice.taxRate > 0) {
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'S'); // Border
    
    doc.text(`Tax Rate`, totalsX, currentY);
    doc.text(`${invoice.taxRate.toFixed(2)}%`, pageWidth - margin - 2, currentY, { align: 'right' });
    currentY += 8;
  }
  
  // Discount (if applicable)
  if (invoice.discountRate > 0) {
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'S'); // Border
    
    doc.text(`Discount Rate`, totalsX, currentY);
    doc.text(`${invoice.discountRate.toFixed(2)}%`, pageWidth - margin - 2, currentY, { align: 'right' });
    currentY += 8;
  }
  
  // Total
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
  doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'S'); // Border
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX, currentY);
  doc.text(formatCurrency(invoice.total, settings), pageWidth - margin - 2, currentY, { align: 'right' });
  
  currentY += 8;
  
  // Balance Due
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
  doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'S'); // Border
  
  doc.text('Balance Due', totalsX, currentY);
  
  // Show paid amount and balance due for partial payments
  if (invoice.status === 'PARTIAL' || invoice.status === 'PAID') {
    const paidAmount = extractPaidAmount(invoice);
    const balanceDue = invoice.total - paidAmount;
    
    // If fully paid, show 0 balance
    if (invoice.status === 'PAID') {
      doc.text(formatCurrency(0, settings), pageWidth - margin - 2, currentY, { align: 'right' });
    } else {
      doc.text(formatCurrency(balanceDue, settings), pageWidth - margin - 2, currentY, { align: 'right' });
    }
    
    // Add paid amount information with border
    currentY += 8;
    doc.setFillColor(220, 252, 231); // Light green for paid amount
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'F');
    doc.rect(totalsX - 5, currentY - 5, totalsWidth + 5, 10, 'S'); // Border
    
    doc.setTextColor(22, 101, 52); // Dark green text
    doc.text('Amount Paid', totalsX, currentY);
    doc.text(formatCurrency(paidAmount, settings), pageWidth - margin - 2, currentY, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(50, 50, 50);
  } else {
    // For unpaid invoices, show the full amount as balance due
    doc.text(formatCurrency(invoice.total, settings), pageWidth - margin - 2, currentY, { align: 'right' });
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
  
  // Use custom terms from company settings if provided and not empty, otherwise use default
  const defaultTerms = 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.';
  const customTerms = companyDetails?.termsAndConditions?.trim();
  const termsText = customTerms && customTerms.length > 0 ? customTerms : defaultTerms;
  
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
      // Display bank transfer details with wrapped text to avoid overflow
      const tableWidth = 70;
      const tableX = paymentInfoX;
      const tableY = paymentInfoY;
      const fontSize = 8;
      const labelColumnRatio = 0.4;
      const labelColumnWidth = tableWidth * labelColumnRatio;
      const valueColumnWidth = tableWidth - labelColumnWidth;
      const horizontalPadding = 1.8;
      const verticalPadding = 1.5;
      const lineHeight = 4;

      const bankRows = [
        { label: 'Bank Name', value: companyDetails.bankName || '' },
        { label: 'Account Name', value: companyDetails.bankAccountName || '' },
        { label: 'Account Number', value: companyDetails.bankAccountNumber || '' }
      ];

      doc.setFontSize(fontSize);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.setTextColor(0, 0, 0);

      const processedRows = bankRows.map(row => {
        const labelLines = doc.splitTextToSize(
          row.label,
          Math.max(labelColumnWidth - horizontalPadding * 2, 10)
        );
        const rawValue = row.value && row.value.trim().length > 0 ? row.value : '-';
        const valueLinesRaw = doc.splitTextToSize(
          rawValue,
          Math.max(valueColumnWidth - horizontalPadding * 2, 10)
        );
        const valueLines = valueLinesRaw.length > 0 ? valueLinesRaw : ['-'];
        const maxLines = Math.max(labelLines.length, valueLines.length);
        const computedHeight = (maxLines * lineHeight) + (verticalPadding * 2);
        return {
          labelLines,
          valueLines,
          height: Math.max(computedHeight, 7)
        };
      });

      const tableHeight = processedRows.reduce((total, row) => total + row.height, 0);
      const columnDividerX = tableX + labelColumnWidth;

      // Draw table background and borders
      doc.setFillColor(255, 255, 255);
      doc.rect(tableX, tableY, tableWidth, tableHeight, 'F');
      doc.rect(tableX, tableY, tableWidth, tableHeight, 'S');
      doc.line(columnDividerX, tableY, columnDividerX, tableY + tableHeight);

      // Draw rows with wrapped text
      let currentRowY = tableY;
      processedRows.forEach((row, index) => {
        const baselineOffset = verticalPadding + (fontSize * 0.35);
        const labelStartX = tableX + horizontalPadding;
        const valueStartX = columnDividerX + horizontalPadding;
        const labelBaselineY = currentRowY + baselineOffset;
        const valueBaselineY = currentRowY + baselineOffset;

        doc.setFont('helvetica', 'bold');
        row.labelLines.forEach((line, lineIdx) => {
          const textY = labelBaselineY + (lineIdx * lineHeight);
          doc.text(line, labelStartX, textY);
        });

        doc.setFont('helvetica', 'normal');
        row.valueLines.forEach((line, lineIdx) => {
          const textY = valueBaselineY + (lineIdx * lineHeight);
          doc.text(line, valueStartX, textY);
        });

        currentRowY += row.height;

        // Draw row divider unless it's the last row
        if (index < processedRows.length - 1) {
          doc.line(tableX, currentRowY, tableX + tableWidth, currentRowY);
        }
      });
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
  doc.rect(0, footerTopY, pageWidth, footerHeight, 'F');
  
  // Company name and registration number - centered
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const companyTextY = footerTopY + 6; // Position text relative to footer top (approx center)
  if (companyDetails && companyDetails.registrationNumber) {
    doc.text(`${companyDetails.legalName} (${companyDetails.registrationNumber})`, pageWidth / 2, companyTextY, { align: 'center' });
  } else {
    doc.text('Your Company Name | SSM: 123456-A', pageWidth / 2, companyTextY, { align: 'center' });
  }

  // Add Invo logo at the bottom right of the PDF
  try {
    let logoUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/invo-logo.png';
    if (companyDetails?.logoUrl) {
      logoUrl = companyDetails.logoUrl;
    }
    let img;
    try {
      img = await loadLogoImage(logoUrl);
      const logoWidth = 10; // Adjust size as needed
      const logoHeight = 10;
      const logoX = pageWidth - logoWidth - 8; // 8mm from right edge
      const logoY = pageHeight - logoHeight - 4; // 4mm from bottom edge
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (logoError) {
      // Try fallback data URL
      try {
        const logoWidth = 10;
        const logoHeight = 10;
        const logoX = pageWidth - logoWidth - 8;
        const logoY = pageHeight - logoHeight - 4;
        doc.addImage(FALLBACK_LOGO_DATA_URL, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (dataUrlError) {
        // If all fail, do nothing
      }
    }
  } catch (error) {
    // If all fail, do nothing
  }

  // Save the PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

/**
 * Generate invoice PDF and return as Blob (for sharing via WhatsApp, etc.)
 */
export async function generateInvoicePDFBlob(
  invoice: InvoiceWithDetails, 
  companyDetails: CompanyDetails | null = null,
  settings: AppSettings = defaultSettings
): Promise<{ blob: Blob; filename: string }> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  // Set up document properties
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Format dates properly
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };
  
  // Add a blue header bar
  doc.setFillColor(2, 33, 142);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add INVOICE text in white
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', margin, 25);
  
  // Company Header - Right side
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(companyDetails?.legalName || 'Your Company', pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
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
  }
  
  // Add light blue balance due section
  doc.setFillColor(220, 230, 255);
  doc.rect(0, 40, pageWidth, 15, 'F');
  
  // Add balance due text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('BALANCE DUE', pageWidth - margin - 80, 50);
  
  doc.setFontSize(14);
  const balanceDue = invoice.status === 'PAID' ? 0 : 
    (invoice.status === 'PARTIAL' ? invoice.total - (invoice.paidAmount || 0) : invoice.total);
  doc.text(formatCurrency(balanceDue, settings), pageWidth - margin, 50, { align: 'right' });
  
  // Customer details
  const customerY = 70;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(invoice.customer.name, margin, customerY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  let yOffset = 7;
  if (invoice.customer.email) {
    doc.text(invoice.customer.email, margin, customerY + yOffset);
    yOffset += 5;
  }
  if (invoice.customer.phoneNumber) {
    doc.text(invoice.customer.phoneNumber, margin, customerY + yOffset);
    yOffset += 5;
  }
  
  // Invoice details - Right side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Invoice #:', pageWidth - margin - 50, customerY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, pageWidth - margin, customerY, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', pageWidth - margin - 50, customerY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.issueDate), pageWidth - margin, customerY + 7, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', pageWidth - margin - 50, customerY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.dueDate), pageWidth - margin, customerY + 14, { align: 'right' });
  
  // Items table
  const tableStartY = 110;
  
  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, tableStartY, pageWidth - margin * 2, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Item', margin + 2, tableStartY + 7);
  doc.text('Qty', pageWidth - margin - 70, tableStartY + 7, { align: 'right' });
  doc.text('Price', pageWidth - margin - 40, tableStartY + 7, { align: 'right' });
  doc.text('Total', pageWidth - margin - 2, tableStartY + 7, { align: 'right' });
  
  // Table rows
  let currentY = tableStartY + 15;
  doc.setFont('helvetica', 'normal');
  
  invoice.items?.forEach((item) => {
    doc.text(item.product.name, margin + 2, currentY);
    doc.text(String(item.quantity), pageWidth - margin - 70, currentY, { align: 'right' });
    doc.text(formatCurrency(item.unitPrice, settings), pageWidth - margin - 40, currentY, { align: 'right' });
    doc.text(formatCurrency(item.quantity * item.unitPrice, settings), pageWidth - margin - 2, currentY, { align: 'right' });
    currentY += 8;
  });
  
  // Totals section
  currentY += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - margin - 80, currentY - 5, pageWidth - margin, currentY - 5);
  
  doc.text('Subtotal:', pageWidth - margin - 50, currentY);
  doc.text(formatCurrency(invoice.subtotal || 0, settings), pageWidth - margin, currentY, { align: 'right' });
  
  if (invoice.taxRate > 0) {
    currentY += 7;
    doc.text(`Tax (${invoice.taxRate}%):`, pageWidth - margin - 50, currentY);
    doc.text(formatCurrency(invoice.taxAmount || 0, settings), pageWidth - margin, currentY, { align: 'right' });
  }
  
  if (invoice.discountRate > 0) {
    currentY += 7;
    doc.text(`Discount (${invoice.discountRate}%):`, pageWidth - margin - 50, currentY);
    doc.text(`-${formatCurrency(invoice.discountAmount || 0, settings)}`, pageWidth - margin, currentY, { align: 'right' });
  }
  
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', pageWidth - margin - 50, currentY);
  doc.text(formatCurrency(invoice.total || 0, settings), pageWidth - margin, currentY, { align: 'right' });
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  const filename = `${invoice.invoiceNumber}.pdf`;
  const blob = doc.output('blob');
  
  return { blob, filename };
}

/**
 * Generate and download a receipt for a paid invoice or standalone receipt
 */
export async function downloadReceiptPDF(
  invoice: InvoiceWithDetails, 
  companyDetails: CompanyDetails | null = null,
  settings: AppSettings = defaultSettings,
  receiptData?: any // Optional receipt-specific data
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
  
  // Format dates properly with validation
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      }
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (error) {
      return new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
  };
  
  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
      }
      return dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      return new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  };
  
  // Company header & BRN (centered)
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  // Add null check for companyDetails
  const companyHeaderText = companyDetails && companyDetails.legalName
    ? `${companyDetails.legalName}${companyDetails.registrationNumber ? ` (${companyDetails.registrationNumber})` : ''}`
    : 'Receipt';
  doc.text(companyHeaderText, pageWidth / 2, margin + 5, { align: 'center' });

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
  }
  
  // Phone number
  doc.text(companyDetails?.phoneNumber || '888-888-8888', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  // Receipt number (centered and bold) - use proper logic for invoice vs cash receipts
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  
  // Determine receipt number based on receipt type
  let receiptNumber: string;
  if (receiptData?.receiptNumber) {
    // This is a standalone receipt - use the receipt number
    receiptNumber = receiptData.receiptNumber;
  } else if ((invoice as any).receiptNumber) {
    // This is a receipt object passed as invoice - use its receipt number
    receiptNumber = (invoice as any).receiptNumber;
  } else {
    // This is from an invoice - use the invoice number with RCT prefix
    // Add null check to prevent TypeError
    receiptNumber = invoice.invoiceNumber 
      ? `RCT-${invoice.invoiceNumber.replace(/^INV-/, '')}` 
      : 'RCT-UNKNOWN';
  }
  
  doc.text(`Receipt No.: ${receiptNumber}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  // Host and date information
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  
  // Get current user/host name - replace with actual user data if available
  const hostName = companyDetails ? companyDetails.ownerName : 'Host';
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
      // Enhanced product name resolution with better fallbacks
      let itemName = '';
      
      // First try to get name from item.product
      if (item.product && item.product.name) {
        itemName = item.product.name;
      }
      // Then try item description
      else if (item.description) {
        itemName = item.description;
      }
      // Then try to find product in receiptData items
      else if (receiptData?.items && Array.isArray(receiptData.items)) {
        // Log for debugging
        console.log('Looking for product match in receiptData items');
        console.log('Item:', JSON.stringify(item));
        
        // Try multiple matching strategies
        let matchingItem = null;
        
        // First try matching by product ID if available
        if (item.product && 'id' in item.product) {
          matchingItem = receiptData.items.find((rItem: any) => 
            (rItem.product?.id === (item.product as any).id));
        }
        
        // If no match, try matching by productId property if it exists
         // Use type assertion to handle potential missing property
         const itemProductId = (item as any).productId;
         if (!matchingItem && itemProductId) {
           matchingItem = receiptData.items.find((rItem: any) => 
             (rItem.productId === itemProductId || rItem.product?.id === itemProductId));
         }
        
        // If we found a match with a product name, use it
        if (matchingItem?.product?.name) {
          itemName = matchingItem.product.name;
        }
      }
      
      // If still no name, use product ID or default with more descriptive fallback
      if (!itemName) {
        if (item.product && 'id' in item.product) {
           itemName = `Product #${(item.product as any).id}`;
         } else if ((item as any).productId) {
           itemName = `Product #${(item as any).productId}`;
         } else {
           itemName = 'Product Item';
         }
      }
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
  
  // Totals - Calculate from items if not provided (for receipt objects)
  let subtotal = invoice.subtotal;
  let taxAmount = invoice.taxAmount;
  const total = invoice.total || 0;
  
  // If subtotal or taxAmount are not provided, calculate them from items
  if (subtotal === undefined || subtotal === null || taxAmount === undefined || taxAmount === null) {
    // Calculate subtotal from items
    const calculatedSubtotal = invoice.items?.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0) || 0;
    
    // If we have a tax rate, calculate tax from subtotal
    if (invoice.taxRate && invoice.taxRate > 0) {
      subtotal = calculatedSubtotal;
      taxAmount = calculatedSubtotal * (invoice.taxRate / 100);
    } else {
      // No tax rate available, assume no tax
      subtotal = total;
      taxAmount = 0;
    }
  }
  
  // Ensure values are numbers and not NaN
  subtotal = subtotal || 0;
  taxAmount = taxAmount || 0;
  
  // Display Subtotal first, then Tax (standard order)
  // Subtotal
  doc.text('Subtotal', margin, yPos);
  doc.text(formatCurrency(subtotal, settings), pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  
  // Tax (only show if there is tax)
  if (taxAmount > 0) {
    doc.text('Tax', margin, yPos);
    doc.text(formatCurrency(taxAmount, settings), pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  }
  
  // Total
  doc.setFont('courier', 'bold');
  doc.text('Total:', margin, yPos);
  doc.text(formatCurrency(total, settings), pageWidth - margin, yPos, { align: 'right' });
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
  doc.text(formatCurrency(total, settings), pageWidth - margin, yPos, { align: 'right' });
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
  // Add null check for companyDetails
  const companyFooterText = companyDetails && companyDetails.legalName
    ? `${companyDetails.legalName}${companyDetails.registrationNumber ? ` (${companyDetails.registrationNumber})` : ''}`
    : 'Thank you for your business';
  doc.text(companyFooterText, pageWidth / 2, yPos, { align: 'center' });
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
  
  // Save the PDF with proper receipt number format
  // Add null check to prevent TypeError
  const pdfReceiptNumber = receiptData?.receiptNumber || 
    (invoice as any).receiptNumber ||
    (invoice.invoiceNumber ? `RCT-${invoice.invoiceNumber.replace(/^INV-/, '')}` : 'RCT-UNKNOWN');
  doc.save(`${pdfReceiptNumber}.pdf`);
}
export async function downloadTrialBalancePDF(
  items: { code: string; name: string; type: string; debit: number; credit: number; balance: number }[],
  periodLabel: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  doc.setFillColor(2, 33, 142);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Trial Balance', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${periodLabel}`, pageWidth - margin, 16, { align: 'right' });
  doc.setTextColor(50, 50, 50);
  const startY = 35;
  let y = startY;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Code', margin, y);
  doc.text('Name', margin + 30, y);
  doc.text('Debit', pageWidth - margin - 50, y, { align: 'right' });
  doc.text('Credit', pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 6;
  let totalDebit = 0;
  let totalCredit = 0;
  for (const i of items) {
    totalDebit += i.debit;
    totalCredit += i.credit;
    doc.text(i.code, margin, y);
    const name = i.name.length > 40 ? i.name.slice(0, 37) + '…' : i.name;
    doc.text(name, margin + 30, y);
    doc.text(i.debit.toFixed(2), pageWidth - margin - 50, y, { align: 'right' });
    doc.text(i.credit.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
    if (y > doc.internal.pageSize.height - 20) {
      doc.addPage();
      y = startY;
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.text('Totals', margin, y + 4);
  doc.text(totalDebit.toFixed(2), pageWidth - margin - 50, y + 4, { align: 'right' });
  doc.text(totalCredit.toFixed(2), pageWidth - margin, y + 4, { align: 'right' });
  doc.save('trial-balance.pdf');
}

export async function downloadProfitLossPDF(
  revenues: { code: string; name: string; amount: number }[],
  expenses: { code: string; name: string; amount: number }[],
  totals: { revenue: number; expense: number; netIncome: number },
  periodLabel: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  doc.setFillColor(2, 33, 142);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Profit & Loss', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${periodLabel}`, pageWidth - margin, 16, { align: 'right' });
  doc.setTextColor(50, 50, 50);
  let y = 35;
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  revenues.forEach(r => {
    doc.text(r.code, margin, y);
    const name = r.name.length > 40 ? r.name.slice(0, 37) + '…' : r.name;
    doc.text(name, margin + 30, y);
    doc.text(r.amount.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Revenue', margin, y);
  doc.text(totals.revenue.toFixed(2), pageWidth - margin, y, { align: 'right' });
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Expenses', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  expenses.forEach(e => {
    doc.text(e.code, margin, y);
    const name = e.name.length > 40 ? e.name.slice(0, 37) + '…' : e.name;
    doc.text(name, margin + 30, y);
    doc.text(e.amount.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Expense', margin, y);
  doc.text(totals.expense.toFixed(2), pageWidth - margin, y, { align: 'right' });
  y += 10;
  doc.text('Net Income', margin, y);
  doc.text(totals.netIncome.toFixed(2), pageWidth - margin, y, { align: 'right' });
  doc.save('profit-loss.pdf');
}

export async function downloadBalanceSheetPDF(
  assets: { code: string; name: string; balance: number }[],
  liabilities: { code: string; name: string; balance: number }[],
  equity: { code: string; name: string; balance: number }[],
  dateLabel: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  doc.setFillColor(2, 33, 142);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Balance Sheet', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(dateLabel, pageWidth - margin, 16, { align: 'right' });
  doc.setTextColor(50, 50, 50);
  let y = 35;
  doc.setFont('helvetica', 'bold');
  doc.text('Assets', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  let totalAssets = 0;
  assets.forEach(a => {
    totalAssets += a.balance;
    doc.text(a.code, margin, y);
    const name = a.name.length > 40 ? a.name.slice(0, 37) + '…' : a.name;
    doc.text(name, margin + 30, y);
    doc.text(a.balance.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Assets', margin, y);
  doc.text(totalAssets.toFixed(2), pageWidth - margin, y, { align: 'right' });
  y += 10;
  doc.text('Liabilities', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  let totalLiabilities = 0;
  liabilities.forEach(l => {
    totalLiabilities += l.balance;
    doc.text(l.code, margin, y);
    const name = l.name.length > 40 ? l.name.slice(0, 37) + '…' : l.name;
    doc.text(name, margin + 30, y);
    doc.text(l.balance.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Liabilities', margin, y);
  doc.text(totalLiabilities.toFixed(2), pageWidth - margin, y, { align: 'right' });
  y += 10;
  doc.text('Equity', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  let totalEquity = 0;
  equity.forEach(e => {
    totalEquity += e.balance;
    doc.text(e.code, margin, y);
    const name = e.name.length > 40 ? e.name.slice(0, 37) + '…' : e.name;
    doc.text(name, margin + 30, y);
    doc.text(e.balance.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Equity', margin, y);
  doc.text(totalEquity.toFixed(2), pageWidth - margin, y, { align: 'right' });
  y += 8;
  doc.text('Liabilities + Equity', margin, y);
  doc.text((totalLiabilities + totalEquity).toFixed(2), pageWidth - margin, y, { align: 'right' });
  doc.save('balance-sheet.pdf');
}

export async function downloadCashFlowPDF(
  items: { code: string; name: string; delta: number }[],
  total: number,
  periodLabel: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  doc.setFillColor(2, 33, 142);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Cash Flow', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${periodLabel}`, pageWidth - margin, 16, { align: 'right' });
  doc.setTextColor(50, 50, 50);
  let y = 35;
  doc.setFont('helvetica', 'bold');
  doc.text('Net Change in Cash', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  items.forEach(i => {
    doc.text(i.code, margin, y);
    const name = i.name.length > 40 ? i.name.slice(0, 37) + '…' : i.name;
    doc.text(name, margin + 30, y);
    doc.text(i.delta.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += 6;
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Total', margin, y);
  doc.text(total.toFixed(2), pageWidth - margin, y, { align: 'right' });
  doc.save('cash-flow.pdf');
}
