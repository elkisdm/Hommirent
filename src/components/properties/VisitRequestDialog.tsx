
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, User, Fingerprint, Mail, Phone, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, getDay as getDayOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '../ui/spinner';

const visitRequestSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  rut: z.string().min(9, { message: 'Ingresa un RUT válido (ej: 12345678-9).' }).regex(/^[0-9]{7,8}-[0-9Kk]$/, { message: 'Formato de RUT inválido (ej: 12.345.678-9).' }),
  email: z.string().email({ message: 'Ingresa un correo electrónico válido.' }),
  phone: z.string().min(9, { message: 'El número de celular debe tener al menos 9 dígitos.' }).regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, { message: "Número de celular inválido."}),
  visitDate: z.date({ required_error: 'Por favor, selecciona una fecha para la visita.' }),
  visitTime: z.string({ required_error: 'Por favor, selecciona una hora para la visita.' }),
});

type VisitRequestFormValues = z.infer<typeof visitRequestSchema>;

interface VisitRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  onVisitSuccessfullyRequested?: (details: { date: Date; time: string }) => void;
}

const generateTimeSlots = (selectedDate: Date | undefined): string[] => {
  if (!selectedDate) return [];

  const day = getDayOfWeek(selectedDate); // 0 (Sunday) to 6 (Saturday)
  const slots: string[] = [];
  let startHour = 0;
  let endHour = 0;

  if (day >= 1 && day <= 5) { // Monday to Friday
    startHour = 9;
    endHour = 20;
  } else if (day === 6) { // Saturday
    startHour = 10;
    endHour = 18;
  } else { // Sunday or invalid day
    return [];
  }

  for (let i = startHour; i < endHour; i++) {
    const startTime = `${String(i).padStart(2, '0')}:00`;
    const endTime = `${String(i + 1).padStart(2, '0')}:00`;
    slots.push(`${startTime} - ${endTime}`);
  }
  return slots;
};

const formatRutOnInput = (value: string): string => {
  if (!value) return '';

  // Remove any character that is not a digit or 'K' (case-insensitive)
  let cleaned = value.replace(/[^0-9kK]/gi, '').toUpperCase();

  if (cleaned.length === 0) return '';

  // Limit total characters (max 8 for body, 1 for verifier)
  if (cleaned.length > 9) {
    cleaned = cleaned.substring(0, 9);
  }

  let body = cleaned;
  let verifier = '';

  // Check if the last character could be a verifier
  if (cleaned.length > 1 && /^[0-9K]$/.test(cleaned.slice(-1))) {
    body = cleaned.slice(0, -1);
    verifier = cleaned.slice(-1);
  } else if (cleaned.length > 8 && !/^[0-9K]$/.test(cleaned.slice(-1))) {
    // If more than 8 chars and last is not K/digit, it's likely part of body, so cap body
    body = cleaned.substring(0,8);
    verifier = ''; // No valid verifier yet
  }


  if (verifier) {
    return `${body}-${verifier}`;
  }
  return body; // Return only body if no verifier or still typing body
};


