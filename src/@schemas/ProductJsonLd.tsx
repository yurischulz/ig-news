import { Product } from "schema-dts";
import { JsonLd } from "react-schemaorg";

interface ProductJsonProps {
  product: any;
}

export default function ProductJsonLd({ product }: ProductJsonProps) {
  return (
    <JsonLd<Product>
      item={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Subscription",
        description: "News about the React world. Get access to all the publications monthly",
        productID: product.priceId,
        sku: product.priceId,
        category: "Subscriptions",
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "price": product.amount,
          "priceCurrency": "USD"
        },
      }}
    />
  )
}