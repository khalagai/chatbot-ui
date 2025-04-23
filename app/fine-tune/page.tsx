import { FineTuneForm } from '@/components/fine-tune/fine-tune-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

interface TrainingData {
  id: string;
  model_id: string;
  messages: any[];
  created_at: string;
}

export default function FineTunePage() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrainingData = async () => {
    try {
      const response = await fetch('/api/fine-tune');
      if (!response.ok) {
        throw new Error('Failed to fetch training data');
      }
      const data = await response.json();
      setTrainingData(data);
    } catch (error) {
      console.error('Error fetching training data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch training data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const handleSuccess = () => {
    fetchTrainingData();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/fine-tune?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete training data');
      }

      toast({
        title: 'Success',
        description: 'Training data deleted successfully',
      });

      // Update local state
      setTrainingData(trainingData.filter(data => data.id !== id));
    } catch (error) {
      console.error('Error deleting training data:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete training data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Fine-tune Your Model</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Training Data</CardTitle>
            <CardDescription>
              Enter your model ID and training messages to fine-tune your model.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FineTuneForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Training Data</CardTitle>
            <CardDescription>
              View and manage your submitted training data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">Loading...</div>
            ) : trainingData.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No training data submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {trainingData.map((data) => (
                  <Card key={data.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Model ID: {data.model_id}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(data.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(data.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="mt-2">
                      <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-sm">
                        {JSON.stringify(data.messages, null, 2)}
                      </pre>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 