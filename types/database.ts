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
export type Role = "org" | "investor" | "consultant";

export type ProjectStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved";
export type ProjectGoalStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "DONE"
  | "BLOCKED";
export type ProjectMilestoneStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "DONE"
  | "DELAYED";

export type LinkedEntityType = "empresa" | "entidade_publica";
export type InstitutionalEntityStatus = "ACTIVE" | "INACTIVE";
export type InstitutionalEntityInviteStatus =
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED"
  | "REVOKED";
export type InstitutionalEntityMembershipRole =
  | "ENTITY_ADMIN"
  | "ENTITY_MEMBER";
export type InstitutionalEntityMembershipStatus = "ACTIVE" | "INACTIVE";

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
          name: string | null;
          title?: string | null;
          description: string | null;
          project_type: string;
          status: ProjectStatus;
          start_date: string | null;
          end_date: string | null;
          value_total: number | null;
          linked_entity_id: string | null;
          linked_entity_name: string | null;
          linked_entity_type: LinkedEntityType | null;
          metadata?: Json | null;
          created_at: string | null;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name?: string | null;
          title?: string | null;
          description?: string | null;
          project_type: string;
          status?: ProjectStatus;
          start_date?: string | null;
          end_date?: string | null;
          value_total?: number | null;
          linked_entity_id?: string | null;
          linked_entity_name?: string | null;
          linked_entity_type?: LinkedEntityType | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          title?: string | null;
          description?: string | null;
          project_type?: string;
          status?: ProjectStatus;
          start_date?: string | null;
          end_date?: string | null;
          value_total?: number | null;
          linked_entity_id?: string | null;
          linked_entity_name?: string | null;
          linked_entity_type?: LinkedEntityType | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      institutional_entities: {
        Row: {
          id: string;
          organization_id: string;
          entity_type: LinkedEntityType;
          display_name: string;
          legal_name: string | null;
          tax_id: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          status: InstitutionalEntityStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          entity_type: LinkedEntityType;
          display_name: string;
          legal_name?: string | null;
          tax_id?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: InstitutionalEntityStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          entity_type?: LinkedEntityType;
          display_name?: string;
          legal_name?: string | null;
          tax_id?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: InstitutionalEntityStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      institutional_entity_invites: {
        Row: {
          id: string;
          entity_id: string;
          organization_id: string;
          email: string;
          role: InstitutionalEntityMembershipRole;
          token: string;
          status: InstitutionalEntityInviteStatus;
          expires_at: string;
          accepted_at: string | null;
          revoked_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          entity_id: string;
          organization_id: string;
          email: string;
          role: InstitutionalEntityMembershipRole;
          token?: string;
          status?: InstitutionalEntityInviteStatus;
          expires_at: string;
          accepted_at?: string | null;
          revoked_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          entity_id?: string;
          organization_id?: string;
          email?: string;
          role?: InstitutionalEntityMembershipRole;
          token?: string;
          status?: InstitutionalEntityInviteStatus;
          expires_at?: string;
          accepted_at?: string | null;
          revoked_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      institutional_entity_memberships: {
        Row: {
          id: string;
          entity_id: string;
          user_id: string;
          role: InstitutionalEntityMembershipRole;
          status: InstitutionalEntityMembershipStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          entity_id: string;
          user_id: string;
          role: InstitutionalEntityMembershipRole;
          status?: InstitutionalEntityMembershipStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          entity_id?: string;
          user_id?: string;
          role?: InstitutionalEntityMembershipRole;
          status?: InstitutionalEntityMembershipStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      project_goals: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          title: string;
          description: string | null;
          indicator: string | null;
          target_value: string | null;
          due_date: string | null;
          status: ProjectGoalStatus;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          title: string;
          description?: string | null;
          indicator?: string | null;
          target_value?: string | null;
          due_date?: string | null;
          status?: ProjectGoalStatus;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          title?: string;
          description?: string | null;
          indicator?: string | null;
          target_value?: string | null;
          due_date?: string | null;
          status?: ProjectGoalStatus;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          goal_id: string | null;
          title: string;
          description: string | null;
          starts_at: string | null;
          ends_at: string | null;
          status: ProjectMilestoneStatus;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          goal_id?: string | null;
          title: string;
          description?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          status?: ProjectMilestoneStatus;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          goal_id?: string | null;
          title?: string;
          description?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          status?: ProjectMilestoneStatus;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      project_documents: {
        Row: {
          id: string;
          project_id: string;
          organization_id: string;
          uploaded_by: string;
          doc_type: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          storage_path: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          organization_id: string;
          uploaded_by: string;
          doc_type: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          storage_path: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          organization_id?: string;
          uploaded_by?: string;
          doc_type?: string;
          file_name?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          storage_path?: string;
          created_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      role: Role;
      project_status: ProjectStatus;
      project_goal_status: ProjectGoalStatus;
      project_milestone_status: ProjectMilestoneStatus;
      linked_entity_type: LinkedEntityType;
      institutional_entity_status: InstitutionalEntityStatus;
      institutional_entity_invite_status: InstitutionalEntityInviteStatus;
      institutional_entity_membership_role: InstitutionalEntityMembershipRole;
      institutional_entity_membership_status: InstitutionalEntityMembershipStatus;
    };
  };
}
