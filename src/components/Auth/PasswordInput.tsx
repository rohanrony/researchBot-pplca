'use client';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const PasswordInput = ({ id, value, onChange, error, placeholder = "Password" }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
      type={showPassword ? "text" : "password"}
      id={id}
      value={value}
      onChange={onChange}
      className={`pr-10 bg-black/30 border-gray-800 text-white ${error ? 'border-kindle-error' : 'focus:border-kindle-accent'}`}
      placeholder={placeholder}
      autoComplete="current-password"
      />
      <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
      tabIndex={-1}
      >
      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
