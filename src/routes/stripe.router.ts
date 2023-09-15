import express, { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config/config";
import { billing, checkSubscription, constructEvent, createCheckoutSession, createProduct, getProductList, stripeHooks } from "../controllers/stripe.controller";
import { isAuthenticated, isAuthenticatedWithQuery } from "../middlewares/isAuthenticated";

const router = express.Router();

/**
 * Create product
 */
router.post('/product', isAuthenticated, async (_req, res, _next) => {
  try {
    const result = await createProduct()
    res.status(200).json({
      status: 'success',
      data: result
    })
  } catch (err: any) {
    console.log(err.message)
    res.status(400).json({
      status: 'failed',
      error: {
        message: err.message
      }
    })
  }
})

/**
 * Get Product list including prices
 */
router.get("/products",
  async (_req, res, _next) => {
    try {
      const products = await getProductList()
      res.status(200).json({
        status: 'success',
        data: {
          products,
          publishable: config.stripePublishableKey
        }
      })
    } catch (err: any) {
      res.status(400).json({
        status: 'failed',
        error: {
          message: err.message
        }
      })
    }

  }
);

/**
 * Create customer portal session
 */
router.get('/billing', async (req: Request, res: Response) => {
  // Authenticate your user.
  const userId = Number(req.query.userId)
  try {
    const session = await billing(userId);
    res.redirect(session.url);
  } catch(err: any) {
    res.redirect(`${config.frontend}/app/billing?error=${err.message}`)
  }
});

/**
 * Check if subscription was created
 */
router.get('/subscription', isAuthenticated, async (req: Request, res: Response) => {
  // Authenticate your user.
  const userId = Number((req.user as any).data.id)
  try {
    const result = await checkSubscription(userId);
    res.status(200).json({
      status: 'success',
      data: result
    })
  } catch (err: any) {
    res.status(400).json({
      status: 'failed',
      error: {
        message: err.message
      }
    })
  }
});

/**
 * Create checkout page
 */
router.get('/checkout', isAuthenticatedWithQuery, async (req: Request, res: Response) => {
  const priceId = req.query.priceId as string;
  const userId = (req.user as any).data.id as string;
  const frontendHost = config.frontend as string;
  try {
    const url = await createCheckoutSession(userId, priceId, frontendHost)
    res.redirect(url)
    return
  } catch (err: any) {
    console.log(err)
    if (err.message === 'joined') {
      // You have already purchased a plan
      res.redirect(`${frontendHost}/app/billing?error=Already joined in this subscription`)
      return
    }
    res.redirect(`${frontendHost}?error=${err.message}`)
  }
})

/**
 * Webhooks for stripe
 */
router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | string[] | Buffer;
  console.log('sig => ', sig)
  let event: Stripe.Event = req.body;

  try {
    event = constructEvent((req as any).rawBody, sig, config.stripeWebHookSecretKey);
  } catch (err: any) {
    console.log("error => ", err.message)
  }

  // Handle the event
  console.log(`Unhandled event type ${event.type}`);

  try {
    await stripeHooks(event);
  } catch (err) {
    console.log(err)
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

export default router;
