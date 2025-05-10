import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Define schema for form validation
const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters long' }),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  cityName?: string;
  stateName?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ cityName, stateName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: cityName && stateName 
        ? `I'm interested in senior living options in ${cityName}, ${stateName}.`
        : '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Send form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          cityName,
          stateName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
      
      // Show success toast
      toast({
        title: 'Message sent!',
        description: 'We have received your message and will contact you soon about senior living options.',
      });
      
      // Reset form
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error toast
      toast({
        title: 'Error sending message',
        description: 'There was a problem sending your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Get in Touch</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="w-full bg-white"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              {...register('lastName')}
              className="w-full bg-white"
              placeholder="Doe"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="w-full bg-white"
              placeholder="john.doe@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              Contact Number
            </label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full bg-white"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium">
            Message <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="message"
            {...register('message')}
            className="w-full h-32 bg-white"
            placeholder="Please let us know what information you're looking for..."
          />
          {errors.message && (
            <p className="text-red-500 text-sm">{errors.message.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;