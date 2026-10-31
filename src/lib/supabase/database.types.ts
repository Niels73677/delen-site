
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "addresses": {
                  Row: {
                    "city": string,"country": string,"created_at": string,"full_name": string,"id": string,"is_default": boolean,"label": string | null,"line1": string,"line2": string | null,"phone": string | null,"postal_code": string,"region": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "city": string,"country": string,"created_at"?: string,"full_name": string,"id"?: string,"is_default"?: boolean,"label"?: string | null,"line1": string,"line2"?: string | null,"phone"?: string | null,"postal_code": string,"region"?: string | null,"user_id": string
                  }
                  Update: {
                    "city"?: string,"country"?: string,"created_at"?: string,"full_name"?: string,"id"?: string,"is_default"?: boolean,"label"?: string | null,"line1"?: string,"line2"?: string | null,"phone"?: string | null,"postal_code"?: string,"region"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "addresses_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"cart_items": {
                  Row: {
                    "quantity": number,"updated_at": string,"user_id": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "quantity": number,"updated_at"?: string,"user_id": string,"variant_id": string
                  }
                  Update: {
                    "quantity"?: number,"updated_at"?: string,"user_id"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "cart_items_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"collections": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"image_alt": string | null,"image_url": string | null,"is_active": boolean,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"image_alt"?: string | null,"image_url"?: string | null,"is_active"?: boolean,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"image_alt"?: string | null,"image_url"?: string | null,"is_active"?: boolean,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"discount_codes": {
                  Row: {
                    "code": string,"created_at": string,"description": string | null,"ends_at": string | null,"id": string,"is_active": boolean,"kind": string,"max_redemptions": number | null,"min_subtotal_cents": number,"redemption_count": number,"starts_at": string | null,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"description"?: string | null,"ends_at"?: string | null,"id"?: string,"is_active"?: boolean,"kind": string,"max_redemptions"?: number | null,"min_subtotal_cents"?: number,"redemption_count"?: number,"starts_at"?: string | null,"value": number
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"description"?: string | null,"ends_at"?: string | null,"id"?: string,"is_active"?: boolean,"kind"?: string,"max_redemptions"?: number | null,"min_subtotal_cents"?: number,"redemption_count"?: number,"starts_at"?: string | null,"value"?: number
                  }
                  Relationships: [
                    
                  ]
                },"inventory": {
                  Row: {
                    "quantity": number,"updated_at": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "quantity"?: number,"updated_at"?: string,"variant_id": string
                  }
                  Update: {
                    "quantity"?: number,"updated_at"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: true
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_movements": {
                  Row: {
                    "created_at": string,"delta": number,"id": number,"order_id": string | null,"reason": string,"variant_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"delta": number,"id"?: never,"order_id"?: string | null,"reason": string,"variant_id": string
                  }
                  Update: {
                    "created_at"?: string,"delta"?: number,"id"?: never,"order_id"?: string | null,"reason"?: string,"variant_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_movements_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"newsletter_subscribers": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"source": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: string,"source"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"source"?: string
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "color_name": string,"id": string,"image_url": string | null,"line_total_cents": number,"order_id": string,"product_id": string | null,"product_name": string,"product_slug": string | null,"quantity": number,"size": string,"sku": string,"unit_price_cents": number,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "color_name": string,"id"?: string,"image_url"?: string | null,"line_total_cents": number,"order_id": string,"product_id"?: string | null,"product_name": string,"product_slug"?: string | null,"quantity": number,"size": string,"sku": string,"unit_price_cents": number,"variant_id"?: string | null
                  }
                  Update: {
                    "color_name"?: string,"id"?: string,"image_url"?: string | null,"line_total_cents"?: number,"order_id"?: string,"product_id"?: string | null,"product_name"?: string,"product_slug"?: string | null,"quantity"?: number,"size"?: string,"sku"?: string,"unit_price_cents"?: number,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "product_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "billing_address": Json | null,"created_at": string,"currency": string,"customer_name": string | null,"discount_cents": number,"discount_code": string | null,"discount_code_id": string | null,"email": string | null,"fulfillment_status": string,"id": string,"notes": string | null,"order_number": number,"paid_at": string | null,"payment_status": string,"reservation_expires_at": string | null,"shipped_at": string | null,"shipping_address": Json | null,"shipping_cents": number,"status": string,"stripe_checkout_session_id": string | null,"stripe_payment_intent_id": string | null,"subtotal_cents": number,"tax_cents": number,"total_cents": number,"tracking_carrier": string | null,"tracking_number": string | null,"updated_at": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "billing_address"?: Json | null,"created_at"?: string,"currency"?: string,"customer_name"?: string | null,"discount_cents"?: number,"discount_code"?: string | null,"discount_code_id"?: string | null,"email"?: string | null,"fulfillment_status"?: string,"id"?: string,"notes"?: string | null,"order_number"?: number,"paid_at"?: string | null,"payment_status"?: string,"reservation_expires_at"?: string | null,"shipped_at"?: string | null,"shipping_address"?: Json | null,"shipping_cents"?: number,"status"?: string,"stripe_checkout_session_id"?: string | null,"stripe_payment_intent_id"?: string | null,"subtotal_cents": number,"tax_cents"?: number,"total_cents": number,"tracking_carrier"?: string | null,"tracking_number"?: string | null,"updated_at"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "billing_address"?: Json | null,"created_at"?: string,"currency"?: string,"customer_name"?: string | null,"discount_cents"?: number,"discount_code"?: string | null,"discount_code_id"?: string | null,"email"?: string | null,"fulfillment_status"?: string,"id"?: string,"notes"?: string | null,"order_number"?: number,"paid_at"?: string | null,"payment_status"?: string,"reservation_expires_at"?: string | null,"shipped_at"?: string | null,"shipping_address"?: Json | null,"shipping_cents"?: number,"status"?: string,"stripe_checkout_session_id"?: string | null,"stripe_payment_intent_id"?: string | null,"subtotal_cents"?: number,"tax_cents"?: number,"total_cents"?: number,"tracking_carrier"?: string | null,"tracking_number"?: string | null,"updated_at"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_discount_code_id_fkey"
      columns: ["discount_code_id"]
isOneToOne: false
      referencedRelation: "discount_codes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"product_collections": {
                  Row: {
                    "collection_id": string,"product_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_id": string,"product_id": string,"sort_order"?: number
                  }
                  Update: {
                    "collection_id"?: string,"product_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_collections_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_collections_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "product_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_collections_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_images": {
                  Row: {
                    "alt": string,"color_name": string | null,"created_at": string,"id": string,"product_id": string,"sort_order": number,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string,"color_name"?: string | null,"created_at"?: string,"id"?: string,"product_id": string,"sort_order"?: number,"url": string
                  }
                  Update: {
                    "alt"?: string,"color_name"?: string | null,"created_at"?: string,"id"?: string,"product_id"?: string,"sort_order"?: number,"url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "product_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "color_hex": string,"color_name": string,"created_at": string,"id": string,"is_active": boolean,"price_override_cents": number | null,"product_id": string,"size": string,"size_sort": number,"sku": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color_hex": string,"color_name": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"price_override_cents"?: number | null,"product_id": string,"size": string,"size_sort"?: number,"sku": string
                  }
                  Update: {
                    "color_hex"?: string,"color_name"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"price_override_cents"?: number | null,"product_id"?: string,"size"?: string,"size_sort"?: number,"sku"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "product_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "care": string | null,"category_id": string | null,"compare_at_cents": number | null,"created_at": string,"description": string,"details": (string)[],"fit": string | null,"id": string,"is_featured": boolean,"is_new": boolean,"materials": string | null,"name": string,"popularity": number,"price_cents": number,"published_at": string | null,"search": unknown,"slug": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "care"?: string | null,"category_id"?: string | null,"compare_at_cents"?: number | null,"created_at"?: string,"description"?: string,"details"?: (string)[],"fit"?: string | null,"id"?: string,"is_featured"?: boolean,"is_new"?: boolean,"materials"?: string | null,"name": string,"popularity"?: number,"price_cents": number,"published_at"?: string | null,"search"?: never,"slug": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "care"?: string | null,"category_id"?: string | null,"compare_at_cents"?: number | null,"created_at"?: string,"description"?: string,"details"?: (string)[],"fit"?: string | null,"id"?: string,"is_featured"?: boolean,"is_new"?: boolean,"materials"?: string | null,"name"?: string,"popularity"?: number,"price_cents"?: number,"published_at"?: string | null,"search"?: never,"slug"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string,"full_name": string | null,"id": string,"phone": string | null,"role": string,"stripe_customer_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"full_name"?: string | null,"id": string,"phone"?: string | null,"role"?: string,"stripe_customer_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string,"phone"?: string | null,"role"?: string,"stripe_customer_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"stripe_events": {
                  Row: {
                    "id": string,"processed_at": string,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"processed_at"?: string,"type": string
                  }
                  Update: {
                    "id"?: string,"processed_at"?: string,"type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"wishlist_items": {
                  Row: {
                    "created_at": string,"product_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"product_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"product_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishlist_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "product_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishlist_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishlist_items_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "product_cards": {
                  Row: {
                    "category_id": string | null,"category_name": string | null,"category_slug": string | null,"colors": Json | null,"compare_at_cents": number | null,"created_at": string,"id": string,"images": Json | null,"is_featured": boolean,"is_new": boolean,"name": string,"popularity": number,"price_cents": number,"published_at": string | null,"sizes": (string)[] | null,"slug": string,"status": string,"total_stock": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "admin_best_sellers":
{ Args: { "p_limit"?: number }; Returns: {
              "image_url": string,"name": string,"product_id": string,"revenue_cents": number,"slug": string,"units": number
            }[]
                           },
"admin_dashboard_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"attach_checkout_session":
{ Args: { "p_order_id": string,"p_session_id": string }; Returns: undefined
                           },
"catalog_facets":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"create_pending_order":
{ Args: { "p_discount_cents": number,"p_discount_code_id": string,"p_email": string,"p_expires_at": string,"p_items": Json,"p_shipping_cents": number,"p_subtotal_cents": number,"p_total_cents": number,"p_user_id": string }; Returns: {
              "order_id": string,"order_number": number
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"mark_order_paid":
{ Args: { "p_amount_total": number,"p_billing_address": Json,"p_customer_name": string,"p_email": string,"p_payment_intent_id": string,"p_session_id": string,"p_shipping_address": Json,"p_shipping_cents"?: number }; Returns: string
                           },
"release_expired_orders":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"release_order":
{ Args: { "p_order_id": string,"p_status"?: string }; Returns: boolean
                           },
"search_products":
{ Args: { "p_category"?: string,"p_collection"?: string,"p_colors"?: (string)[],"p_in_stock"?: boolean,"p_limit"?: number,"p_max_price"?: number,"p_min_price"?: number,"p_offset"?: number,"p_query"?: string,"p_sizes"?: (string)[],"p_sort"?: string }; Returns: {
              "category_slug": string,"colors": Json,"compare_at_cents": number,"id": string,"images": Json,"is_new": boolean,"name": string,"price_cents": number,"sizes": (string)[],"slug": string,"total_count": number,"total_stock": number
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
