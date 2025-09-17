import { LoginForm } from '../../../components/features/auth/login-form';

interface LoginPageProps {
  searchParams: {
    error?: string;
    callbackUrl?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginForm searchParams={searchParams} />;
}