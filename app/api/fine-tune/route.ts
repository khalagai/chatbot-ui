import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { messages, modelId } = await req.json();

    // Validate input
    if (!Array.isArray(messages) || !modelId) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    // Insert training data
    const { data, error } = await supabase
      .from('training_data')
      .insert([
        {
          user_id: session.user.id,
          messages,
          model_id: modelId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting training data:', error);
      return new NextResponse('Error saving training data', { status: 500 });
    }

    // TODO: Trigger fine-tuning process (implement this based on your specific requirements)
    // This could involve:
    // 1. Calling OpenAI's fine-tuning API
    // 2. Updating the status in Supabase
    // 3. Storing the fine-tuned model ID

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in fine-tune route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's training data
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching training data:', error);
      return new NextResponse('Error fetching training data', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in fine-tune route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing training data ID', { status: 400 });
    }

    // Delete training data
    const { error } = await supabase
      .from('training_data')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting training data:', error);
      return new NextResponse('Error deleting training data', { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in fine-tune route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 