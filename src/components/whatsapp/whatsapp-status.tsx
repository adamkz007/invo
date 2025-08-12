'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'pending';

interface WhatsAppStatusProps {
  status?: WhatsAppMessageStatus;
  lastSent?: Date;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function WhatsAppStatus({
  status,
  lastSent,
  className,
  showIcon = true,
  showText = true
}: WhatsAppStatusProps) {
  if (!status && !lastSent) {
    return null;
  }
  
  const getStatusConfig = (status: WhatsAppMessageStatus) => {
    switch (status) {
      case 'sent':
        return {
          icon: Check,
          text: 'Sent',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'delivered':
        return {
          icon: CheckCheck,
          text: 'Delivered',
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600'
        };
      case 'read':
        return {
          icon: CheckCheck,
          text: 'Read',
          color: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
          iconColor: 'text-[#25D366]'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Failed',
          color: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: MessageCircle,
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };
  
  if (!status && lastSent) {
    return (
      <Badge variant="outline" className={cn('text-xs', className)}>
        {showIcon && <MessageCircle className="h-3 w-3 mr-1 text-current" />}
        {showText && `Sent ${lastSent.toLocaleDateString()}`}
      </Badge>
    );
  }
  
  if (!status) return null;
  
  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs border',
        config.color,
        className
      )}
    >
      {showIcon && <IconComponent className={cn('h-3 w-3', config.iconColor, showText && 'mr-1')} />}
      {showText && config.text}
    </Badge>
  );
}

// WhatsApp message history item component
interface WhatsAppMessageItemProps {
  message: string;
  sentAt: Date;
  status: WhatsAppMessageStatus;
  type: 'invoice' | 'receipt' | 'followup' | 'custom';
  className?: string;
}

export function WhatsAppMessageItem({
  message,
  sentAt,
  status,
  type,
  className
}: WhatsAppMessageItemProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'invoice':
        return { label: 'Invoice', color: 'text-blue-600' };
      case 'receipt':
        return { label: 'Receipt', color: 'text-green-600' };
      case 'followup':
        return { label: 'Follow-up', color: 'text-orange-600' };
      case 'custom':
        return { label: 'Message', color: 'text-purple-600' };
      default:
        return { label: 'Message', color: 'text-gray-600' };
    }
  };
  
  const typeConfig = getTypeConfig(type);
  
  return (
    <div className={cn('p-3 border rounded-lg bg-white', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-current" />
          <span className={cn('text-sm font-medium', typeConfig.color)}>
            {typeConfig.label}
          </span>
        </div>
        <WhatsAppStatus status={status} showText={false} />
      </div>
      
      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
        {message}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{sentAt.toLocaleString()}</span>
        <WhatsAppStatus status={status} showIcon={false} />
      </div>
    </div>
  );
}

// WhatsApp message history list
interface WhatsAppMessageHistoryProps {
  messages: Array<{
    id: string;
    message: string;
    sentAt: Date;
    status: WhatsAppMessageStatus;
    type: 'invoice' | 'receipt' | 'followup' | 'custom';
  }>;
  className?: string;
  emptyMessage?: string;
}

export function WhatsAppMessageHistory({
  messages,
  className,
  emptyMessage = 'No WhatsApp messages sent yet'
}: WhatsAppMessageHistoryProps) {
  if (messages.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      {messages.map((message) => (
        <WhatsAppMessageItem
          key={message.id}
          message={message.message}
          sentAt={message.sentAt}
          status={message.status}
          type={message.type}
        />
      ))}
    </div>
  );
}