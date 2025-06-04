
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, User, Fingerprint, Mail, Phone, Send, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { format, getDay as getDayOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '../ui/spinner';

const visitRequestSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  rut: z.string().min(8, { message: 'Ingresa un RUT válido (ej: 12345678-9).' }).regex(/^[0-9]{7,8}-[0-9Kk]$/, { message: 'Formato de RUT inválido (ej: 12345678-9).' }),
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

export function VisitRequestDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
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

  useEffect(() => {
    if (selectedDate) {
      setAvailableTimes(generateTimeSlots(selectedDate));
      form.setValue('visitTime', ''); // Reset time when date changes
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, form]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof VisitRequestFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'rut'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['email', 'phone'];
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
    form.reset();
    setCurrentStep(1);
    onOpenChange(false);
  }

  async function onSubmit(values: VisitRequestFormValues) {
    setIsLoading(true);
    console.log('Visit Request Submitted:', {
      propertyId,
      propertyTitle,
      ...values,
      visitDate: format(values.visitDate, "yyyy-MM-dd"),
      visitTime: values.visitTime,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Solicitud de Visita Enviada',
      description: `Hemos recibido tu solicitud para visitar "${propertyTitle}" el ${format(values.visitDate, "PPP", {locale: es})} a las ${values.visitTime}. Nos pondremos en contacto. (Simulado)`,
    });
    setIsLoading(false);
    resetFormAndClose();
  }

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
          <DialogTitle className="text-2xl">Agendar Visita (Paso {currentStep} de 3)</DialogTitle>
          <DialogDescription>
            Completa tus datos para visitar: <span className="font-semibold">{propertyTitle}</span>.
          </DialogDescription>
        </DialogHeader>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUT</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Ej: 12345678-9" {...field} className="pl-10" />
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

            {currentStep === 3 && (
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
                <FormField
                  control={form.control}
                  name="visitTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Visita</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={availableTimes.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Selecciona una hora" className="pl-10" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTimes.length > 0 ? (
                            availableTimes.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-slots" disabled>
                              No hay horarios disponibles para esta fecha.
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter className="pt-4 flex flex-row justify-between sm:justify-between w-full">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}
              {currentStep < 3 && (
                <Button type="button" onClick={handleNextStep} disabled={isLoading} className={currentStep === 1 ? 'w-full' : ''}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {currentStep === 3 && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="small" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                  Solicitar Visita
                </Button>
              )}
              {currentStep === 1 && ( // Placeholder for Cancel button to maintain layout
                <DialogClose asChild>
                   <Button type="button" variant="ghost" className="invisible w-0 p-0 md:visible md:w-auto md:px-4 md:py-2">Cancelar</Button>
                </DialogClose>
              )}
            </DialogFooter>
             {currentStep === 1 && (
                <DialogClose asChild>
                   <Button type="button" variant="outline" className="w-full md:hidden mt-2">Cancelar</Button>
                </DialogClose>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

