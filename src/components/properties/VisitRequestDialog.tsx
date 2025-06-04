
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
// Calendar component is no longer directly used in the main UI for date picking
import { cn } from '@/lib/utils';
import { User, Fingerprint, Mail, Phone, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, getDay as getDayOfWeek, addDays, isSameDay, startOfDay } from 'date-fns';
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
  } else { 
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
  let cleaned = value.replace(/[^0-9kK]/gi, '').toUpperCase();
  if (cleaned.length === 0) return '';

  let body = cleaned.slice(0, -1);
  let verifier = cleaned.slice(-1);
  
  if (cleaned.length > 9) {
    body = cleaned.substring(0, cleaned.length -1);
    verifier = cleaned.substring(cleaned.length-1);
  }
  
  if (body.length > 8) {
    body = body.substring(0, 8);
  }
  
  if (!/^[0-9K]$/.test(verifier) && cleaned.length <= 8) {
    body = cleaned;
    verifier = '';
  } else if (!/^[0-9K]$/.test(verifier) && cleaned.length > 8) {
     body = cleaned.substring(0,8);
     verifier = '';
  }

  if (body.length > 0 && verifier) {
    return `${body}-${verifier}`;
  }
  return cleaned;
};

const generateSelectableDates = (daysToShow: number): Date[] => {
  const dates: Date[] = [];
  let currentDate = startOfDay(new Date());
  let daysAdded = 0;

  while (daysAdded < daysToShow) {
    if (getDayOfWeek(currentDate) !== 0) { // Skip Sundays (0 is Sunday)
      dates.push(currentDate);
      daysAdded++;
    }
    currentDate = addDays(currentDate, 1);
  }
  return dates;
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

  const selectableDates = generateSelectableDates(14); // Generate 14 schedulable days

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
      form.setValue('visitTime', '', {shouldValidate: currentStep === 2}); 
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, form, currentStep]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof VisitRequestFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'rut', 'email', 'phone'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const resetFormAndClose = () => {
    form.reset({
      firstName: '',
      lastName: '',
      rut: '',
      email: '',
      phone: '',
      visitDate: undefined,
      visitTime: '',
    });
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
      rut: values.rut.toUpperCase(), 
      visitDate: format(values.visitDate, "yyyy-MM-dd"),
      visitTime: values.visitTime,
    });

    await new Promise(resolve => setTimeout(resolve, 1500)); 

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
    form.setValue('rut', formatted, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetFormAndClose();
        } else {
            onOpenChange(true); // Ensure dialog opens if prop changes
        }
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agendar Visita</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && `Paso 1 de 2: Ingresa tus datos para visitar: "${propertyTitle}"`}
            {currentStep === 2 && `Paso 2 de 2: Elige la fecha y hora para tu visita a: "${propertyTitle}"`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(100vh-20rem)] sm:max-h-[70vh] pr-2 -mr-2 sm:pr-3 sm:-mr-3custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              {currentStep === 1 && (
                <>
                  <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>Nombre</FormLabel> <FormControl> <div className="relative"> <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="Ej: Juan" {...field} className="pl-10" /> </div> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Apellido</FormLabel> <FormControl> <div className="relative"> <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="Ej: Pérez" {...field} className="pl-10" /> </div> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="rut" render={({ field }) => ( <FormItem> <FormLabel>RUT</FormLabel> <FormControl> <div className="relative"> <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="Ej: 12345678-9" {...field} onChange={handleRutInputChange} value={field.value} className="pl-10" maxLength={10} /> </div> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Número de Celular</FormLabel> <FormControl> <div className="relative"> <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input type="tel" placeholder="Ej: +56912345678" {...field} className="pl-10" /> </div> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Correo Electrónico</FormLabel> <FormControl> <div className="relative"> <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input type="email" placeholder="tu@email.com" {...field} className="pl-10" /> </div> </FormControl> <FormMessage /> </FormItem> )} />
                </>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Date Capsule Picker */}
                  <div className="md:w-1/2 lg:w-2/5 space-y-3">
                    <FormLabel className="block">Fecha de Visita</FormLabel>
                     <div className="flex overflow-x-auto space-x-2 pb-2 custom-scrollbar-thin -ml-1 pl-1">
                      {selectableDates.map((date) => (
                        <Button
                          key={date.toISOString()}
                          type="button"
                          variant={selectedDate && isSameDay(selectedDate, date) ? 'default' : 'outline'}
                          onClick={() => {
                            form.setValue('visitDate', date, { shouldValidate: true });
                          }}
                          className="flex flex-col items-center justify-center p-2.5 h-auto min-w-[64px] rounded-lg shadow-sm flex-shrink-0"
                        >
                          <span className="text-xs uppercase font-medium">
                            {format(date, 'E', { locale: es })}
                          </span>
                          <span className="text-xl font-bold block my-0.5">
                            {format(date, 'd', { locale: es })}
                          </span>
                          <span className="text-xs uppercase font-medium text-muted-foreground">
                            {format(date, 'MMM', { locale: es })}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="visitDate"
                      render={() => ( <FormItem className="h-0 !mt-0 invisible"><FormMessage /></FormItem>)} // For error display
                    />
                  </div>
                  
                  {/* Time Slot Picker */}
                  <div className="flex-1 md:w-1/2 lg:w-3/5">
                    {selectedDate ? (
                      <>
                        <FormLabel className="mb-2 block text-sm">
                          Horarios para {format(selectedDate, "PPP", { locale: es })}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground mb-2">Horarios en zona horaria de Chile.</p>
                        {availableTimes.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto py-1 pr-1 custom-scrollbar">
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
                                {time.split(' - ')[0]} 
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground text-center py-2">No hay horarios disponibles para este día. Por favor, elige otra fecha.</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 border rounded-md bg-muted/50 min-h-[150px] md:min-h-[200px]">
                        Selecciona una fecha de la lista para ver los horarios disponibles.
                      </div>
                    )}
                     <FormField
                        control={form.control}
                        name="visitTime"
                        render={() => ( <FormItem className="h-0 !mt-0 invisible"><FormMessage /></FormItem>)}
                    />
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div> 
        
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
                className={cn(currentStep === 1 ? 'w-full sm:w-auto ml-auto' : '')}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading || !selectedTime || !selectedDate }>
              {isLoading ? <Spinner size="small" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Confirmar Visita
            </Button>
          )}
          {currentStep === 1 && !isLoading && ( 
              <DialogClose asChild className="hidden sm:inline-flex">
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
          )}
        </DialogFooter>
          {currentStep === 1 && ( 
              <DialogClose asChild className="sm:hidden">
                <Button type="button" variant="outline" className="w-full mt-2">Cancelar</Button>
              </DialogClose>
          )}
      </DialogContent>
    </Dialog>
  );
}
