import React, { useState } from 'react';
import { XCircle, Check, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/services/api/userInstance';
import { Plan } from './Subscription';

const stripePromise = loadStripe("pk_test_51R3VOPLac2MVpzdKSaKQYEzFFLsGCzs0rtk28O3QiztywNa6HphXnQlppyQnCxNVvSor9eGTnSlptBsR6mzgZifA00tb7d79tu");

interface CheckoutFormProps {
  plan: Plan;
  onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ plan, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred with your payment');
        setProcessing(false);
        return;
      }

      const { data } = await axiosInstance.post('/plan/subscribe', {
        planId: plan.id,
        paymentMethodId: paymentMethod.id,
        stripePriceId: plan.stripePriceId
      });

      if (data.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
        if (confirmError) {
          setError(confirmError.message || 'Payment confirmation failed');
          setProcessing(false);
          return;
        }
      }
      
      if (data.status === "active") {
        setSucceeded(true);
        setError(null);
        console.log("Subscription active:", data);
        
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <Check className="h-8 w-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-gray-400 mb-6">
          Thank you for subscribing to the {plan.name} plan. Your subscription is now active.
        </p>
        
        <div className="bg-gray-800 p-4 rounded-md w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Plan</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Billing</span>
            <span className="font-medium">{plan.interval}ly</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount</span>
            <span className="font-medium">${plan.price.toFixed(2)}/{plan.interval}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-400 mb-6">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <span>Refreshing page in a moment...</span>
        </div>
        
        <Button 
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
        >
          Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-800 rounded-md">
        <CardElement options={cardStyle} className="p-2" />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Your card will be charged ${plan.price.toFixed(2)}/{plan.interval}
        </div>
        <img src="/stripe-badge.svg" alt="Powered by Stripe" className="h-8" />
      </div>
      
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={processing}
          className="bg-transparent text-white hover:bg-gray-700 border-gray-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || succeeded}
          className="bg-blue-500 hover:bg-blue-600 text-white min-w-24"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing
            </div>
          ) : succeeded ? (
            "Subscribed!"
          ) : (
            "Pay Now"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

const StripeModal: React.FC<StripeModalProps> = ({ isOpen, onClose, plan }) => {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Subscribe to {plan.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your payment details to complete your subscription
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center p-3 bg-gray-800 rounded mb-6">
            <div>
              <p className="font-semibold">{plan.name} Plan</p>
              <p className="text-sm text-gray-400">{plan.interval}ly billing</p>
            </div>
            <p className="text-xl font-bold">${plan.price.toFixed(2)}</p>
          </div>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm plan={plan} onClose={onClose} />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StripeModal;