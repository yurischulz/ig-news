import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Product } from "schema-dts";
import { JsonLd } from "react-schemaorg";

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome!</span>
          <h1>
            News about <br />
            the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>

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
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1JSVKRKWYOS0lKULZKW4H2yL', {
    expand: ['product']
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100)
  };

  return {
    props: { product },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}