'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'customer'; // Default fallback or force select
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchParams.get('role')) {
      // In a real flow, redirect to /register/role. For now let's just use customer as default if accessing directly
      // router.replace('/register/role');
    }
  }, [searchParams, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }
      
      if (!authData.user) {
        toast.error('Registration failed, please try again.');
        return;
      }

      // 2. Create the user profile in public.users table
      // Note: We need to make sure RLS allows INSERT for authenticated users matching their ID.
      // If a trigger is setup, this step might be redundant, but we do it manually for explicit control.
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role,
        });
        
      if (profileError) {
        // If it violates RLS, it means we must use a Trigger, or we need to add INSERT policy
        console.error('Error creating profile:', profileError);
        // We do not block the UI if email signup requires confirmation and session is null
      }

      toast.success('Registration successful! Redirecting...');
      
      // If auto-login happens, AuthGuard handles redirect.
      // If email confirmation is required, session might be null.
      if (!authData.session) {
        toast.info('Please check your email to verify your account.');
        router.push('/login');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm rounded-[24px] shadow-sm border-gray-100">
        <CardHeader className="space-y-1 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Join GEMA as a {role.charAt(0).toUpperCase() + role.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 rounded-xl"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="me@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-xl"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-medium text-base mt-4" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Register'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="text-sm text-center text-gray-500 w-full mt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
