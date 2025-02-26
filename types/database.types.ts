export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          brand_codes: string[]
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          brand_codes?: string[]
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          brand_codes?: string[]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          attached_to: string
          created_at: string
          id: string
          note: string
          type: Database["public"]["Enums"]["note_type"] | null
          updated_at: string
        }
        Insert: {
          attached_to: string
          created_at?: string
          id: string
          note: string
          type?: Database["public"]["Enums"]["note_type"] | null
          updated_at?: string
        }
        Update: {
          attached_to?: string
          created_at?: string
          id?: string
          note?: string
          type?: Database["public"]["Enums"]["note_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      packaged_products: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          product_id: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaged_products_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sale_units: {
        Row: {
          created_at: string
          direct_url: string | null
          match_on: Json | null
          page_id: string
          published_at: string | null
          sale_unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          direct_url?: string | null
          match_on?: Json | null
          page_id: string
          published_at?: string | null
          sale_unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          direct_url?: string | null
          match_on?: Json | null
          page_id?: string
          published_at?: string | null
          sale_unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sale_units_page_id_pages_id_fk"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_sale_units_sale_unit_id_sale_units_id_fk"
            columns: ["sale_unit_id"]
            isOneToOne: false
            referencedRelation: "sale_units"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          id: string
          scrape_url: string | null
          scraper_id: string | null
          scraper_inputs: Json | null
          site_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id: string
          scrape_url?: string | null
          scraper_id?: string | null
          scraper_inputs?: Json | null
          site_id?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          scrape_url?: string | null
          scraper_id?: string | null
          scraper_inputs?: Json | null
          site_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_scraper_id_scrapers_id_fk"
            columns: ["scraper_id"]
            isOneToOne: false
            referencedRelation: "scrapers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_site_id_sites_id_fk"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          created_at: string
          fil_db_id: string | null
          id: string
          name: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          fil_db_id?: string | null
          id: string
          name: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          fil_db_id?: string | null
          id?: string
          name?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_brands_id_fk"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      sale_unit_packaged_products: {
        Row: {
          created_at: string
          packaged_product_id: string
          published_at: string | null
          quantity: number
          sale_unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          packaged_product_id: string
          published_at?: string | null
          quantity: number
          sale_unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          packaged_product_id?: string
          published_at?: string | null
          quantity?: number
          sale_unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_unit_packaged_products_id_fk"
            columns: ["packaged_product_id"]
            isOneToOne: false
            referencedRelation: "packaged_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_unit_packaged_products_sale_unit_id_sale_units_id_fk"
            columns: ["sale_unit_id"]
            isOneToOne: false
            referencedRelation: "sale_units"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_units: {
        Row: {
          created_at: string
          id: string
          name: string
          published_at: string | null
          shipping_weight: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          published_at?: string | null
          shipping_weight?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          published_at?: string | null
          shipping_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      scrapers: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
    }
    Enums: {
      app_permission:
        | "manage_brands"
        | "manage_pages"
        | "manage_pending_items"
        | "manage_published_items"
      app_role: "admin" | "maintainer"
      note_type: "general" | "official_description"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
