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
      filament_variants: {
        Row: {
          created_at: string
          dimension: string | null
          filament_grams: number | null
          is_spool_reusable: boolean | null
          spool_grams: number | null
          spool_type: string | null
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          dimension?: string | null
          filament_grams?: number | null
          is_spool_reusable?: boolean | null
          spool_grams?: number | null
          spool_type?: string | null
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          dimension?: string | null
          filament_grams?: number | null
          is_spool_reusable?: boolean | null
          spool_grams?: number | null
          spool_type?: string | null
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "filament_variants_variant_id_variants_id_fk"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      filaments: {
        Row: {
          color_hex: string | null
          color_name: string | null
          created_at: string
          material: string | null
          product_id: string
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          color_name?: string | null
          created_at?: string
          material?: string | null
          product_id: string
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          color_name?: string | null
          created_at?: string
          material?: string | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filaments_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      page_skus: {
        Row: {
          created_at: string
          direct_url: string | null
          match_on: Json | null
          page_id: string
          published_at: string | null
          sku_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          direct_url?: string | null
          match_on?: Json | null
          page_id: string
          published_at?: string | null
          sku_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          direct_url?: string | null
          match_on?: Json | null
          page_id?: string
          published_at?: string | null
          sku_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_skus_page_id_pages_id_fk"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_skus_sku_id_skus_id_fk"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          id: string
          scrape_group: string | null
          scrape_status: Database["public"]["Enums"]["scrape_status"]
          scrape_url: string | null
          scraper_id: string | null
          scraper_inputs: Json | null
          site_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id: string
          scrape_group?: string | null
          scrape_status?: Database["public"]["Enums"]["scrape_status"]
          scrape_url?: string | null
          scraper_id?: string | null
          scraper_inputs?: Json | null
          site_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          scrape_group?: string | null
          scrape_status?: Database["public"]["Enums"]["scrape_status"]
          scrape_url?: string | null
          scraper_id?: string | null
          scraper_inputs?: Json | null
          site_id?: string
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
      product_group_memberships: {
        Row: {
          created_at: string
          product_group_id: string
          product_id: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          product_group_id: string
          product_id: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          product_group_id?: string
          product_id?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_group_memberships_product_group_id_product_groups_id_fk"
            columns: ["product_group_id"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_group_memberships_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_groups: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          name: string
          published_at: string | null
          sources: Json | null
          type: Database["public"]["Enums"]["product_group_type"] | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id: string
          name: string
          published_at?: string | null
          sources?: Json | null
          type?: Database["public"]["Enums"]["product_group_type"] | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          name?: string
          published_at?: string | null
          sources?: Json | null
          type?: Database["public"]["Enums"]["product_group_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_groups_brand_id_brands_id_fk"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
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
          sources: Json | null
          type: Database["public"]["Enums"]["product_type"] | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          fil_db_id?: string | null
          id: string
          name: string
          published_at?: string | null
          sources?: Json | null
          type?: Database["public"]["Enums"]["product_type"] | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          fil_db_id?: string | null
          id?: string
          name?: string
          published_at?: string | null
          sources?: Json | null
          type?: Database["public"]["Enums"]["product_type"] | null
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
          homepage: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          homepage?: string | null
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          homepage?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      skus: {
        Row: {
          created_at: string
          id: string
          name: string
          published_at: string | null
          shipping_grams: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          published_at?: string | null
          shipping_grams?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          published_at?: string | null
          shipping_grams?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          product_types: Database["public"]["Enums"]["product_type"][]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          name: string
          product_types?: Database["public"]["Enums"]["product_type"][]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_types?: Database["public"]["Enums"]["product_type"][]
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
      variant_skus: {
        Row: {
          created_at: string
          published_at: string | null
          quantity: number
          sku_id: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          published_at?: string | null
          quantity: number
          sku_id: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          published_at?: string | null
          quantity?: number
          sku_id?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_skus_sku_id_skus_id_fk"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_skus_variant_id_variants_id_fk"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
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
            foreignKeyName: "variants_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
        | "manage_scrapers"
        | "manage_sites"
      app_role: "admin" | "maintainer"
      note_type: "general" | "official_description"
      product_group_type: "product_line"
      product_type: "filament" | "printer"
      scrape_status: "pending" | "active" | "paused" | "archived"
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
