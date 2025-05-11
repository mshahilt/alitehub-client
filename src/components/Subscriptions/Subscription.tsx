import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StripeModal from './Stripe';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { getCompany } from '@/app/redux/slices/company/companyAuthSlice';

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
}

interface SubscriptionProps {
  plans: Plan[] | [];
  subscribedPlans: {
    stripePriceId: string;
    status: string;
  } | null;
}

const Subscription: React.FC<SubscriptionProps> = ({ plans, subscribedPlans }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  
  const hasActiveSubscription = subscribedPlans?.status === 'active';

  const handleSubscribe = (plan: Plan) => {
    if (!hasActiveSubscription) {
      setSelectedPlan(plan);
      setIsModalOpen(true);
    }
  };

  const isSubscribed = (plan: Plan) => {
    return subscribedPlans?.stripePriceId === plan.stripePriceId && 
           subscribedPlans?.status === 'active';
  };
  
  useEffect(() => {
    dispatch(getCompany());
  }, [dispatch]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-white">Subscription Plans</h2>
      {hasActiveSubscription && (
        <div className="bg-blue-900 text-white p-4 mb-6 rounded-md text-center">
          <p className="font-medium">You already have an active subscription.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col h-full border-2 bg-gray-800 text-white ${
              plan.name === 'EXCLUSIVE' ? 'border-blue-400 shadow-lg' : 'border-gray-600'
            } ${isSubscribed(plan) ? 'border-green-500' : ''}`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                {plan.name === 'EXCLUSIVE' && (
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700">Popular</Badge>
                )}
                {isSubscribed(plan) && (
                  <Badge className="bg-green-600 text-white hover:bg-green-700">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-3xl font-bold">₹{plan.price.toFixed(2)}</span>
                <span className="text-gray-400">/{plan.interval}</span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              {isSubscribed(plan) ? (
                <Button
                  className="w-full text-white bg-green-600 hover:bg-green-700 cursor-default"
                  disabled
                >
                  Current Plan
                </Button>
              ) : hasActiveSubscription ? (
                <Button
                  className="w-full text-white bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
                  disabled
                >
                  Already Subscribed
                </Button>
              ) : (
                <Button
                  className={`w-full text-white ${
                    plan.name === 'EXCLUSIVE'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSubscribe(plan)}
                >
                  Subscribe Now
                </Button>
              )}
            </CardFooter>
            <div className="px-6 pb-4 text-xs text-gray-400">
              <p>Product ID: {plan.stripeProductId.substring(0, 10)}...</p>
              <p>Price ID: {plan.stripePriceId.substring(0, 10)}...</p>
            </div>
          </Card>
        ))}
      </div>

      <StripeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        plan={selectedPlan} 
      />
    </div>
  );
};

export default Subscription;