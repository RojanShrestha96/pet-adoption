import React from 'react';
import { PawPrint } from 'lucide-react';
export function EmailTemplate() {
  return <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 my-8 font-sans">
      <div className="bg-[var(--color-primary)] p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
          <PawPrint className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-white text-xl font-bold">PetMate</h1>
      </div>

      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Verify Your Account
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thanks for joining PetMate! Please use the verification code below to
          complete your registration.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <span className="block text-sm text-gray-500 mb-2 uppercase tracking-wider font-semibold">
            Your Code
          </span>
          <span className="text-4xl font-bold text-[var(--color-primary)] tracking-widest">
            839201
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-8">
          This code will expire in 10 minutes. If you didn't request this,
          please ignore this email.
        </p>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            © 2024 PetMate Inc. All rights reserved.
            <br />
            123 Pet Street, Animal City, AC 12345
          </p>
        </div>
      </div>
    </div>;
}