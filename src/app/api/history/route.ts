import { NextResponse } from 'next/server';
import { MOCK_HISTORY } from '@/lib/data';

let historyStore: any[] | null = null;

function getHistory() {
    if (!historyStore) historyStore = [...MOCK_HISTORY];
    return historyStore;
}

export async function GET() {
    return NextResponse.json(getHistory());
}

export async function POST(request: Request) {
    const data = await request.json();
    const { user, role, evaluator, category } = data;

    const newHistory = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('fr-FR'),
        user,
        role,
        evaluator,
        category
    };

    let store = getHistory();
    historyStore = [newHistory, ...store];

    return NextResponse.json({ success: true, history: newHistory });
}
