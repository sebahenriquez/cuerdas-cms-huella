
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const pressKitSchema = z.object({
  download_url: z.string().url('Please enter a valid URL'),
  button_label: z.string().min(1, 'Button label is required'),
  description: z.string().min(1, 'Description is required'),
});

type PressKitFormData = z.infer<typeof pressKitSchema>;

const AdminPressKit: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: pressKitSettings = [] } = useQuery({
    queryKey: ['press-kit-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('press_kit_settings')
        .select('*')
        .order('language_id');
      
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: PressKitFormData & { id: number }) => {
      const { error } = await supabase
        .from('press_kit_settings')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press-kit-settings'] });
      toast({
        title: 'Success',
        description: 'Press kit settings updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update press kit settings',
        variant: 'destructive',
      });
    },
  });

  const PressKitForm = ({ setting, language }: { setting: any; language: any }) => {
    const form = useForm<PressKitFormData>({
      resolver: zodResolver(pressKitSchema),
      defaultValues: {
        download_url: setting?.download_url || '',
        button_label: setting?.button_label || '',
        description: setting?.description || '',
      },
    });

    const onSubmit = (data: PressKitFormData) => {
      updateMutation.mutate({ id: setting.id, ...data });
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{language.name} Press Kit Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter description text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="button_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Label</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter button label" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="download_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Download URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/press-kit.zip" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Settings'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Press Kit Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage press kit download links and content for each language.
        </p>
      </div>

      {languages.map((language) => {
        const setting = pressKitSettings.find(s => s.language_id === language.id);
        return setting ? (
          <PressKitForm key={language.id} setting={setting} language={language} />
        ) : null;
      })}
    </div>
  );
};

export default AdminPressKit;
