'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidWhatsAppNumber, getWhatsAppDisplayNumber, generateFollowUpMessage } from '@/lib/whatsapp';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface WhatsAppButtonProps {
  phoneNumber: string;
  whatsappUrl: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  showPhoneNumber?: boolean;
  icon?: 'message' | 'phone';
}

export function WhatsAppButton({
  phoneNumber,
  whatsappUrl,
  variant = 'default',
  size = 'default',
  className,
  children,
  disabled = false,
  showPhoneNumber = false,
  icon = 'message'
}: WhatsAppButtonProps) {
  const isValidNumber = isValidWhatsAppNumber(phoneNumber);
  const displayNumber = getWhatsAppDisplayNumber(phoneNumber);
  
  const handleClick = () => {
    if (!isValidNumber || disabled) return;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  const IconComponent = icon === 'phone' ? Phone : MessageCircle;
  
  const buttonContent = children || (
    <>
      <IconComponent className="h-4 w-4 text-current" />
      {size !== 'icon' && (
        <span className="ml-2">
          {showPhoneNumber ? displayNumber : 'WhatsApp'}
        </span>
      )}
    </>
  );
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'bg-[#25D366] hover:bg-[#20BA5A] text-white border-[#25D366] hover:border-[#20BA5A]',
        'transition-all duration-200 ease-in-out',
        'disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed',
        variant === 'outline' && 'bg-transparent text-[#25D366] hover:bg-[#25D366] hover:text-white',
        variant === 'ghost' && 'bg-transparent text-[#25D366] hover:bg-[#25D366]/10',
        variant === 'link' && 'bg-transparent text-[#25D366] hover:text-[#20BA5A] underline-offset-4',
        className
      )}
      onClick={handleClick}
      disabled={disabled || !isValidNumber}
      title={!isValidNumber ? 'Invalid phone number' : `Send WhatsApp message to ${displayNumber}`}
    >
      {buttonContent}
    </Button>
  );
}

// Specialized WhatsApp button variants
export function WhatsAppInvoiceButton({
  phoneNumber,
  whatsappUrl,
  className,
  ...props
}: Omit<WhatsAppButtonProps, 'children'>) {
  return (
    <WhatsAppButton
      phoneNumber={phoneNumber}
      whatsappUrl={whatsappUrl}
      className={className}
      {...props}
    >
      <MessageCircle className="h-4 w-4 text-current" />
      <span className="ml-2">Send Invoice</span>
    </WhatsAppButton>
  );
}

export function WhatsAppReceiptButton({
  phoneNumber,
  whatsappUrl,
  className,
  ...props
}: Omit<WhatsAppButtonProps, 'children'>) {
  return (
    <WhatsAppButton
      phoneNumber={phoneNumber}
      whatsappUrl={whatsappUrl}
      className={className}
      {...props}
    >
      <MessageCircle className="h-4 w-4 text-current" />
      <span className="ml-2">Send Receipt</span>
    </WhatsAppButton>
  );
}

interface WhatsAppFollowUpButtonProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    dueDate: Date;
    customer: {
      name: string;
      phone?: string;
    };
  };
  companyDetails: {
    name: string;
  };
  reminderType: 'gentle' | 'urgent' | 'final';
  asDropdownItem?: boolean;
  className?: string;
}

export function WhatsAppFollowUpButton({
  invoice,
  companyDetails,
  reminderType,
  asDropdownItem = false,
  className
}: WhatsAppFollowUpButtonProps) {
  if (!invoice.customer.phone) return null;

  const message = generateFollowUpMessage({
    customerName: invoice.customer.name,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.total,
    dueDate: invoice.dueDate,
    companyName: companyDetails.name,
    reminderType
  });

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${invoice.customer.phone.replace(/[^\d]/g, '')}&text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const getReminderLabel = () => {
    switch (reminderType) {
      case 'gentle':
        return 'Send Gentle Reminder';
      case 'urgent':
        return 'Send Urgent Reminder';
      case 'final':
        return 'Send Final Notice';
      default:
        return 'Send Reminder';
    }
  };

  if (asDropdownItem) {
    return (
      <DropdownMenuItem onSelect={handleClick}>
        <MessageCircle className="mr-2 h-4 w-4 text-current" />
        {getReminderLabel()}
      </DropdownMenuItem>
    );
  }

  return (
    <WhatsAppButton
      phoneNumber={invoice.customer.phone}
      whatsappUrl={whatsappUrl}
      className={className}
    >
      <MessageCircle className="h-4 w-4 text-current" />
      <span className="ml-2">{getReminderLabel()}</span>
    </WhatsAppButton>
  );
}

export function WhatsAppContactButton({
  phoneNumber,
  whatsappUrl,
  showPhoneNumber = true,
  className,
  ...props
}: Omit<WhatsAppButtonProps, 'children'>) {
  return (
    <WhatsAppButton
      phoneNumber={phoneNumber}
      whatsappUrl={whatsappUrl}
      showPhoneNumber={showPhoneNumber}
      className={className}
      {...props}
    >
      <MessageCircle className="h-4 w-4 text-current" />
      {showPhoneNumber && (
        <span className="ml-2">{getWhatsAppDisplayNumber(phoneNumber)}</span>
      )}
      {!showPhoneNumber && <span className="ml-2">WhatsApp</span>}
    </WhatsAppButton>
  );
}