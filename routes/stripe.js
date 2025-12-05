const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/create-checkout-session - Create Stripe checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res, next) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        error: 'Price ID manquant'
      });
    }

    // Get or create Stripe customer
    let customerId;
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: req.user.id
        }
      });
      customerId = customer.id;

      // Create or update subscription record
      await prisma.subscription.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          stripeCustomerId: customerId,
          status: 'INACTIVE'
        },
        update: {
          stripeCustomerId: customerId
        }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CORS_ORIGIN}/dashboard?success=true`,
      cancel_url: `${process.env.CORS_ORIGIN}/pricing?canceled=true`,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    next(error);
  }
});

// GET /api/stripe/subscription - Get user subscription info
router.get('/subscription', authMiddleware, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
      select: {
        status: true,
        stripeCurrentPeriodEnd: true,
        user: {
          select: {
            plan: true,
            _count: {
              select: {
                projects: true
              }
            }
          }
        }
      }
    });

    if (!subscription) {
      return res.json({
        plan: 'FREE',
        status: 'INACTIVE',
        projectsCount: 0,
        projectsRemaining: 2
      });
    }

    const projectsRemaining = subscription.user.plan === 'FREE' ?
      Math.max(0, 2 - subscription.user._count.projects) :
      null; // null = unlimited

    res.json({
      plan: subscription.user.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.stripeCurrentPeriodEnd,
      projectsCount: subscription.user._count.projects,
      projectsRemaining
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/stripe/cancel-subscription - Cancel subscription
router.post('/cancel-subscription', authMiddleware, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription?.stripeSubscriptionId) {
      return res.status(404).json({
        error: 'Aucun abonnement actif'
      });
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update database
    await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        status: 'CANCELLED'
      }
    });

    res.json({
      success: true,
      message: 'Abonnement annulé. Vous conservez l\'accès jusqu\'à la fin de la période.'
    });

  } catch (error) {
    console.error('Stripe cancel error:', error);
    next(error);
  }
});

// POST /api/stripe/webhook - Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;

        if (userId) {
          // Get subscription details
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription
          );

          // Determine plan based on price ID
          let plan = 'FREE';
          if (stripeSubscription.items.data[0].price.id === process.env.STRIPE_PRICE_ID_PRO) {
            plan = 'PRO';
          } else if (stripeSubscription.items.data[0].price.id === process.env.STRIPE_PRICE_ID_BUSINESS) {
            plan = 'BUSINESS';
          }

          // Update user and subscription
          await prisma.$transaction([
            prisma.user.update({
              where: { id: userId },
              data: { plan }
            }),
            prisma.subscription.upsert({
              where: { userId },
              create: {
                userId,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                stripePriceId: stripeSubscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                status: 'ACTIVE'
              },
              update: {
                stripeSubscriptionId: session.subscription,
                stripePriceId: stripeSubscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                status: 'ACTIVE'
              }
            })
          ]);

          console.log(`✅ Subscription activated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' :
                    subscription.status === 'past_due' ? 'PAST_DUE' :
                    subscription.status === 'canceled' ? 'CANCELLED' : 'INACTIVE',
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });

        console.log(`✅ Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Downgrade to free plan
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          include: { user: true }
        });

        if (dbSubscription) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: dbSubscription.userId },
              data: { plan: 'FREE' }
            }),
            prisma.subscription.update({
              where: { stripeSubscriptionId: subscription.id },
              data: { status: 'CANCELLED' }
            })
          ]);

          console.log(`✅ Subscription cancelled, user downgraded to FREE`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
