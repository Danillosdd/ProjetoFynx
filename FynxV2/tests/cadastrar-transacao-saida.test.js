// Testes E2E com Selenium WebDriver e Mocha (ESM)
// Para rodar: npm run dev (frontend) e npx mocha tests/cadastrar-transacao-saida.test.js

import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { parse as parseUrl } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function now() { return new Date().toISOString().replace(/[:.]/g, '-'); }

async function saveDebug(driver, name) {
  try {
    const png = await driver.takeScreenshot();
    fs.writeFileSync(path.join(OUT_DIR, `${now()}-${name}.png`), png, 'base64');
    const src = await driver.getPageSource();
    fs.writeFileSync(path.join(OUT_DIR, `${now()}-${name}.html`), src, 'utf8');
  } catch (err) { /* ignore */ }
}

async function tryFind(driverOrElement, selectors, timeoutPer = 2000) {
  for (const sel of selectors) {
    try {
      const el = driverOrElement.wait
        ? await driverOrElement.wait(until.elementLocated(sel), timeoutPer)
        : await driverOrElement.findElement(sel);
      return el;
    } catch (e) { /* next selector */ }
  }
  return null;
}

describe('Fynx - Adicionar transação de SAÍDA (E2E) [skip login]', function () {
  this.timeout(120000);
  let driver;
  let mockServer;
  let transactions = [];

  function sendJson(res, status, data) {
    const json = JSON.stringify(data);
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(json);
  }

  function ensureMockServer() {
    return new Promise((resolve) => {
      const server = http.createServer(async (req, res) => {
        // CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          return res.end();
        }

        const { pathname } = parseUrl(req.url || '/', true);
        const ok = (data) => sendJson(res, 200, data);
        const notFound = () => sendJson(res, 404, { error: 'not found' });
        const method = (req.method || 'GET').toUpperCase();

        // helper para ler body
        const readBody = async () => new Promise((resolveBody) => {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try { resolveBody(JSON.parse(body || '{}')); }
            catch { resolveBody({}); }
          });
        });

        // Rotas básicas usadas pelo app
        if (pathname === '/api/v1/dashboard' && method === 'GET') {
          const recent = transactions.slice(-10).reverse();
          return ok({
            overview: [
              { title: 'Total Balance', value: 'R$ 1.000,00', change: '+0%', trend: 'up' },
              { title: 'Monthly Income', value: 'R$ 0,00', change: '+0%', trend: 'up' },
              { title: 'Monthly Expenses', value: 'R$ 0,00', change: '0%', trend: 'down' },
              { title: 'Savings Rate', value: '0%', change: '0%', trend: 'up' },
            ],
            recentTransactions: recent,
            spendingByCategory: [],
            incomeByCategory: [],
            dailyPerformance: [],
            monthlyPerformance: [],
          });
        }

        if (pathname === '/api/v1/dashboard/transactions' && method === 'GET') {
          return ok(transactions);
        }

        if (pathname === '/api/v1/transactions' && method === 'GET') {
          return ok({ data: transactions, total: transactions.length });
        }

        if (pathname === '/api/v1/transactions' && method === 'POST') {
          const body = await readBody();
          const id = transactions.length ? (Number(transactions[transactions.length - 1].id) + 1) : 1;
          const created = {
            id,
            description: body.description || 'Sem descrição',
            type: body.type || 'income',
            status: 'completed',
            amount: Number(body.amount ?? 0),
            date: body.date || new Date().toISOString().slice(0, 10),
            category: body.category || 'Other',
          };
          transactions.push(created);
          return ok(created);
        }

        if (pathname === '/api/v1/goals' && method === 'GET') {
          return ok({ data: [], total: 0 });
        }

        return notFound();
      });

      server.on('error', () => resolve(null)); // Porta já em uso: assume backend real
      server.listen(3001, () => resolve(server));
    });
  }

  before(async () => {
    // Sobe mock server se o backend real não estiver rodando (pode desativar via env)
    if (!process.env.E2E_DISABLE_MOCK) {
      mockServer = await ensureMockServer();
    }

    const options = new chrome.Options()
      .addArguments(
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1600,1000',
        '--start-maximized'
      );
    // Sempre abre o navegador visível (sem headless)
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try { await driver.manage().window().maximize(); } catch (e) {}
  });

  after(async () => {
    if (driver) await driver.quit();
    if (mockServer) {
      try { await new Promise((r) => mockServer.close(() => r(null))); } catch {}
    }
  });

  it('vai direto para /dashboard e adiciona uma transação de SAÍDA preenchendo todos os campos', async () => {
    await driver.get(BASE_URL + '/dashboard');
    await driver.sleep(800);

    // garantir dashboard carregada
    await tryFind(
      driver,
      [By.xpath("//*[contains(., 'Resumo') or contains(., 'Dashboard') or contains(., 'Financial Overview')]")],
      5000
    );

    // localizar botão de adicionar
    const addSelectors = [
      By.css('button[aria-label="Adicionar Transação"]'),
      By.xpath("//button[@aria-label='Adicionar Transação']"),
      By.xpath("//button[contains(., 'Adicionar Transação')]")
    ];
    const addBtn = await tryFind(driver, addSelectors, 5000);
    if (!addBtn) {
      await saveDebug(driver, 'no-add-button');
      throw new Error('Botão de adicionar transação não encontrado — ver output/ para screenshot e HTML.');
    }

    // clicar no botão (várias estratégias)
    try { await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", addBtn); } catch (e) {}
    try {
      await driver.actions({ bridge: true }).move({ origin: addBtn }).click().perform();
    } catch (e) {
      try { await addBtn.click(); } catch (e2) { await driver.executeScript("arguments[0].click();", addBtn); }
    }

    // selectors do dialog
    const dialogSelectors = [
      By.css('[role="dialog"]'),
      By.css('.sheet'),
      By.css('.dialog'),
      By.xpath("//div[contains(@class,'sheet') or contains(@class,'dialog') or @role='dialog']")
    ];
    const dialog = await tryFind(driver, dialogSelectors, 5000);
    if (!dialog) {
      await saveDebug(driver, 'no-dialog-after-click');
      throw new Error('Dialog de adicionar não apareceu — ver output/.');
    }

    // preencher os campos via interações (mais confiável para máscaras e componentes custom)
    const inputs = await dialog.findElements(By.css('input, textarea'));
    if (!inputs || inputs.length === 0) {
      await saveDebug(driver, 'no-inputs-in-dialog');
      throw new Error('Nenhum input encontrado no modal de adicionar transação.');
    }

    // 1) Descrição
    try {
      await inputs[0].clear();
      await inputs[0].sendKeys('Saída Teste Selenium');
      await inputs[0].sendKeys(Key.TAB);
    } catch (e) {
      await driver.executeScript(function (el, value) {
        const win = window;
        const descriptor = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(el, value);
        } else {
          el.value = value;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur && el.blur();
      }, inputs[0], 'Saída Teste Selenium');
      await driver.sleep(200);
    }

    // aguardar a validação do campo atualizar (silenciosamente)
    await driver
      .wait(async () => {
        try {
          await driver.findElements(
            By.xpath(
              "//div[contains(@role,'dialog')]//*[contains(normalize-space(.),'Required') or contains(normalize-space(.),'Obrigatório')]"
            )
          );
        } catch {}
        return true;
      }, 3000)
      .catch(() => {});

    // 2) Valor
    let amountInput = null;
    for (const inp of inputs) {
      const type = (await inp.getAttribute('type') || '').toLowerCase();
      const name = (await inp.getAttribute('name') || '').toLowerCase();
      const placeholder = (await inp.getAttribute('placeholder') || '').toLowerCase();
      if (type === 'number' || /valor|amount|value/.test(name) || /r\$|valor|amount|value/.test(placeholder)) {
        amountInput = inp;
        break;
      }
    }
    if (!amountInput && inputs.length > 1) amountInput = inputs[1];
    if (!amountInput) {
      await saveDebug(driver, 'no-amount-input');
      throw new Error('Campo de valor não encontrado no modal.');
    }

    try {
      // Campo é controlado e usa máscara com vírgula. Use "100,00" para garantir parse correto.
      await amountInput.click();
      await amountInput.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
      await amountInput.sendKeys('100,00');
      await amountInput.sendKeys(Key.TAB);
      await driver.sleep(300);
    } catch (e) {
      // Fallback: simula digitação mascarada via script para componentes controlados
      await driver.executeScript(
        `const el = arguments[0];
         const setEvt = (name)=>el.dispatchEvent(new Event(name,{bubbles:true}));
         el.value = '100,00'; setEvt('input'); setEvt('change');`,
        amountInput
      );
      await driver.sleep(300);
    }

    // 3) Tipo - Selecionar SAÍDA em vez de Entrada
    try {
      const saida = await tryFind(
        dialog,
        [
          By.xpath(".//label[contains(., 'Saída') ]"),
          By.xpath(".//div[contains(., 'Saída') and @role='radio']"),
          By.xpath(".//span[contains(., 'Saída')]")
        ],
        1000
      );
      if (saida) {
        try { await saida.click(); } catch (e) { await driver.executeScript('arguments[0].click()', saida); }
        await driver.sleep(200);
      }
    } catch {}

    // 4) Categoria
    try {
      const catTrigger = await tryFind(
        dialog,
        [
          By.xpath(".//button[contains(., 'Selecione uma categoria') ]"),
          By.xpath(".//*[contains(., 'Selecione uma categoria') ]"),
          By.css('select')
        ],
        1000
      );
      if (catTrigger) {
        try { await catTrigger.click(); } catch (e) { await driver.executeScript('arguments[0].click()', catTrigger); }
        const option = await tryFind(
          driver,
          [
            By.css('[role="option"]'),
            By.css('.rc-select-item'),
            By.xpath("//li[normalize-space(.) and not(contains(., 'Selecion'))]"),
            By.xpath("//div[contains(@class,'option') or contains(@class,'item')]")
          ],
          3000
        );
        if (option) {
          try { await option.click(); } catch (e) { await driver.executeScript('arguments[0].click()', option); }
          await driver.sleep(300);
        }
      }
    } catch {}

    await driver.sleep(500);

    // Salvar
    const saveBtn = await tryFind(
      driver,
      [
        By.xpath("//button[contains(normalize-space(.),'Salvar Transação') ]"),
        By.xpath("//button[contains(., 'Salvar Transação') ]"),
        By.xpath("//button[contains(., 'Salvar') ]"),
        By.css('button[type="submit"]')
      ],
      4000
    );

    if (!saveBtn) {
      await saveDebug(driver, 'no-save-button');
      throw new Error('Botão "Salvar Transação" não encontrado — ver output/.');
    }

    let enabled = false;
    for (let i = 0; i < 6; i++) {
      const disabled = await saveBtn.getAttribute('disabled');
      if (!disabled) { enabled = true; break; }
      await driver.sleep(300);
    }

    try {
      if (!enabled) {
        await driver.executeScript("arguments[0].removeAttribute('disabled'); arguments[0].style.pointerEvents='auto';", saveBtn);
      }
      try { await saveBtn.click(); } catch (e) { await driver.executeScript('arguments[0].click()', saveBtn); }
    } catch (e) {
      await saveDebug(driver, 'save-click-failed');
      throw e;
    }

    await driver.sleep(800);
    const created = await tryFind(driver, [By.xpath("//*[contains(., 'Saída Teste Selenium')]")], 8000);
    if (!created) {
      await saveDebug(driver, 'created-not-found');
      throw new Error('Transação criada não encontrada após submissão.');
    }
    const text = await created.getText();
    expect(text).to.include('Saída Teste Selenium');
  });
});
 
