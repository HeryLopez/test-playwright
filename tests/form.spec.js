import { expect, test } from "@playwright/test";

const DELAY = 400;

test.describe("Formulario de Contacto", () => {
  test("debe mostrar el formulario correctamente", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("Formulario de Contacto");
    await expect(page.locator("#nombre")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#edad")).toBeVisible();
    await expect(page.locator("#mensaje")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText("Enviar");
  });

  test("debe llenar el formulario y mostrar los datos en la pantalla de resultado", async ({
    page,
  }) => {
    await page.goto("/");

    // Llenar el formulario
    await page.locator("#nombre").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#nombre", "Juan Pérez");
    await page.waitForTimeout(DELAY);

    await page.locator("#email").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#email", "juan@ejemplo.com");
    await page.waitForTimeout(DELAY);

    await page.locator("#edad").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#edad", "30");
    await page.waitForTimeout(DELAY);

    await page.locator("#mensaje").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#mensaje", "Hola, este es un mensaje de prueba");
    await page.waitForTimeout(DELAY);

    // Enviar el formulario
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Verificar que estamos en la página de resultados
    await expect(page).toHaveURL("/resultado");
    await expect(page.locator("h1")).toHaveText("Datos Recibidos");

    // Verificar que los datos se muestran correctamente
    await expect(page.locator('[data-testid="result-nombre"]')).toHaveText(
      "Juan Pérez",
    );
    await expect(page.locator('[data-testid="result-email"]')).toHaveText(
      "juan@ejemplo.com",
    );
    await expect(page.locator('[data-testid="result-edad"]')).toHaveText("30");
    await expect(page.locator('[data-testid="result-mensaje"]')).toHaveText(
      "Hola, este es un mensaje de prueba",
    );
  });

  test("debe poder volver al formulario desde la página de resultados", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("#nombre").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#nombre", "Ana García");
    await page.waitForTimeout(DELAY);

    await page.locator("#email").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#email", "ana@ejemplo.com");
    await page.waitForTimeout(DELAY);

    await page.locator("#edad").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#edad", "25");
    await page.waitForTimeout(DELAY);

    await page.locator("#mensaje").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#mensaje", "Mensaje de prueba");
    await page.waitForTimeout(DELAY);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/resultado");

    // Hacer clic en "Volver al formulario"
    await page.click("text=Volver al formulario");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toHaveText("Formulario de Contacto");
  });

  test("no debe enviar el formulario si hay campos vacíos", async ({
    page,
  }) => {
    await page.goto("/");

    // Intentar enviar sin llenar nada
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Debemos seguir en la misma página (el formulario HTML5 validation bloquea el envío)
    await expect(page).toHaveURL("/");
  });

  test("debe mostrar mensaje cuando se accede a /resultado sin datos", async ({
    page,
  }) => {
    await page.goto("/resultado");
    await page.waitForTimeout(500);

    await expect(page.locator("h1")).toHaveText("Sin datos");
    await expect(
      page.locator("text=No se han enviado datos del formulario"),
    ).toBeVisible();
  });
});
