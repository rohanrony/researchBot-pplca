'use client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { RiShieldUserLine } from 'react-icons/ri'; // For SSO

interface AuthSocialProps {
  onGoogleClick: () => void;
  onSSOClick: () => void;
}

const AuthSocial = ({ onGoogleClick, onSSOClick }: AuthSocialProps) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onGoogleClick}
        className="flex items-center justify-center gap-2 bg-black/30 hover:bg-black/50 border border-gray-800 text-white transition-colors"
      >
        <FcGoogle size={18} />
        Log in with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onSSOClick}
        className="flex items-center justify-center gap-2 bg-black/30 hover:bg-black/50 border border-gray-800 text-white transition-colors"
      >
        <RiShieldUserLine size={18} className="text-white" />
        Single Sign-On (SSO)
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-800"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-kindle-dark px-2 text-gray-500">OR</span>
        </div>
      </div>
    </div>
  );
};

export default AuthSocial;
