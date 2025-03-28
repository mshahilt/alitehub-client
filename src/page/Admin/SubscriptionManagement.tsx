import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import adminMenuItems from '@/app/data/adminSidebarItems';
import axiosInstance from '@/services/api/userInstance';

interface Plan {
  id: number;
  name: string;
  price: number | string;
  interval: 'month'  | 'year';
  features: string[];
}

const SubscriptionManagement: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 1000);
//   const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const response = await axiosInstance.get('/plan');
      console.log(response);
      setPlans(response.data);
    }
    fetchPlans()
  }, []);
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<Plan>({ 
    id: 0, 
    name: '', 
    price: '', 
    interval: 'month', 
    features: [] 
  });
  const [newFeature, setNewFeature] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleOpenDialog = (plan: Plan | null = null) => {
    if (plan) {
      setCurrentPlan({ ...plan });
      setIsEditing(true);
    } else {
      setCurrentPlan({ id: Date.now(), name: '', price: '', interval: 'month', features: [] });
      setIsEditing(false);
    }
    setIsOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setCurrentPlan({
        ...currentPlan,
        features: [...currentPlan.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...currentPlan.features];
    updatedFeatures.splice(index, 1);
    setCurrentPlan({
      ...currentPlan,
      features: updatedFeatures
    });
  };

  const handleSavePlan = async () => {
      console.log("plans", plans);
    if (isEditing) {
      const updatedPlans = plans.map(plan => 
        plan.id === currentPlan.id ? currentPlan : plan
      );

      setPlans(updatedPlans);
    } else {
        try {
            const response = await axiosInstance.post('/plan',{...currentPlan});
            console.log("response : ", response);
        } catch (error) {
            
        }
      setPlans([...plans, currentPlan]);
    }
    setIsOpen(false);
  };

  const handleDeletePlan = (id: number) => {
    setPlans(plans.filter(plan => plan.id !== id));
  };

  const getIntervalBadge = (interval: Plan['interval']) => {
    switch(interval) {
      case 'month':
        return <Badge variant="outline" className="bg-blue-900 text-blue-300">Monthly</Badge>;
      case 'year':
        return <Badge variant="outline" className="bg-green-900 text-green-300">Yearly</Badge>;
      default:
        return <Badge variant="outline">{interval}</Badge>;
    }
  };

  return (
    <div className="flex bg-black min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="bg-black" 
            />
            <div className="flex-1 bg-black min-h-screen flex justify-center p-4">
                <div className="w-full bg-black max-w-6xl">
                <div className="flex min-h-screen bg-black text-slate-100">
      <div className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-slate-400">Manage your subscription plans and pricing</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="bg-slate-800 hover:bg-slate-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className='text-slate-100'>All Plans</CardTitle>
            <CardDescription className="text-slate-400">
              All available subscription plans for your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-auto">
              <table className="w-full border-collapse text-white">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Interval</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Features</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium">{plan.name}</td>
                      <td className="py-3 px-4">${plan.price}</td>
                      <td className="py-3 px-4">{getIntervalBadge(plan.interval)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {plan.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300">
                              {feature}
                            </Badge>
                          ))}
                          {plan.features.length > 2 && (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                              +{plan.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleOpenDialog(plan)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDeletePlan(plan.id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border border-slate-800 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {isEditing ? 'Update the existing subscription plan details' : 'Add a new subscription plan to your offerings'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={currentPlan.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCurrentPlan({...currentPlan, name: e.target.value})}
                className="col-span-3 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input
                id="price"
                type="number"
                value={currentPlan.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCurrentPlan({...currentPlan, price: e.target.value})}
                className="col-span-3 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interval" className="text-right">Interval</Label>
              <Select 
                value={currentPlan.interval} 
                onValueChange={(value: 'month' | 'year') => 
                  setCurrentPlan({...currentPlan, interval: value})}
              >
                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select an interval" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Features</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    className="flex-1 bg-slate-800 border-slate-700 text-slate-100"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => 
                      e.key === 'Enter' && handleAddFeature()}
                  />
                  <Button onClick={handleAddFeature} className="bg-slate-700 hover:bg-slate-600">
                    Add
                  </Button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800 px-3 py-1 rounded-md">
                      <span className="text-slate-300">{feature}</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleRemoveFeature(index)}
                        className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-slate-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-900">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Cancel
            </Button>
            <Button onClick={handleSavePlan} className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
                </div>
            </div>
        </div>
  );
};

export default SubscriptionManagement;