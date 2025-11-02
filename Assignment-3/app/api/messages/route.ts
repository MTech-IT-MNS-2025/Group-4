import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');
    const groupName = searchParams.get('groupName');

    if (groupName) {
      const messages = await Message.find({ groupName, isGroup: true }).sort({ timestamp: 1 });
      return NextResponse.json(messages);
    }

    if (!user1 || !user2) {
      return NextResponse.json(
        { error: 'user1 and user2 or groupName required' },
        { status: 400 }
      );
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { sender, receiver, text, groupName, isGroup, imageUrl } = body;

    if (!sender) {
      return NextResponse.json(
        { error: 'sender required' },
        { status: 400 }
      );
    }

    if (!text && !imageUrl) {
      return NextResponse.json(
        { error: 'text or imageUrl required' },
        { status: 400 }
      );
    }

    if (isGroup && !groupName) {
      return NextResponse.json(
        { error: 'groupName required for group messages' },
        { status: 400 }
      );
    }

    if (!isGroup && !receiver) {
      return NextResponse.json(
        { error: 'receiver required for private messages' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      sender,
      receiver: isGroup ? undefined : receiver,
      groupName: isGroup ? groupName : undefined,
      text: text || '',
      imageUrl,
      timestamp: new Date(),
      isGroup: isGroup || false,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
