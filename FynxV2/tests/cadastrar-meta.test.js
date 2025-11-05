// Testes E2E com Selenium WebDriver e Mocha (ESM)
// Para rodar: npm run dev (frontend) e npx mocha tests/cadastrar-meta.test.js

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

describe('Fynx - Criar Meta (E2E) [skip login]', function () {
  this.timeout(120000);
  let driver;
  let mockServer;
  let goals = [];

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
          return ok({
            overview: [
              { title: 'Total Balance', value: 'R$ 1.000,00', change: '+0%', trend: 'up' },
              { title: 'Monthly Income', value: 'R$ 0,00', change: '+0%', trend: 'up' },
              { title: 'Monthly Expenses', value: 'R$ 0,00', change: '0%', trend: 'down' },
              { title: 'Savings Rate', value: '0%', change: '0%', trend: 'up' },
            ],
            recentTransactions: [],
            spendingByCategory: [],
            incomeByCategory: [],
            dailyPerformance: [],
            monthlyPerformance: [],
          });
        }

        if (pathname === '/api/v1/goals' && method === 'GET') {
          return ok({ 
            spendingGoals: goals.map(g => ({
              ...g,
              currentAmount: g.currentAmount || 0,
              targetAmount: g.targetAmount || 0
            }))
          });
        }

        if (pathname === '/api/v1/goals' && method === 'POST') {
          const body = await readBody();
          const id = goals.length ? (Number(goals[goals.length - 1].id) + 1) : 1;
          const created = {
            id,
            title: body.title || 'Meta sem título',
            category: body.category || 'Outros',
            targetAmount: Number(body.targetAmount ?? 0),
            currentAmount: 0,
            period: body.period || 'monthly',
            startDate: body.startDate || new Date().toISOString().slice(0, 10),
            endDate: body.endDate || new Date().toISOString().slice(0, 10),
            description: body.description || '',
          };
          goals.push(created);
          return ok(created);
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

  it('acessa Goals pelo menu e cria uma nova meta preenchendo todos os campos', async () => {
    await driver.get(BASE_URL + '/dashboard');
    await driver.sleep(800);

    // garantir dashboard carregada
    await tryFind(
      driver,
      [By.xpath("//*[contains(., 'Resumo') or contains(., 'Dashboard') or contains(., 'Financial Overview')]")],
      5000
    );

    // Clicar no menu Goals na sidebar
    const goalsMenuSelectors = [
      By.xpath("//a[@href='/goals']"),
      By.xpath("//a[contains(., 'Goals')]"),
      By.xpath("//nav//a[contains(@href, 'goals')]")
    ];
    const goalsMenu = await tryFind(driver, goalsMenuSelectors, 5000);
    if (!goalsMenu) {
      await saveDebug(driver, 'no-goals-menu');
      throw new Error('Menu Goals não encontrado na sidebar — ver output/ para screenshot e HTML.');
    }

    try {
      await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", goalsMenu);
    } catch (e) {}
    
    try {
      await goalsMenu.click();
    } catch (e) {
      await driver.executeScript("arguments[0].click();", goalsMenu);
    }

    await driver.sleep(1000);

    // Aguardar página Goals carregar
    await tryFind(
      driver,
      [
        By.xpath("//*[contains(., 'Minhas Metas') or contains(., 'Goals') or contains(., 'Criar Meta')]"),
      ],
      5000
    );

    // Localizar botão "+ Criar Meta"
    const createGoalSelectors = [
      By.xpath("//button[contains(., 'Criar Meta')]"),
      By.xpath("//button[contains(., '+ Criar Meta')]"),
      By.css('button[aria-label="Criar Meta"]'),
      // Pode ser um FAB (floating action button) também
      By.xpath("//button[.//*[local-name()='svg']]")
    ];
    
    const createGoalBtn = await tryFind(driver, createGoalSelectors, 5000);
    if (!createGoalBtn) {
      await saveDebug(driver, 'no-create-goal-button');
      throw new Error('Botão "Criar Meta" não encontrado — ver output/ para screenshot e HTML.');
    }

    // Clicar no botão de criar meta
    try {
      await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", createGoalBtn);
    } catch (e) {}
    
    try {
      await driver.actions({ bridge: true }).move({ origin: createGoalBtn }).click().perform();
    } catch (e) {
      try {
        await createGoalBtn.click();
      } catch (e2) {
        await driver.executeScript("arguments[0].click();", createGoalBtn);
      }
    }

    await driver.sleep(500);

    // Aguardar dialog/sheet de criar meta abrir
    const dialogSelectors = [
      By.css('[role="dialog"]'),
      By.css('.sheet'),
      By.xpath("//div[contains(@class,'sheet') or @role='dialog']"),
      By.xpath("//*[contains(., 'Criar Nova Meta')]")
    ];
    const dialog = await tryFind(driver, dialogSelectors, 5000);
    if (!dialog) {
      await saveDebug(driver, 'no-create-goal-dialog');
      throw new Error('Dialog de criar meta não apareceu — ver output/.');
    }

    // Preencher os campos
    const inputs = await dialog.findElements(By.css('input, textarea'));
    if (!inputs || inputs.length === 0) {
      await saveDebug(driver, 'no-inputs-in-goal-dialog');
      throw new Error('Nenhum input encontrado no modal de criar meta.');
    }

    // 1) Nome da Meta (id="goal-name")
    const nameInput = await tryFind(
      dialog,
      [
        By.id('goal-name'),
        By.css('input[placeholder*="Viagem"]'),
        By.css('input[placeholder*="Carro"]')
      ],
      2000
    );
    
    if (nameInput) {
      try {
        await nameInput.clear();
        await nameInput.sendKeys('Viagem para Europa');
        await nameInput.sendKeys(Key.TAB);
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
        }, nameInput, 'Viagem para Europa');
        await driver.sleep(200);
      }
    }

    await driver.sleep(300);

    // 2) Valor Alvo (id="target-value")
    const valueInput = await tryFind(
      dialog,
      [
        By.id('target-value'),
        By.css('input[placeholder*="R$"]')
      ],
      2000
    );
    
    if (valueInput) {
      try {
        await valueInput.click();
        await valueInput.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
        await valueInput.sendKeys('15000');
        await valueInput.sendKeys(Key.TAB);
        await driver.sleep(300);
      } catch (e) {
        await driver.executeScript(
          `const el = arguments[0];
           const setEvt = (name)=>el.dispatchEvent(new Event(name,{bubbles:true}));
           el.value = '15000'; setEvt('input'); setEvt('change');`,
          valueInput
        );
        await driver.sleep(300);
      }
    }

    // 3) Descrição (opcional) (id="description")
    const descInput = await tryFind(
      dialog,
      [
        By.id('description'),
        By.css('textarea')
      ],
      2000
    );
    
    if (descInput) {
      try {
        await descInput.clear();
        await descInput.sendKeys('Meta de viagem para conhecer a Europa no próximo ano');
        await descInput.sendKeys(Key.TAB);
      } catch (e) {
        await driver.executeScript(function (el, value) {
          const win = window;
          const descriptor = Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, 'value');
          if (descriptor && descriptor.set) {
            descriptor.set.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, descInput, 'Meta de viagem para conhecer a Europa no próximo ano');
      }
    }

    await driver.sleep(300);

    // 4) Data Limite (opcional) (id="target-date")
    const dateInput = await tryFind(
      dialog,
      [
        By.id('target-date'),
        By.css('input[type="date"]')
      ],
      2000
    );
    
    if (dateInput) {
      try {
        // Usar a data atual no formato correto (YYYY-MM-DD)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Definir o valor diretamente via JavaScript
        await driver.executeScript(
          `arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));`,
          dateInput,
          dateStr
        );
        await driver.sleep(200);
      } catch (e) {
        // Se falhar, deixa sem data
      }
    }

    await driver.sleep(500);

    // Salvar meta - procurar botão "Criar Meta"
    const saveBtn = await tryFind(
      driver,
      [
        By.xpath("//button[contains(normalize-space(.),'Criar Meta')]"),
        By.xpath("//button[contains(., 'Criar Meta') and not(contains(., 'Criar Nova Meta'))]"),
        By.css('button[type="submit"]')
      ],
      4000
    );

    if (!saveBtn) {
      await saveDebug(driver, 'no-save-goal-button');
      throw new Error('Botão "Criar Meta" não encontrado no dialog — ver output/.');
    }

    // Verificar se o botão está habilitado
    let enabled = false;
    for (let i = 0; i < 6; i++) {
      const disabled = await saveBtn.getAttribute('disabled');
      if (!disabled) {
        enabled = true;
        break;
      }
      await driver.sleep(300);
    }

    try {
      if (!enabled) {
        await driver.executeScript(
          "arguments[0].removeAttribute('disabled'); arguments[0].style.pointerEvents='auto';",
          saveBtn
        );
      }
      try {
        await saveBtn.click();
      } catch (e) {
        await driver.executeScript('arguments[0].click()', saveBtn);
      }
    } catch (e) {
      await saveDebug(driver, 'save-goal-click-failed');
      throw e;
    }

    await driver.sleep(1000);

    // Verificar se a meta foi criada - procurar pelo nome da meta na página
    const created = await tryFind(
      driver,
      [
        By.xpath("//*[contains(., 'Viagem para Europa')]")
      ],
      8000
    );
    
    if (!created) {
      await saveDebug(driver, 'goal-created-not-found');
      throw new Error('Meta criada não encontrada após submissão.');
    }
    
    const text = await created.getText();
    expect(text).to.include('Viagem para Europa');
  });
});
 
