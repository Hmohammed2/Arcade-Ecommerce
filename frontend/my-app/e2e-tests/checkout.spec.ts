import { test, expect } from "@playwright/test";

test("full purchase flow works", async ({ page }) => {
  // 1️⃣ Home page
  await page.goto("http://localhost:3000");
  await expect(page).toHaveURL("/");

  // 2️⃣ Go to shop
  await page.click('a[href="/shop"]');
  await expect(page).toHaveURL("/shop");

  // Go to product page
  await page.click('a[href="/products/sanwa-jlf"]');
  await expect(page).toHaveURL(/\/products\/sanwa-jlf$/);

  // Select quantity
  await page.selectOption("#quantity", "2");

  // Wait for quantity to update (if needed)
  await page.waitForSelector('#quantity option[value="2"]');

  // 3️⃣ Add to basket
  await page.waitForSelector("#add-to-basket-button", { state: "visible" });

  // Add to basket
  await page.click("#add-to-basket-button");

  // Confirm added
  await expect(page.locator("text=Added to cart")).toBeVisible();

  // 4️⃣ Go to cart
  await page.click('a[href="/cart"]');
  await expect(page).toHaveURL("/cart");

  // Validate cart item exists
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

  // 5️⃣ Go to checkout
  await page.click('a[href="/checkout"]');
  await expect(page).toHaveURL("/checkout");

  // 6️⃣ Fill billing details
  await page.fill('input[name="billingFirstName"]', "Hamza");
  await page.fill('input[name="billingLastName"]', "Mohammed");
  await page.fill('input[name="billingEmail"]', "test@example.com");

  await page.fill('input[name="shippingAddress1"]', "10 Downing Street");
  await page.fill('input[name="shippingCity"]', "London");
  await page.fill('input[name="shippingPostcode"]', "SW1A 2AA");

  await page.selectOption('select[name="shippingMethod"]', {
    label: "Standard Shipping",
  });

  // Wait for Stripe element to mount
  await page.waitForSelector("iframe[name^='__privateStripeFrame']");

  // 7️⃣ Fill Stripe card (test mode)
  const stripeFrame = page.frameLocator("iframe[name^='__privateStripeFrame']");

  await stripeFrame
    .locator("input[name='cardnumber']")
    .fill("4242424242424242");
  await stripeFrame.locator("input[name='exp-date']").fill("12 / 34");
  await stripeFrame.locator("input[name='cvc']").fill("123");
  await stripeFrame.locator("input[name='postal']").fill("SW1A 2AA");

  // 8️⃣ Click pay
  await page.click('button[type="submit"]');

  // 9️⃣ Wait for redirect
  await page.waitForURL("**/checkout-success");

  // 10️⃣ Validate success page
  await expect(page).toHaveURL("/checkout-success");
  await expect(page.locator("text=Thank you")).toBeVisible();
});
