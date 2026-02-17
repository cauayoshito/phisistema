/**
 * This file contains TypeScript definitions that mirror the structure of
 * the Postgres database used in the PHI system. Keeping these definitions
 * separate allows your application code to benefit from static typing
 * against the database schema without leaking implementation details. When
 * you modify your Supabase tables, consider updating this file as well.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/**
 * Enumeration for user roles within the system. An organization user (org)
 * can manage only their own data; an investor has read access to all
 * projects; a consultant can view all projects but cannot modify them.
 */
export type Role = 'org' | 'investor' | 'consultant';

export type ProjectStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: Role;
          organization_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: Role;
          organization_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: Role;
          organization_id?: string | null;
          created_at?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          start_date: string | null;
          end_date: string | null;
          value_total: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          start_date?: string | null;
          end_date?: string | null;
          value_total?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          status?: ProjectStatus;
          start_date?: string | null;
          end_date?: string | null;
          value_total?: number | null;
          created_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      role: Role;
      project_status: ProjectStatus;
    };
  };
}