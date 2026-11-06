import { test, expect } from "@playwright/test";

const CART_ID = "cd0c5366-207b-4603-8452-f629abf55b33";
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const JWT = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: CART_ID, iat: 1 })}.x`;

test("selector de método de pago: MP izquierda, Webpay derecha", async ({ page }) => {
  await page.goto(`/${JWT}`);

  // Título sobre los logos
  await expect(page.getByText("Seleccione el método de pago")).toBeVisible({ timeout: 20000 });

  const mp = page.getByRole("button", { name: "Pagar con Mercado Pago" });
  const wp = page.getByRole("button", { name: "Pagar con Webpay" });
  await expect(mp).toBeVisible();
  await expect(wp).toBeVisible();

  // Orden: MercadoPago a la izquierda de Webpay
  const mpBox = await mp.boundingBox();
  const wpBox = await wp.boundingBox();
  expect(mpBox!.x).toBeLessThan(wpBox!.x);

  // El título queda arriba de los logos
  const title = await page.getByText("Seleccione el método de pago").boundingBox();
  expect(title!.y).toBeLessThan(mpBox!.y);

  // Flujo MercadoPago: click crea preferencia y redirige al checkout de MP
  await page.route("**mercadopago**", (r) =>
    r.fulfill({ status: 200, contentType: "text/html", body: "<html><body>MP-CHECKOUT</body></html>" })
  );
  await mp.click();
  await page.waitForURL(/mercadopago/, { timeout: 20000 });
  expect(page.url()).toContain("mercadopago");
});
