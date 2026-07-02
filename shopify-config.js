/* ============================================================
   Shopify Storefront API config — safe to expose client-side.
   Storefront tokens (unlike Admin tokens) are designed to be
   public; they only grant read/checkout access, scoped by the
   API scopes enabled on the custom app in Shopify.
   ============================================================ */
window.SHOPIFY_CONFIG = {
  domain: "oliver-samuels-merch.myshopify.com",
  storefrontToken: "ce1e8a8fc11e7557d398f7a76282697f",
  apiVersion: "2024-10",
};
