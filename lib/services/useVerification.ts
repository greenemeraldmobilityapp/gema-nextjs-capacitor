import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type VerificationSubmission = {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  nik: string;
  ktp_name: string;
  ktp_url: string;
  certificate_url: string | null;
  certificate_name: string | null;
  certificate_issuer: string | null;
  certificate_year: number | null;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export function useLatestSubmission(userId: string | undefined) {
  return useQuery({
    queryKey: ['verification-submission', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('verification_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as VerificationSubmission | null;
    },
    enabled: !!userId,
  });
}

export function useSubmitKtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      nik: string;
      ktpName: string;
      ktpUrl: string;
    }) => {
      const { data, error } = await supabase
        .from('verification_submissions')
        .insert({
          user_id: params.userId,
          status: 'pending',
          nik: params.nik,
          ktp_name: params.ktpName,
          ktp_url: params.ktpUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data as VerificationSubmission;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['verification-submission', variables.userId] });
    },
  });
}

export function useSubmitCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      submissionId: string;
      certificateUrl: string;
      certificateName: string;
      certificateIssuer: string;
      certificateYear: number;
    }) => {
      const { error } = await supabase
        .from('verification_submissions')
        .update({
          certificate_url: params.certificateUrl,
          certificate_name: params.certificateName,
          certificate_issuer: params.certificateIssuer,
          certificate_year: params.certificateYear,
        })
        .eq('id', params.submissionId)
        .eq('status', 'pending');

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['verification-submission', variables.userId] });
    },
  });
}

export function useVerificationHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['verification-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('verification_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as VerificationSubmission[];
    },
    enabled: !!userId,
  });
}
