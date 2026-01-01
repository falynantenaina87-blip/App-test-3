
import { supabase } from './supabaseClient';
import { User, UserRole, Message, Announcement, QuizResult, ScheduleItem } from '../types';

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

  signUp: async (email: string, password: string, name: string, role: UserRole) => {
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role } // Metadata stored in auth.users
      }
    });

    if (authError) throw authError;

    // 2. Create Public Profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            name: name, 
            role: role,
            email: email 
          }
        ]);
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }

    return { data: authData, error: null };
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

  subscribeToMessages: (
    onMessage: (msg: Message) => void,
    onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void
  ) => {
    return supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(`*, profile:profiles(name, role)`)
            .eq('id', payload.new.id)
            .single();
          
          if (data) onMessage(data as Message);
        }
      )
      .subscribe((status) => {
        if (onStatusChange) onStatusChange(status);
      });
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

  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
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

  // --- SCHEDULE / EMPLOI DU TEMPS (Realtime) ---
  getSchedule: async (): Promise<ScheduleItem[]> => {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      // On triera côté client par jour/heure pour plus de flexibilité
      .order('day', { ascending: true }); 

    if (error) console.error(error);
    return data || [];
  },

  addScheduleItem: async (item: Omit<ScheduleItem, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from('schedule')
      .insert([item]);
    if (error) throw error;
  },

  deleteScheduleItem: async (id: string) => {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToSchedule: (callback: () => void) => {
    return supabase
      .channel('public:schedule')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule' },
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
      .limit(1) 
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
