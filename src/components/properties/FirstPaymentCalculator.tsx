
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import {
  format,
  addMonths,
  startOfMonth,
  getDaysInMonth,
  getDate, // Renamed from getDay to getDate as getDay returns day of the week
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale'; // For Spanish date formatting
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface FirstPaymentCalculatorProps {
  monthlyRent: number;
  currency: string;
  securityDepositMonths?: number;
}

interface PaymentDetails {
  startDate: Date;
  isProrated: boolean;
  proratedDays: number;
  proratedAmount: number;
  firstFullMonthRent: number;
  securityDeposit: number;
  totalFirstPayment: number;
  paymentMonth2: number; // Rent for the 2nd full month of tenancy
  paymentMonth3: number; // Rent for the 3rd full month of tenancy
  firstFullMonthLabel: string;
  secondMonthLabel: string;
  thirdMonthLabel: string;
}

export function FirstPaymentCalculator({
  monthlyRent,
  currency,
  securityDepositMonths = 1,
}: FirstPaymentCalculatorProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(addMonths(new Date(), 1)));
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(amount);
  };

  useEffect(() => {
    if (!startDate || !monthlyRent) {
      setPaymentDetails(null);
      return;
    }

    const dayOfStartDate = getDate(startDate); // Day of the month (1-31)
    const daysInStartMonth = getDaysInMonth(startDate);

    let proratedDays = 0;
    let proratedAmount = 0;
    let firstFullMonthRent = monthlyRent;
    let firstFullMonthDate = startDate;

    const isProrated = dayOfStartDate !== 1;

    if (isProrated) {
      proratedDays = daysInStartMonth - dayOfStartDate + 1;
      proratedAmount = (monthlyRent / daysInStartMonth) * proratedDays;
      firstFullMonthDate = startOfMonth(addMonths(startDate, 1));
    } else {
      // If starting on the 1st, the "first full month" is the start month itself.
      firstFullMonthDate = startDate;
    }
    
    const securityDeposit = securityDepositMonths * monthlyRent;
    const totalFirstPayment = proratedAmount + firstFullMonthRent + securityDeposit;

    const secondMonthOfTenancy = startOfMonth(addMonths(firstFullMonthDate, 1));
    const thirdMonthOfTenancy = startOfMonth(addMonths(firstFullMonthDate, 2));

    setPaymentDetails({
      startDate,
      isProrated,
      proratedDays,
      proratedAmount,
      firstFullMonthRent,
      securityDeposit,
      totalFirstPayment,
      paymentMonth2: monthlyRent,
      paymentMonth3: monthlyRent,
      firstFullMonthLabel: format(firstFullMonthDate, 'MMMM yyyy', { locale: es }),
      secondMonthLabel: format(secondMonthOfTenancy, 'MMMM yyyy', { locale: es }),
      thirdMonthLabel: format(thirdMonthOfTenancy, 'MMMM yyyy', { locale: es }),
    });
  }, [startDate, monthlyRent, securityDepositMonths]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Calculadora de Primer Pago</CardTitle>
        <CardDescription>Estima tu pago inicial y los siguientes meses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="start-date" className="mb-2 block font-medium">Fecha de Inicio del Arriendo</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={es}
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
              />
            </PopoverContent>
          </Popover>
        </div>

        {paymentDetails && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-primary mb-1">Primer Pago Estimado</h3>
              <p className="text-2xl font-bold">{formatCurrency(paymentDetails.totalFirstPayment)}</p>
            </div>
            
            <div className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">Desglose del Primer Pago:</p>
              {paymentDetails.isProrated && (
                <div className="flex justify-between">
                  <span>Pro-rata ({paymentDetails.proratedDays} días en {format(paymentDetails.startDate, 'MMMM', { locale: es })})</span>
                  <span>{formatCurrency(paymentDetails.proratedAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Renta {paymentDetails.isProrated ? "siguiente mes completo" : "primer mes completo"} ({paymentDetails.firstFullMonthLabel})</span>
                <span>{formatCurrency(paymentDetails.firstFullMonthRent)}</span>
              </div>
              <div className="flex justify-between">
                <span>Garantía ({securityDepositMonths} mes{securityDepositMonths !== 1 ? 'es' : ''})</span>
                <span>{formatCurrency(paymentDetails.securityDeposit)}</span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold">Comportamiento de Pago Próximos Meses</h3>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 text-muted-foreground">
                                <HelpCircle className="h-4 w-4"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <p className="text-xs">Esto muestra la renta mensual esperada para los meses siguientes al pago inicial.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>{paymentDetails.secondMonthLabel}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(paymentDetails.paymentMonth2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{paymentDetails.thirdMonthLabel}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(paymentDetails.paymentMonth3)}</span>
                </div>
              </div>
            </div>
             <p className="text-xs text-muted-foreground pt-2">
                * Esta es una estimación. El valor final puede variar y no incluye otros costos como comisiones o gastos notariales.
             </p>
          </div>
        )}
         {!paymentDetails && monthlyRent > 0 && (
            <p className="text-sm text-muted-foreground">Selecciona una fecha de inicio para ver la estimación.</p>
        )}
        {!monthlyRent && (
            <p className="text-sm text-destructive">No se pudo cargar el precio de la propiedad para la calculadora.</p>
        )}
      </CardContent>
    </Card>
  );
}
