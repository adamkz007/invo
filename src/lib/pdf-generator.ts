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
    
    img.onload = () => {
      logoCache.set(keyObj, img);
      resolve(img);
    };
    
    img.onerror = (err) => {
      logoKeyMap.delete(logoUrl); // Clean up on error
      reject(err);
    };
    
    img.src = logoUrl;
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
function createTextLogo(doc: jsPDF, x: number, y: number): void {
  // Create a blue circle
  doc.setFillColor(0, 51, 153); // Dark blue circle
  doc.circle(x - 35, y - 1, 4, 'F');
  
  // Add "I" in the circle
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('I', x - 35, y, { align: 'center' });
  
  // Add "Powered by Invo" text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Powered by Invo', x, y, { align: 'right' });
}

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
    case 'PARTIAL':
      doc.setFillColor(254, 243, 199); // Light amber/yellow
      doc.setTextColor(146, 64, 14); // Dark amber/yellow
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
    case 'CANCELLED':
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
  termsLines.forEach((line: string, index: number) => {
    doc.text(line, margin, termsY + 8 + (index * 6));
  });
  
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
  
  try {
    // In a browser environment, load the logo
    const logoUrl = window.location.origin + '/invo-logo.png';
    
    // Use the cached logo loading function
    const img = await loadLogoImage(logoUrl);
    
    // Add the logo to the PDF
    doc.addImage(img, 'PNG', pageWidth - margin - 40, footerY - 5, 8, 8);
    
    // Add "Powered by Invo" text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Powered by Invo', pageWidth - margin, footerY, { align: 'right' });
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    // Fallback to text-based logo
    createTextLogo(doc, pageWidth - margin, footerY);
  }
  
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
  
  if (companyDetails?.address) {
    const addressLines = companyDetails.address.split('\n');
    addressLines.forEach(line => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
    });
  } else {
    doc.text('2334, Fish and Chips Street', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('New Hill, SC, 34566-454646', pageWidth / 2, yPos, { align: 'center' });
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
  
  invoice.items.forEach(item => {
    const quantityText = item.quantity.toString();
    const priceText = formatCurrency(item.unitPrice * item.quantity, settings);
    const itemName = item.description || item.product?.name || 'Item';
    
    // Handle long item names by wrapping if needed
    if (itemName.length > 15) {
      doc.text(quantityText, margin, yPos);
      
      const lines = doc.splitTextToSize(itemName, pageWidth - margin - 18);
      doc.text(lines[0], margin + 8, yPos);
      
      doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });
      
      // If there are more lines, add them
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          yPos += 4;
          doc.text(lines[i], margin + 8, yPos);
        }
      }
    } else {
      doc.text(quantityText, margin, yPos);
      doc.text(itemName, margin + 8, yPos);
      doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });
    }
    
    yPos += 6;
  });
  
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
    const logoUrl = window.location.origin + '/invo-logo.png';
    
    // Use the cached logo loading function
    const img = await loadLogoImage(logoUrl);
    
    // Add a small logo and "Powered by Invo" text at the bottom
    doc.addImage(img, 'PNG', pageWidth / 2 - 10, yPos - 2, 4, 4);
    doc.text('Powered by Invo', pageWidth / 2 + 2, yPos, { align: 'left' });
  } catch (error) {
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
