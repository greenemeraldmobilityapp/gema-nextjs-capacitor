import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image-utils';

const supabase = createClient();

export type ServiceImage = {
  id: string;
  service_id: string;
  image_url: string;
  sort_order: number | null;
  created_at: string;
};

export function useServiceImages(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service-images', serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      const { data, error } = await supabase
        .from('service_images')
        .select('*')
        .eq('service_id', serviceId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ServiceImage[];
    },
    enabled: !!serviceId,
  });
}

export function useUploadMultipleServiceImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      vendorId: string;
      serviceId: string;
      files: File[];
    }) => {
      const { vendorId, serviceId, files } = params;
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressImage(file);
        const fileName = `${vendorId}/${serviceId}/${Date.now()}-${i}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, compressed, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) urls.push(urlData.publicUrl);
      }

      const { error: insertError } = await supabase
        .from('service_images')
        .insert(
          urls.map((url, idx) => ({
            service_id: serviceId,
            image_url: url,
            sort_order: idx,
          }))
        );

      if (insertError) throw insertError;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-images', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-services', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-services-active', variables.vendorId] });
    },
  });
}

export function useDeleteServiceImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      serviceId: string;
      imageId: string;
      imageUrl: string;
    }) => {
      const { imageId, imageUrl } = params;

      const { error: deleteError } = await supabase
        .from('service_images')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;

      const pathMatch = imageUrl.match(/\/portfolio-images\/(.+)$/);
      if (pathMatch?.[1]) {
        await supabase.storage
          .from('portfolio-images')
          .remove([pathMatch[1]]);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-images', variables.serviceId] });
    },
  });
}

export function useReorderServiceImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      serviceId: string;
      orderedIds: string[];
    }) => {
      const { serviceId, orderedIds } = params;
      const updates = orderedIds.map((id, idx) => ({
        id,
        service_id: serviceId,
        sort_order: idx,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('service_images')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-images', variables.serviceId] });
    },
  });
}
