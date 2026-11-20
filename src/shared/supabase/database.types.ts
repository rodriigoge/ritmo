// Types for supabase/migrations, in the shape `supabase gen types` produces.
// Regenerate with: npx supabase gen types typescript --project-id <id>
export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id?: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'habit_completions_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habits';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      toggle_habit_completion: {
        Args: { p_habit_id: string; p_date: string };
        Returns: boolean;
      };
      reorder_habits: {
        Args: { p_ids: string[] };
        Returns: undefined;
      };
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
