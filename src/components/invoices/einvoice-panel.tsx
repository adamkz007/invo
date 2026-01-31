'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface EInvoiceReadiness {
  isReady: boolean;
  errors: { field: string; message: string; category: string }[];
  warnings: { field: string; message: string; category: string }[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    byCategory: Record<string, number>;
  };
}

interface EInvoiceDocument {
  id: string;
  status: 'PENDING' | 'SUBMITTED' | 'VALID' | 'INVALID' | 'CANCELLED';
  submissionId: string | null;
  myinvoisDocumentId: string | null;
  myinvoisLongId: string | null;
  validationErrors: string | null;
  submittedAt: string | null;
  validatedAt: string | null;
  createdAt: string;
}

interface EInvoiceState {
  invoiceId: string;
  latestDocument: EInvoiceDocument | null;
  allDocuments: EInvoiceDocument[];
  readiness: EInvoiceReadiness;
}

interface Props {
  invoiceId: string;
  invoiceStatus: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock },
  SUBMITTED: { label: 'Submitted', variant: 'default', icon: Send },
  VALID: { label: 'Valid', variant: 'default', icon: CheckCircle },
  INVALID: { label: 'Invalid', variant: 'destructive', icon: XCircle },
  CANCELLED: { label: 'Cancelled', variant: 'outline', icon: XCircle },
};

export function EInvoicePanel({ invoiceId, invoiceStatus }: Props) {
  const [state, setState] = useState<EInvoiceState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEInvoiceState();
  }, [invoiceId]);

  async function fetchEInvoiceState() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/invoices/${invoiceId}/einvoice`);
      if (response.ok) {
        const data = await response.json();
        setState(data);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to fetch e-invoice state');
      }
    } catch (err) {
      console.error('Error fetching e-invoice state:', err);
      setError('Failed to fetch e-invoice state');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      // This will be implemented in Phase 4
      // For now, just show a message
      alert('E-Invoice submission will be available soon. This feature is under development.');
    } catch (err) {
      console.error('Error submitting e-invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-3 bg-muted/50 rounded-md">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading e-Invoice status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-destructive/10 rounded-md">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchEInvoiceState}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const { latestDocument, readiness } = state;
  const hasDocument = latestDocument !== null;
  const canSubmit = readiness.isReady && !hasDocument && invoiceStatus !== 'DRAFT' && invoiceStatus !== 'CANCELLED';

  // Get status display info
  const statusInfo = latestDocument ? statusConfig[latestDocument.status] : null;
  const StatusIcon = statusInfo?.icon || FileText;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="mt-4 border rounded-md overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  e-Invoice (LHDN)
                </span>
                {latestDocument && statusInfo && (
                  <Badge
                    variant={statusInfo.variant}
                    className={cn(
                      'text-xs',
                      latestDocument.status === 'VALID' && 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    )}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                )}
                {!latestDocument && !readiness.isReady && (
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {readiness.summary.totalErrors} issues
                  </Badge>
                )}
                {!latestDocument && readiness.isReady && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 border-t space-y-3">
            {/* Document Status */}
            {latestDocument && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Submitted: {latestDocument.submittedAt
                    ? new Date(latestDocument.submittedAt).toLocaleString()
                    : 'Pending submission'}
                </div>

                {latestDocument.myinvoisDocumentId && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Document ID: </span>
                    <code className="bg-muted px-1 rounded">{latestDocument.myinvoisDocumentId}</code>
                  </div>
                )}

                {latestDocument.myinvoisLongId && (
                  <div className="text-xs">
                    <a
                      href={`https://myinvois.hasil.gov.my/verify/${latestDocument.myinvoisLongId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Verify on MyInvois <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {latestDocument.status === 'INVALID' && latestDocument.validationErrors && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
                    <div className="font-medium text-destructive mb-1">Validation Errors:</div>
                    <ul className="list-disc list-inside text-destructive/80">
                      {JSON.parse(latestDocument.validationErrors).map((err: any, i: number) => (
                        <li key={i}>{err.message || err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Readiness Check */}
            {!hasDocument && (
              <div className="space-y-2">
                {readiness.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-destructive">Missing Requirements:</div>
                    <ul className="text-xs space-y-1">
                      {readiness.errors.slice(0, 5).map((error, i) => (
                        <li key={i} className="flex items-start gap-1 text-destructive/80">
                          <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{error.message}</span>
                        </li>
                      ))}
                      {readiness.errors.length > 5 && (
                        <li className="text-muted-foreground">
                          ... and {readiness.errors.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {readiness.warnings.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-yellow-600">Warnings:</div>
                    <ul className="text-xs space-y-1">
                      {readiness.warnings.slice(0, 3).map((warning, i) => (
                        <li key={i} className="flex items-start gap-1 text-yellow-600/80">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{warning.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {readiness.isReady && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>All requirements met. Ready to submit.</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {canSubmit && (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Submit to LHDN
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchEInvoiceState}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
