import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ChatbotProfile {
  name: string;
  description: string;
  personality: string;
  expertise: string;
  tone: string;
  example_conversations: string;
}

export function ChatbotProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ChatbotProfile>({
    name: '',
    description: '',
    personality: '',
    expertise: '',
    tone: '',
    example_conversations: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/fine-tune/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      toast({
        title: 'Success',
        description: 'Chatbot profile saved successfully',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save chatbot profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbot Profile & Persona</CardTitle>
        <CardDescription>
          Define your chatbot's personality, expertise, and communication style.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter chatbot name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="Brief description of your chatbot"
              required
            />
          </div>

          <div>
            <label htmlFor="personality" className="mb-1 block text-sm font-medium">
              Personality
            </label>
            <Textarea
              id="personality"
              value={profile.personality}
              onChange={(e) => setProfile({ ...profile, personality: e.target.value })}
              placeholder="Describe your chatbot&apos;s personality traits"
              required
            />
          </div>

          <div>
            <label htmlFor="expertise" className="mb-1 block text-sm font-medium">
              Expertise
            </label>
            <Textarea
              id="expertise"
              value={profile.expertise}
              onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
              placeholder="List your chatbot's areas of expertise"
              required
            />
          </div>

          <div>
            <label htmlFor="tone" className="mb-1 block text-sm font-medium">
              Communication Tone
            </label>
            <Textarea
              id="tone"
              value={profile.tone}
              onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
              placeholder="Describe how your chatbot should communicate"
              required
            />
          </div>

          <div>
            <label htmlFor="example_conversations" className="mb-1 block text-sm font-medium">
              Example Conversations
            </label>
            <Textarea
              id="example_conversations"
              value={profile.example_conversations}
              onChange={(e) => setProfile({ ...profile, example_conversations: e.target.value })}
              placeholder="Provide example conversations to guide the chatbot's responses"
              className="min-h-[200px]"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 