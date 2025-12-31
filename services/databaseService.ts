import { supabase } from './supabaseClient';
import { User, UserRole, Message, Announcement, QuizResult } from '../types';

export const db = {
  // --- AUTH & PROFILE ---
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // Fetch profile for role/name
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email!,
      role: profile?.role as UserRole || UserRole.STUDENT,
      name: profile?.name || session.user.email!.split('@')[0],
    };
  },

  login: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  logout: async () => {
    return await supabase.auth.signOut();
  },

  // --- MESSAGES (Realtime) ---
  getMessages: async (): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profile:profiles(name, role)
      `)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) console.error('Error fetching messages:', error);
    return data || [];
  },

  sendMessage: async (content: string, userId: string) => {
    const { error } = await supabase
      .from('messages')
      .insert([{ user_id: userId, content }]);
    
    if (error) console.error('Error sending message:', error);
  },

  subscribeToMessages: (callback: (msg: Message) => void) => {
    return supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          // Fetch the full relation for the new message
          const { data } = await supabase
            .from('messages')
            .select(`*, profile:profiles(name, role)`)
            .eq('id', payload.new.id)
            .single();
          
          if (data) callback(data as Message);
        }
      )
      .subscribe();
  },

  // --- ANNOUNCEMENTS (Realtime) ---
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    return data || [];
  },

  postAnnouncement: async (title: string, content: string, priority: 'NORMAL' | 'URGENT') => {
    const { error } = await supabase
      .from('announcements')
      .insert([{ title, content, priority }]);
    if (error) throw error;
  },

  subscribeToAnnouncements: (callback: () => void) => {
    return supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => callback()
      )
      .subscribe();
  },

  // --- QUIZZES ---
  checkQuizSubmission: async (userId: string): Promise<QuizResult | null> => {
    const { data } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .limit(1) // Assuming one quiz for this demo context
      .maybeSingle();
    
    return data;
  },

  submitQuizResult: async (userId: string, score: number, total: number) => {
    const { error } = await supabase
      .from('quiz_results')
      .insert([{ user_id: userId, score, total }]);
    if (error) throw error;
  }
};
