
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// RadioGroup and RadioGroupItem are no longer needed
import { useToast } from '@/hooks/use-toast';
import { signUp } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';
import { Spinner } from '@/components/ui/spinner';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string().min(6, { message: 'La confirmación de contraseña debe tener al menos 6 caracteres.' }),
  displayName: z.string().optional(),
  // Role is no longer part of the form schema for user input
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      // Default role is implicitly 'arrendatario' now
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signUp({ 
        email: values.email, 
        password_RAW_VALUE_NEVER_LOG_THIS_OR_STORE_THIS_VARIABLE_except_in_memory: values.password, 
        role: 'arrendatario', // Role is hardcoded to 'arrendatario'
        displayName: values.displayName
      });
      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta de arrendatario ha sido creada. Serás redirigido.',
      });
      router.push('/'); // Redirect to home or dashboard
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: 'Error en el registro',
        description: error.message || 'Ocurrió un error al crear tu cuenta. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Role selection RadioGroup is removed */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner size="small" className="mr-2"/> : null}
          Registrarse como Arrendatario
        </Button>
      </form>
    </Form>
  );
}
