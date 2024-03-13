/* eslint-disable */

import axios from 'axios';
const stripe = Stripe(
  'pk_test_51OpAylKYBkGnY8SUny0wdCdnhqhUUtnS0XjGGEYfnIvzVcMlYxedKfZxfZg3Mhl04cbxClMB0hw26VUVATEQDBNs00PRsCZF20',
);

export const bookTour = async (tourId) => {
  // 1) Get checkout session from API
  const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
  // 2) Create checkout form + charge credit card
  await stripe.redirectToCheckout({
    sessionId: session.data.session.id,
  });
};
