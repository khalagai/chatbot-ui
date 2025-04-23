import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';

interface FineTuneFormProps {
  onSuccess?: () => void;
}

export function FineTuneForm({ onSuccess }: FineTuneFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [modelId, setModelId] = useState('');
  const [messages, setMessages] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse messages JSON
      let parsedMessages;
      try {
        parsedMessages = JSON.parse(messages);
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please enter valid JSON for messages',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/fine-tune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          messages: parsedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit fine-tuning data');
      }

      toast({
        title: 'Success',
        description: 'Fine-tuning data submitted successfully',
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setModelId('');
      setMessages('');
    } catch (error) {
      console.error('Error submitting fine-tuning data:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit fine-tuning data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="modelId" className="block text-sm font-medium mb-1">
          Model ID
        </label>
        <Input
          id="modelId"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          placeholder="Enter model ID"
          required
        />
      </div>

      <div>
        <label htmlFor="messages" className="block text-sm font-medium mb-1">
          Messages (JSON)
        </label>
        <Textarea
          id="messages"
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
          placeholder="Enter messages in JSON format"
          required
          className="min-h-[200px] font-mono"
        />
        <p className="mt-1 text-sm text-gray-500">
          Format: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Fine-tuning Data'}
      </Button>
    </form>
  );
} 