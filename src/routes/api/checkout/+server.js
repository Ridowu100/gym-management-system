import { json } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

export async function POST({ request }) {
  try {
    const { items, email } = await request.json();

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: [item.image_url]
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${request.headers.get('origin')}/orders?success=true`,
      cancel_url: `${request.headers.get('origin')}/cart?canceled=true`
    });

    return json({ url: session.url });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}