export function VisitRequestDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  onVisitSuccessfullyRequested,
}: VisitRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<VisitRequestFormValues>({
    resolver: zodResolver(visitRequestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      rut: '',
      email: '',
      phone: '',
      visitDate: undefined,
      visitTime: '',
    },
  });

  const selectedDate = form.watch('visitDate');
  const selectedTime = form.watch('visitTime');

  useEffect(() => {
    if (selectedDate) {
      setAvailableTimes(generateTimeSlots(selectedDate));
      form.setValue('visitTime', '', {shouldValidate: false}); // Reset time when date changes
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, form]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof VisitRequestFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'rut', 'email', 'phone'];
    }
    // Step 2 fields (visitDate, visitTime) are validated on final submit

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const resetFormAndClose = () => {
    form.reset();
    setCurrentStep(1);
    setAvailableTimes([]);
    onOpenChange(false);
  }

  async function onSubmit(values: VisitRequestFormValues) {
    setIsLoading(true);
    console.log('Visit Request Submitted:', {
      propertyId,
      propertyTitle,
      ...values,
      rut: values.rut.toUpperCase(), // Ensure RUT is uppercase
      visitDate: format(values.visitDate, "yyyy-MM-dd"),
      visitTime: values.visitTime,
    });

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    toast({
      title: 'Solicitud de Visita Enviada',
      description: `Hemos recibido tu solicitud para visitar "${propertyTitle}" el ${format(values.visitDate, "PPP", {locale: es})} a las ${values.visitTime.split(" - ")[0]}. Nos pondremos en contacto. (Simulado)`,
    });
    
    if (onVisitSuccessfullyRequested) {
        onVisitSuccessfullyRequested({date: values.visitDate, time: values.visitTime});
    }
    setIsLoading(false);
    resetFormAndClose();
  }
  
  const handleRutInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRutOnInput(event.target.value);
    form.setValue('rut', formatted, { shouldValidate: true }); // Update form value and trigger validation
  };


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetFormAndClose();
        } else {
            onOpenChange(true);
        }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agendar Visita (Paso {currentStep} de 2)</DialogTitle>
          <DialogDescription>
            Completa tus datos para visitar: <span className="font-semibold">{propertyTitle}</span>.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Form Content Area */}
        <div className="overflow-y-auto max-h-[calc(100vh-20rem)] sm:max-h-[60vh] pr-2 -mr-2 sm:pr-3 sm:-mr-3custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej: Juan" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej: Pérez" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rut"
                    render={({ field }) => ( // field does not include onChange here if we override
                      <FormItem>
                        <FormLabel>RUT</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Ej: 12345678-9" 
                              {...field} 
                              onChange={handleRutInputChange} // Use custom handler
                              value={field.value} // Ensure value is controlled
                              className="pl-10" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Celular</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="tel" placeholder="Ej: +56912345678" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="email" placeholder="tu@email.com" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Visita</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: es })
                                ) : (
                                  <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate())) || getDayOfWeek(date) === 0} // Disable past dates and Sundays
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedDate && availableTimes.length > 0 && (
                    <div className="mt-1">
                      <FormLabel className="mb-2 block text-sm">Hora Disponible para {format(selectedDate, "PPP", { locale: es })}</FormLabel>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto py-1 pr-1">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => {
                              form.setValue('visitTime', time, { shouldValidate: true });
                            }}
                            className="w-full justify-center text-sm h-9"
                          >
                            {time.split(' - ')[0]} {/* Show only start time */}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedDate && availableTimes.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground text-center py-2">No hay horarios disponibles para este día. Por favor, elige otra fecha.</p>
                  )}
                  {/* Hidden FormField for visitTime to show validation errors if any */}
                  <FormField
                      control={form.control}
                      name="visitTime"
                      render={() => (
                          <FormItem className="h-0 !mt-0 invisible">
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                </>
              )}
            </form>
          </Form>
        </div> {/* End Scrollable Form Content Area */}
        
        <DialogFooter className="pt-4 mt-auto flex flex-row justify-between sm:justify-between w-full">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
          )}
          {currentStep < 2 && (
            <Button 
                type="button" 
                onClick={handleNextStep} 
                disabled={isLoading} 
                className={currentStep === 1 ? 'w-full sm:w-auto ml-auto' : ''} // Full width on mobile for step 1, auto on others
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading || !selectedTime }>
              {isLoading ? <Spinner size="small" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Solicitar Visita
            </Button>
          )}
          {currentStep === 1 && !isLoading && ( // Show cancel button only on step 1 if not loading
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="hidden sm:inline-flex">Cancelar</Button>
              </DialogClose>
          )}
        </DialogFooter>
          {currentStep === 1 && ( // Full width cancel button for mobile on step 1
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full mt-2 sm:hidden">Cancelar</Button>
              </DialogClose>
          )}
      </DialogContent>
    </Dialog>
  );
}

