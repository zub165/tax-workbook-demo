(function(){
'use strict';

var STORAGE_KEY = 'taxWorkbookDemo_v1';
var MILEAGE_RATE_2025 = 0.70; // IRS standard mileage rate 2025
var STD_DED_2025 = { single:15000, mfs:15000, hof:22500, mfj:30000, qss:30000 }; // approx TY2025

var uid = function(){ return Math.random().toString(36).slice(2,10); };
function num(v){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
function fmt(n){
  n = num(n);
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function fmt0(n){
  n = num(n);
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0});
}
function pkrFmt(n){
  n = num(n);
  return (n < 0 ? '-' : '') + 'PKR ' + Math.abs(n).toLocaleString('en-US',{maximumFractionDigits:0});
}
function esc(s){
  if(s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function today(){ return new Date().toISOString().slice(0,10); }

var DEFAULT = {
  entities: [
    { id:'practice', name:'Demo Medical Practice LLC', type:'S-Corp' },
    { id:'mgmt',     name:'Demo Management LLC',       type:'LLC' },
    { id:'rental',   name:'Demo Real Estate LLC',      type:'LLC' },
    { id:'holdco',   name:'Demo Holdings LLC',         type:'LLC' }
  ],
  categories: [
    {name:'Service Revenue - Hospitalist 1099', type:'Revenue'},
    {name:'Service Revenue - Nephrology',       type:'Revenue'},
    {name:'Service Revenue - Private Insurance',type:'Revenue'},
    {name:'Service Revenue - Management Fees',  type:'Revenue'},
    {name:'Rental Income',                      type:'Revenue'},
    {name:'Foreign Property Income',            type:'Revenue'},
    {name:'Other Income',                       type:'Revenue'},
    {name:'Auto & Vehicle',                     type:'Expense'},
    {name:'Bank & Financial Charges',           type:'Expense'},
    {name:'Board Meeting',                      type:'Expense'},
    {name:'Charitable Donations',               type:'Expense'},
    {name:'Contract Labor / 1099 Payments',     type:'Expense'},
    {name:'Dues & Subscriptions',               type:'Expense'},
    {name:'Health Insurance',                   type:'Expense'},
    {name:'HSA',                                type:'Expense'},
    {name:'Home Office',                        type:'Expense'},
    {name:'Hotel & Lodging',                    type:'Expense'},
    {name:'Insurance - Malpractice',            type:'Expense'},
    {name:'Insurance - Other',                  type:'Expense'},
    {name:'Internet',                           type:'Expense'},
    {name:'Legal & Professional',               type:'Expense'},
    {name:'Licenses & Permits',                 type:'Expense'},
    {name:'Meals',                              type:'Expense'},
    {name:'Medical Equipment',                  type:'Expense'},
    {name:'Office Equipment',                   type:'Expense'},
    {name:'Office Expense',                     type:'Expense'},
    {name:'Payroll Tax',                        type:'Expense'},
    {name:'Payroll Processing',                 type:'Expense'},
    {name:'Rent',                               type:'Expense'},
    {name:'Repairs & Maintenance',              type:'Expense'},
    {name:'Retirement - 401(k)',                type:'Expense'},
    {name:'Retirement - SEP IRA',               type:'Expense'},
    {name:'Software & Electronics',             type:'Expense'},
    {name:'Telephone',                          type:'Expense'},
    {name:'Travel',                             type:'Expense'},
    {name:'Utilities',                          type:'Expense'},
    {name:'Wages (W-2)',                        type:'Expense'},
    {name:'Misc. Expense',                      type:'Expense'},
    {name:'Owner Draw',                         type:'Owner/Transfer'},
    {name:'Capital Contribution',               type:'Owner/Transfer'},
    {name:'Intercompany Transfer',              type:'Owner/Transfer'},
    {name:'1031 Exchange Proceeds',             type:'Owner/Transfer'}
  ],
  data: {
    practice: {
      income: [
        {id:uid(), date:'2025-01-15', desc:'Sample hospitalist revenue', category:'Service Revenue - Hospitalist 1099', amount:12000, notes:'DEMO'},
        {id:uid(), date:'2025-02-15', desc:'Sample specialty revenue',   category:'Service Revenue - Nephrology',      amount:8500,  notes:'DEMO'},
        {id:uid(), date:'2025-03-15', desc:'Sample insurance payment',   category:'Service Revenue - Private Insurance',amount:1500, notes:'DEMO'}
      ],
      expenses: [
        {id:uid(), date:'2025-01-20', desc:'Sample auto expense',     category:'Auto & Vehicle',       amount:450,  notes:'DEMO'},
        {id:uid(), date:'2025-01-20', desc:'Sample 401(k)',           category:'Retirement - 401(k)',  amount:1000, notes:'DEMO'},
        {id:uid(), date:'2025-01-20', desc:'Sample payroll',          category:'Wages (W-2)',          amount:5000, notes:'DEMO'},
        {id:uid(), date:'2025-01-20', desc:'Sample health insurance', category:'Health Insurance',     amount:800,  notes:'DEMO'},
        {id:uid(), date:'2025-01-20', desc:'Sample office supplies',  category:'Office Expense',       amount:250,  notes:'DEMO'},
        {id:uid(), date:'2025-01-20', desc:'Sample meals',            category:'Meals',                amount:120,  notes:'50% deductible — DEMO'},
        {id:uid(), date:'2025-01-20', desc:'Sample management fee',   category:'Contract Labor / 1099 Payments', amount:2000, notes:'Intercompany — DEMO'}
      ]
    },
    mgmt: {
      income: [
        {id:uid(), date:'2025-01-20', desc:'Sample management fees', category:'Service Revenue - Management Fees', amount:2000, notes:'DEMO'}
      ],
      expenses: [
        {id:uid(), date:'2025-01-25', desc:'Sample contractor A', category:'Contract Labor / 1099 Payments', amount:600, notes:'DEMO'},
        {id:uid(), date:'2025-01-25', desc:'Sample contractor B', category:'Contract Labor / 1099 Payments', amount:500, notes:'DEMO'}
      ]
    },
    holdco: {
      income: [
        {id:uid(), date:'2025-01-01', desc:'Sample other income', category:'Other Income', amount:100, notes:'DEMO'}
      ],
      expenses: [
        {id:uid(), date:'2025-01-10', desc:'Sample filing fee', category:'Dues & Subscriptions', amount:50, notes:'DEMO'},
        {id:uid(), date:'2025-01-10', desc:'Sample legal fee',  category:'Legal & Professional', amount:150, notes:'DEMO'}
      ]
    },
    rental: {
      income: [
        {id:uid(), date:'2025-01-01', desc:'Sample rental — Property A', category:'Rental Income', amount:2400, notes:'DEMO'},
        {id:uid(), date:'2025-01-01', desc:'Sample rental — Property B', category:'Rental Income', amount:1800, notes:'DEMO'}
      ],
      expenses: [
        {id:uid(), date:'2025-01-05', desc:'Sample property management', category:'Legal & Professional',  amount:300, notes:'DEMO'},
        {id:uid(), date:'2025-01-05', desc:'Sample repairs',             category:'Repairs & Maintenance', amount:450, notes:'DEMO'},
        {id:uid(), date:'2025-01-05', desc:'Sample utilities',           category:'Utilities',             amount:120, notes:'DEMO'},
        {id:uid(), date:'2025-01-05', desc:'Sample property tax',        category:'Licenses & Permits',    amount:500, notes:'DEMO'}
      ]
    }
  },
  personal: {
    income: [
      {id:uid(), date:'2025-01-01', desc:'Sample W-2 wages', category:'Other Income', amount:1000, notes:'DEMO'}
    ],
    itemized: [
      {id:uid(), item:'Property Tax',     person:'', amount:2000, notes:'DEMO'},
      {id:uid(), item:'Charity',          person:'', amount:500,  notes:'DEMO'},
      {id:uid(), item:'SALT',             person:'', amount:0,    notes:''},
      {id:uid(), item:'Solar',            person:'', amount:0,    notes:''},
      {id:uid(), item:'AGI',              person:'', amount:0,    notes:''},
      {id:uid(), item:'Foreign Property', person:'', amount:0,    notes:''}
    ],
    roth: [
      {id:uid(), account:'Roth IRA conversion', person:'Owner',  amount:0, notes:''},
      {id:uid(), account:'Roth IRA conversion', person:'Spouse', amount:0, notes:''},
      {id:uid(), account:'Brokerage — Sample',  person:'',       amount:0, notes:''}
    ],
    taxesPakistan: [
      {id:uid(), date:'2025-01-01', amountPKR:0, rate:0, amountUSD:0, notes:'DEMO — enter your own figures'}
    ]
  },
  foreign: {
    properties: [
      {id:uid(), date:'2020-01-01', property:'Sample Plot A', type:'Residential', address:'Sample Address', buyingPrice:0, otherExpenses:0, total:0, kind:''},
      {id:uid(), date:'',           property:'Sample Construction', type:'Grey Structure', address:'', buyingPrice:0, otherExpenses:0, total:0, kind:''}
    ],
    improvements: [
      {id:uid(), item:'Sample improvement A', amountPKR:0, amountUSD:0},
      {id:uid(), item:'Sample improvement B', amountPKR:0, amountUSD:0}
    ],
    rental: {
      income: [
        {id:uid(), date:'2025-01-01', desc:'Sample foreign rental', amountPKR:0, amountUSD:0}
      ],
      expenses: [
        {id:uid(), date:'2025-01-01', desc:'Sample management fees', amountPKR:0, amountUSD:0},
        {id:uid(), date:'2025-01-01', desc:'Sample maintenance',     amountPKR:0, amountUSD:0}
      ]
    }
  },
  assets: [
    {id:uid(), name:'Sample rental property', entity:'rental', acquired:'2020-01-01', cost:0, improvements:0, method:'MACRS 27.5-yr SL', life:27.5, depThisYear:0, accumDep:0, saleDate:'', salePrice:0, sellingCosts:0, notes:'DEMO'},
    {id:uid(), name:'Sample vehicle',         entity:'rental', acquired:'',           cost:0, improvements:0, method:'Bonus', life:5, depThisYear:0, accumDep:0, saleDate:'', salePrice:0, sellingCosts:0, notes:'DEMO'}
  ],
  mileage: [
    {id:uid(), date:'2025-03-14', vehicle:'Sample Vehicle', purpose:'Client visit', start:10000, end:10040, business:'Y'}
  ],
  retirement: [
    {id:uid(), plan:'Solo 401(k) — employee deferral',   owner:'Owner',          contributed:0, limit:0, notes:'DEMO — enter limits'},
    {id:uid(), plan:'Solo 401(k) — employer',            owner:'Owner',          contributed:0, limit:0, notes:'DEMO'},
    {id:uid(), plan:'SEP IRA — employer',                owner:'Owner',          contributed:0, limit:0, notes:'DEMO'},
    {id:uid(), plan:'Health Savings Account',            owner:'Owner / Spouse', contributed:0, limit:0, notes:'DEMO'}
  ],
  issues: [
    {id:uid(), item:'Confirm W-2 reporting with CPA (sample checklist item).', entity:'practice', priority:'High', status:'Open', owner:'', resolution:''},
    {id:uid(), item:'Verify retirement contribution limits for the tax year.', entity:'practice', priority:'Medium', status:'Open', owner:'', resolution:''},
    {id:uid(), item:'Collect mileage logs before filing.', entity:'rental', priority:'Medium', status:'Open', owner:'', resolution:''},
    {id:uid(), item:'Reconcile intercompany management fees.', entity:'practice', priority:'High', status:'Open', owner:'', resolution:''}
  ]
};

/* ---------- LOAD / SAVE ---------- */
var state;
function loadState(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
      // migrate from v6 if present
      var old = null /* no migrate real data */;
      if(old){
        var mig = JSON.parse(old);
        if(mig.entities && mig.data){
          if(!mig.balance) mig.balance = {};
          if(!mig.settings) mig.settings = { theme:'light', filingStatus:'mfj', seTaxRate:0.153, estimatedBracket:0.24 };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mig));
          return mig;
        }
      }
      return clone(DEFAULT);
    }
    var parsed = JSON.parse(raw);
    if(!parsed.entities || !parsed.data) return clone(DEFAULT);
    parsed.entities.forEach(function(e){
      if(!parsed.data[e.id]) parsed.data[e.id] = {income:[], expenses:[]};
    });
    if(!parsed.personal) parsed.personal = clone(DEFAULT.personal);
    if(!parsed.foreign)  parsed.foreign  = clone(DEFAULT.foreign);
    if(!parsed.assets)   parsed.assets   = [];
    if(!parsed.mileage)  parsed.mileage  = [];
    if(!parsed.retirement) parsed.retirement = [];
    if(!parsed.issues)   parsed.issues   = [];
    if(!parsed.balance)  parsed.balance  = {};
    if(!parsed.settings) parsed.settings = { theme:'light', filingStatus:'mfj', seTaxRate:0.153, estimatedBracket:0.24 };
    return parsed;
  } catch(err){ return clone(DEFAULT); }
}
function save(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    var dot = document.getElementById('saveDot');
    if(dot){
      dot.innerHTML = '<i></i> Saving…';
      clearTimeout(save._t);
      save._t = setTimeout(function(){ dot.innerHTML = '<i></i> Saved'; }, 400);
    }
  }catch(err){}
}

/* ---------- COMPUTE ---------- */
function catType(name){
  for(var i=0; i<state.categories.length; i++){
    if(state.categories[i].name === name) return state.categories[i].type;
  }
  return 'Expense';
}
function entityTotals(id){
  var d = state.data[id] || {income:[], expenses:[]};
  var inc = 0, exp = 0;
  d.income.forEach(function(r){ if(catType(r.category) === 'Revenue') inc += num(r.amount); });
  d.expenses.forEach(function(r){ if(catType(r.category) === 'Expense') exp += num(r.amount); });
  return { income: inc, expenses: exp, net: inc - exp };
}
function categoryRows(id){
  var d = state.data[id] || {income:[], expenses:[]};
  var map = {};
  d.income.concat(d.expenses).forEach(function(r){
    var t = catType(r.category);
    if(t !== 'Revenue' && t !== 'Expense') return;
    var k = r.category || '(uncategorized)';
    if(!map[k]) map[k] = { category:k, type:t, amount:0 };
    map[k].amount += num(r.amount);
  });
  var arr = [];
  for(var k in map) arr.push(map[k]);
  arr.sort(function(a,b){
    if(a.type !== b.type) return a.type === 'Revenue' ? -1 : 1;
    return b.amount - a.amount;
  });
  return arr;
}
function personalTotals(){
  var inc = state.personal.income.reduce(function(s,r){ return s + num(r.amount); }, 0);
  var item = state.personal.itemized.reduce(function(s,r){ return s + num(r.amount); }, 0);
  var roth = state.personal.roth.reduce(function(s,r){ return s + num(r.amount); }, 0);
  var taxesPKR = state.personal.taxesPakistan.reduce(function(s,r){ return s + num(r.amountPKR); }, 0);
  return { inc: inc, item: item, roth: roth, taxesPKR: taxesPKR };
}
function foreignTotals(){
  var impPKR = 0, impUSD = 0;
  state.foreign.improvements.forEach(function(r){ impPKR += num(r.amountPKR); impUSD += num(r.amountUSD); });
  var rentIncPKR = 0, rentIncUSD = 0;
  state.foreign.rental.income.forEach(function(r){ rentIncPKR += num(r.amountPKR); rentIncUSD += num(r.amountUSD); });
  var rentExpPKR = 0, rentExpUSD = 0;
  state.foreign.rental.expenses.forEach(function(r){ rentExpPKR += num(r.amountPKR); rentExpUSD += num(r.amountUSD); });
  var propPKR = 0;
  state.foreign.properties.forEach(function(p){ propPKR += num(p.buyingPrice); });
  return {
    impPKR:impPKR, impUSD:impUSD,
    rentIncPKR:rentIncPKR, rentIncUSD:rentIncUSD,
    rentExpPKR:rentExpPKR, rentExpUSD:rentExpUSD,
    rentNetPKR:rentIncPKR - rentExpPKR,
    rentNetUSD:rentIncUSD - rentExpUSD,
    propPKR:propPKR
  };
}
function grandTotals(){
  var ti=0, te=0;
  state.entities.forEach(function(e){ var t=entityTotals(e.id); ti+=t.income; te+=t.expenses; });
  return { income:ti, expenses:te, net:ti-te };
}
function mileageTotals(){
  var total=0, biz=0;
  state.mileage.forEach(function(m){
    var miles=(m.start!==''&&m.end!=='')?num(m.end)-num(m.start):0;
    total+=miles; if(m.business==='Y') biz+=miles;
  });
  return { total:total, biz:biz, deduction: biz * MILEAGE_RATE_2025 };
}
function mealsDeductible(){
  var total=0;
  state.entities.forEach(function(e){
    (state.data[e.id].expenses||[]).forEach(function(r){
      if((r.category||'').toLowerCase().indexOf('meal')>=0) total+=num(r.amount);
    });
  });
  return { total:total, deductible: total*0.5 };
}
function openIssuesCount(){
  return state.issues.filter(function(i){ return i.status !== 'Closed'; }).length;
}

function exportExcel(){
  if(typeof XLSX === 'undefined'){
    alert('Excel library not loaded. Check your internet connection and refresh the page.');
    return;
  }
  toast('Building Excel file…');

  var wb = XLSX.utils.book_new();

  /* 1. Dashboard */
  var dash = [
    ['TAX YEAR 2025 — MASTER SUMMARY'],
    [],
    ['Entity', 'Type', 'Total Income', 'Total Expenses', 'Net Income', 'Margin %']
  ];
  var totalInc = 0, totalExp = 0;
  state.entities.forEach(function(e){
    var t = entityTotals(e.id);
    totalInc += t.income; totalExp += t.expenses;
    var margin = t.income > 0 ? (t.net / t.income * 100) : 0;
    dash.push([e.name, e.type, t.income, t.expenses, t.net, margin]);
  });
  dash.push([]);
  dash.push(['TOTAL', '', totalInc, totalExp, totalInc - totalExp, totalInc > 0 ? ((totalInc-totalExp)/totalInc*100) : 0]);
  dash.push([]);
  var p = personalTotals();
  dash.push(['Personal Income', '', p.inc]);
  dash.push(['Personal Itemized Deductions', '', p.item]);
  dash.push(['Roth / Investments', '', p.roth]);
  var ws = XLSX.utils.aoa_to_sheet(dash);
  ws['!cols'] = [{wch:40},{wch:18},{wch:16},{wch:16},{wch:16},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');

  /* 2. Personal 1040 */
  var pers = [['PERSONAL 1040 — TAX YEAR 2025'], []];
  pers.push(['INCOME']);
  pers.push(['Date', 'Description', 'Category', 'Amount ($)', 'Notes']);
  state.personal.income.forEach(function(r){ pers.push([r.date, r.desc, r.category, num(r.amount), r.notes]); });
  pers.push([]);
  pers.push(['ITEMIZED DEDUCTIONS']);
  pers.push(['Item', 'Person', 'Amount ($)', 'Notes']);
  state.personal.itemized.forEach(function(r){ pers.push([r.item, r.person, num(r.amount), r.notes]); });
  pers.push([]);
  pers.push(['ROTH IRA CONVERSIONS & INVESTMENTS']);
  pers.push(['Account', 'Person', 'Amount ($)', 'Notes']);
  state.personal.roth.forEach(function(r){ pers.push([r.account, r.person, num(r.amount), r.notes]); });
  pers.push([]);
  pers.push(['TAXES PAID IN PAKISTAN']);
  pers.push(['Date', 'Amount (PKR)', 'Rate', 'Amount (USD)', 'Notes']);
  state.personal.taxesPakistan.forEach(function(r){ pers.push([r.date, num(r.amountPKR), num(r.rate), num(r.amountUSD), r.notes]); });
  var wsP = XLSX.utils.aoa_to_sheet(pers);
  wsP['!cols'] = [{wch:14},{wch:40},{wch:28},{wch:16},{wch:30}];
  XLSX.utils.book_append_sheet(wb, wsP, 'Personal_1040');

  /* 3. Foreign Property */
  var fgn = [['FOREIGN PROPERTY — PAKISTAN'], []];
  fgn.push(['PROPERTY REGISTER']);
  fgn.push(['Date','Property','Type','Address','Buying Price (PKR)','Other Expenses (PKR)','Total (PKR)','Kind']);
  state.foreign.properties.forEach(function(r){
    fgn.push([r.date, r.property, r.type, r.address, num(r.buyingPrice), num(r.otherExpenses), num(r.total), r.kind]);
  });
  fgn.push([]);
  fgn.push(['RENTAL IMPROVEMENTS — 43 D DHA RAHBAR']);
  fgn.push(['Item', 'Amount (PKR)', 'Amount (USD)']);
  state.foreign.improvements.forEach(function(r){ fgn.push([r.item, num(r.amountPKR), num(r.amountUSD)]); });
  var f = foreignTotals();
  fgn.push(['TOTAL', f.impPKR, f.impUSD]);
  fgn.push([]);
  fgn.push(['RENTAL — DHA 22C RAHBAR']);
  fgn.push(['Date', 'Description', 'Amount (PKR)', 'Amount (USD)']);
  fgn.push(['RENTAL INCOME']);
  state.foreign.rental.income.forEach(function(r){ fgn.push([r.date, r.desc, num(r.amountPKR), num(r.amountUSD)]); });
  fgn.push(['RENTAL EXPENSES']);
  state.foreign.rental.expenses.forEach(function(r){ fgn.push([r.date, r.desc, num(r.amountPKR), num(r.amountUSD)]); });
  fgn.push(['Total Income', '', f.rentIncPKR, f.rentIncUSD]);
  fgn.push(['Total Expenses', '', f.rentExpPKR, f.rentExpUSD]);
  fgn.push(['Net Rental', '', f.rentNetPKR, f.rentNetUSD]);
  var wsF = XLSX.utils.aoa_to_sheet(fgn);
  wsF['!cols'] = [{wch:14},{wch:40},{wch:22},{wch:16},{wch:18},{wch:18},{wch:18},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsF, 'Foreign_Property');

  /* 4-7. Each Entity */
  state.entities.forEach(function(e){
    var d = state.data[e.id];
    var rows = [[e.name.toUpperCase() + ' — 2025'], []];
    rows.push(['INCOME']);
    rows.push(['Date', 'Description', 'Category', 'Amount ($)', 'Notes']);
    d.income.forEach(function(r){ rows.push([r.date, r.desc, r.category, num(r.amount), r.notes]); });
    var tInc = d.income.reduce(function(s,r){ return s + num(r.amount); }, 0);
    rows.push(['', 'Total Income', '', tInc, '']);
    rows.push([]);
    rows.push(['EXPENSES']);
    rows.push(['Date', 'Description', 'Category', 'Amount ($)', 'Notes']);
    d.expenses.forEach(function(r){ rows.push([r.date, r.desc, r.category, num(r.amount), r.notes]); });
    var tExp = d.expenses.reduce(function(s,r){ return s + num(r.amount); }, 0);
    rows.push(['', 'Total Expenses', '', tExp, '']);
    rows.push([]);
    rows.push(['', 'NET INCOME', '', tInc - tExp, '']);
    rows.push([]);
    rows.push(['PROFIT & LOSS BY CATEGORY']);
    rows.push(['Category', 'Type', 'Amount']);
    var cats = categoryRows(e.id);
    cats.forEach(function(c){ rows.push([c.category, c.type, c.amount]); });
    var wsE = XLSX.utils.aoa_to_sheet(rows);
    wsE['!cols'] = [{wch:14},{wch:40},{wch:36},{wch:16},{wch:30}];
    var sheetName = e.name.replace(/[^A-Za-z0-9]/g, '_').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, wsE, sheetName);
  });

  /* 8. Rental */
  var ssre = state.data.rental;
  var rentRows = [['RENTAL SCHEDULE — SUNSTATE REAL ESTATE LLC'], []];
  rentRows.push(['RENTAL INCOME']);
  rentRows.push(['Date','Source','Category','Amount ($)','Notes']);
  ssre.income.filter(function(r){ return catType(r.category) === 'Revenue'; }).forEach(function(r){
    rentRows.push([r.date, r.desc, r.category, num(r.amount), r.notes]);
  });
  rentRows.push([]);
  rentRows.push(['RENTAL EXPENSES']);
  rentRows.push(['Date','Payee / Description','Category','Amount ($)','Notes']);
  ssre.expenses.forEach(function(r){ rentRows.push([r.date, r.desc, r.category, num(r.amount), r.notes]); });
  var t = entityTotals('rental');
  rentRows.push([]);
  rentRows.push(['', 'Total Rental Income', '', t.income, '']);
  rentRows.push(['', 'Total Rental Expenses', '', t.expenses, '']);
  rentRows.push(['', 'NET RENTAL INCOME', '', t.net, '']);
  var wsR = XLSX.utils.aoa_to_sheet(rentRows);
  wsR['!cols'] = [{wch:14},{wch:40},{wch:36},{wch:16},{wch:30}];
  XLSX.utils.book_append_sheet(wb, wsR, 'Rental');

  /* 9. Balance Sheet (blank input template) */
  var bsRows = [['BALANCE SHEET — YEAR-END 2025'], []];
  bsRows.push(['Line Item'].concat(state.entities.map(function(e){ return e.name; })));
  ['ASSETS','Cash & bank accounts','Accounts receivable','Equipment & furniture, at cost',
   'Less: accumulated depreciation (negative)','Real estate, at cost',
   'Less: accumulated depreciation (negative)','Total Assets','',
   'LIABILITIES','Accounts payable','Loans & notes payable','Credit cards','Total Liabilities','',
   'EQUITY','Owner capital contributed','Owner draws / distributions (negative)',
   'Retained earnings, prior years','Current-year net income (from P&L)','Total Equity','',
   'Total Liabilities & Equity'].forEach(function(line){
    var row = [line];
    state.entities.forEach(function(){ row.push(''); });
    if(line === 'Current-year net income (from P&L)'){
      row = [line];
      state.entities.forEach(function(e){ row.push(entityTotals(e.id).net); });
    }
    bsRows.push(row);
  });
  var wsB = XLSX.utils.aoa_to_sheet(bsRows);
  wsB['!cols'] = [{wch:44}].concat(state.entities.map(function(){ return {wch:22}; }));
  XLSX.utils.book_append_sheet(wb, wsB, 'Balance_Sheet');

  /* 10. Asset Register */
  var assetRows = [
    ['ASSET REGISTER — TAX YEAR 2025'],
    [],
    ['Asset','Entity','Date Acquired','Cost ($)','Improvements ($)','Adjusted Basis',
     'Method','Life (yrs)','Depr. This Year','Accum. Depr.','Net Book Value',
     'Sale Date','Sale Price','Selling Costs','Gain/(Loss)','Notes']
  ];
  state.assets.forEach(function(a){
    var basis = num(a.cost) + num(a.improvements);
    var nbv = basis - num(a.accumDep);
    var gain = (a.saleDate && num(a.salePrice) > 0) ? num(a.salePrice) - num(a.sellingCosts) - nbv : '';
    var entName = '';
    state.entities.forEach(function(e){ if(e.id === a.entity) entName = e.name; });
    assetRows.push([a.name, entName, a.acquired, num(a.cost), num(a.improvements), basis,
                    a.method, num(a.life), num(a.depThisYear), num(a.accumDep), nbv,
                    a.saleDate, num(a.salePrice), num(a.sellingCosts), gain, a.notes]);
  });
  var wsA = XLSX.utils.aoa_to_sheet(assetRows);
  wsA['!cols'] = [{wch:30},{wch:28},{wch:13},{wch:12},{wch:14},{wch:14},{wch:18},
                  {wch:9},{wch:14},{wch:14},{wch:14},{wch:12},{wch:12},{wch:12},{wch:14},{wch:30}];
  XLSX.utils.book_append_sheet(wb, wsA, 'Asset_Register');

  /* 11. Mileage */
  var mil = [['VEHICLE MILEAGE LOG — 2025'], [],
             ['Date','Vehicle','Purpose','Start Odometer','End Odometer','Miles','Business?','Business Miles']];
  var totalMiles = 0, bizMiles = 0;
  state.mileage.forEach(function(m){
    var miles = (m.start !== '' && m.end !== '') ? num(m.end) - num(m.start) : 0;
    totalMiles += miles;
    var biz = m.business === 'Y' ? miles : 0;
    bizMiles += biz;
    mil.push([m.date, m.vehicle, m.purpose, num(m.start), num(m.end), miles, m.business, biz]);
  });
  mil.push([]);
  mil.push(['','','','','','Total Miles', totalMiles]);
  mil.push(['','','','','','Business Miles', bizMiles]);
  mil.push(['','','','','','Business %', totalMiles ? (bizMiles / totalMiles) : 0]);
  var wsM = XLSX.utils.aoa_to_sheet(mil);
  wsM['!cols'] = [{wch:13},{wch:18},{wch:30},{wch:14},{wch:14},{wch:12},{wch:12},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsM, 'Mileage');

  /* 12. Retirement */
  var ret = [['RETIREMENT & HSA CONTRIBUTIONS — 2025'], [],
             ['Plan / Account','Owner','Contributed YTD ($)','Annual Limit ($)','Remaining Room ($)','Notes']];
  state.retirement.forEach(function(r){
    var room = num(r.limit) > 0 ? Math.max(0, num(r.limit) - num(r.contributed)) : '';
    ret.push([r.plan, r.owner, num(r.contributed), num(r.limit), room, r.notes]);
  });
  ret.push([]);
  ret.push(['Enter the IRS limit for the tax year. Limits are not pre-filled.']);
  ret.push(['Confirm all limits and eligibility rules with a CPA.']);
  var wsR2 = XLSX.utils.aoa_to_sheet(ret);
  wsR2['!cols'] = [{wch:44},{wch:18},{wch:20},{wch:18},{wch:20},{wch:40}];
  XLSX.utils.book_append_sheet(wb, wsR2, 'Retirement');

  /* 13. Open Issues */
  var iss = [['OPEN ISSUES TRACKER — TAX YEAR 2025'], [],
             ['#','Item','Entity','Priority','Status','Owner','Resolution']];
  state.issues.forEach(function(it, i){
    var entName = '';
    state.entities.forEach(function(e){ if(e.id === it.entity) entName = e.name; });
    iss.push([i+1, it.item, entName, it.priority, it.status, it.owner, it.resolution]);
  });
  var wsI = XLSX.utils.aoa_to_sheet(iss);
  wsI['!cols'] = [{wch:4},{wch:60},{wch:32},{wch:10},{wch:12},{wch:14},{wch:34}];
  XLSX.utils.book_append_sheet(wb, wsI, 'Open_Issues');

  /* 14. Categories reference */
  var catRows = [['CATEGORIES (reference)'], [], ['Category', 'Type']];
  state.categories.forEach(function(c){ catRows.push([c.name, c.type]); });
  var wsC = XLSX.utils.aoa_to_sheet(catRows);
  wsC['!cols'] = [{wch:44},{wch:18}];
  XLSX.utils.book_append_sheet(wb, wsC, 'Categories');

  /* Write file */
  var fname = 'Tax_Year_2025_Master_' + new Date().toISOString().slice(0,10) + '.xlsx';
  XLSX.writeFile(wb, fname);
  toast('✓ Downloaded: ' + fname);
}

/* ---------- VIEW STATE ---------- */
var currentView = (function(){
  var page = (document.body && document.body.getAttribute('data-page')) || 'dashboard';
  if(page === 'entity'){
    var id = new URLSearchParams(location.search).get('id');
    return id || 'practice';
  }
  return page;
})();
var txFilter = { q:'', type:'all' };
var VIEWS = {
  dashboard:  { title:'Dashboard',        sub:'Roll-up of all entities · quick overview' },
  personal:   { title:'Personal 1040',    sub:'Tax Year 2025 — individual return' },
  foreign:    { title:'Foreign Property', sub:'Pakistan — DHA properties' },
  rental:     { title:'Rental Schedule',  sub:'Rental income & expenses' },
  balance:    { title:'Balance Sheet',    sub:'Year-end balances by entity' },
  assets:     { title:'Asset Register',   sub:'Property, equipment & vehicles' },
  mileage:    { title:'Mileage Log',      sub:'Odometer readings & business use %' },
  retirement: { title:'Retirement & HSA', sub:'Contributions vs. annual limits' },
  taxtools:   { title:'Tax Tools',        sub:'Estimators, deductions & planning helpers' },
  issues:     { title:'Open Issues',      sub:'Items to resolve before filing' },
  setup:      { title:'Setup',            sub:'Rename entities, add entities, categories & backups' }
};

var STATIC_ENTITY_HREF = {
  practice:'practice.html', mgmt:'management.html',
  rental:'real-estate.html', holdco:'holdings.html'
};
var PAGE_HREF = {
  dashboard:'index.html', personal:'personal.html',
  practice:'practice.html', mgmt:'management.html',
  rental:'real-estate.html', holdco:'holdings.html',
  foreign:'foreign.html', taxtools:'tax-tools.html', setup:'setup.html',
  balance:'tax-tools.html#balance', assets:'tax-tools.html#assets',
  mileage:'tax-tools.html#mileage', retirement:'tax-tools.html#retirement',
  issues:'tax-tools.html#issues'
};
function entityHref(id){
  return STATIC_ENTITY_HREF[id] || ('entity.html?id=' + encodeURIComponent(id));
}
function pageHref(id){
  if(PAGE_HREF[id]) return PAGE_HREF[id];
  if(state && state.data && state.data[id]) return entityHref(id);
  return 'index.html';
}
function navItem(id, icon, label, badge){
  var cls = 'nav-item' + (currentView === id ? ' active' : '');
  var b = badge ? '<span class="nav-badge">' + badge + '</span>' : '<span class="dot"></span>';
  var href = pageHref(id);
  return '<a class="' + cls + '" href="' + href + '">' +
    '<span style="font-size:13px">' + icon + '</span>' +
    '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(label) + '</span>' +
    b + '</a>';
}

function renderNav(){
  var h = '';
  var n = 1;
  h += '<div class="nav-group"><div class="nav-label">Tabs</div>';
  h += navItem('dashboard', '◈', (n++) + ' · Dashboard');
  h += navItem('personal',  '○', (n++) + ' · Personal');
  state.entities.forEach(function(e){
    h += navItem(e.id, '▢', (n++) + ' · ' + e.name);
  });
  h += navItem('foreign',  '◎', (n++) + ' · Foreign Property');
  h += navItem('taxtools', '▣', (n++) + ' · Tax Tools', openIssuesCount() || null);
  h += navItem('setup',    '⚙', (n++) + ' · Setup');
  h += '</div>';
  document.getElementById('nav').innerHTML = h;

  // Mobile tab bar — rebuild from live entity names
  var bar = document.querySelector('.tab-bar');
  if(bar){
    var items = [
      ['dashboard','Dashboard'],
      ['personal','Personal']
    ];
    state.entities.forEach(function(e){ items.push([e.id, e.name.split(' ')[0] || e.name]); });
    items.push(['foreign','Foreign'], ['taxtools','Tax Tools'], ['setup','Setup']);
    bar.innerHTML = items.map(function(it){
      var active = currentView === it[0] ? ' active' : '';
      return '<a href="' + pageHref(it[0]) + '" class="' + active.trim() + '">' + esc(it[1]) + '</a>';
    }).join('');
  }
}

/* ---------- QUICK ENTRY MODAL ---------- */
var entryType = 'expense';
function fillEntitySelect(){
  var sel = document.getElementById('eEntity');
  var cur = sel.value;
  sel.innerHTML = state.entities.map(function(e){
    return '<option value="' + e.id + '">' + esc(e.name) + '</option>';
  }).join('');
  if(cur && state.data[cur]) sel.value = cur;
  else if(state.entities[0]) sel.value = state.entities[0].id;
}
function fillCategorySelect(){
  var want = entryType === 'income' ? 'Revenue' : null;
  var opts = state.categories.filter(function(c){
    if(entryType === 'income') return c.type === 'Revenue';
    return c.type !== 'Revenue';
  });
  document.getElementById('eCategory').innerHTML = '<option value="">— select —</option>' +
    opts.map(function(c){ return '<option value="' + esc(c.name) + '">' + esc(c.name) + '</option>'; }).join('');
}
function setEntryType(t){
  entryType = t;
  document.getElementById('etypeInc').className = t==='income' ? 'on inc' : '';
  document.getElementById('etypeExp').className = t==='expense' ? 'on exp' : '';
  document.getElementById('entryTitle').textContent = t==='income' ? 'Add Income' : 'Add Expense';
  document.getElementById('entrySave').className = 'btn ' + (t==='income'?'inc':'exp');
  fillCategorySelect();
}
function openEntry(type, entityId){
  setEntryType(type || 'expense');
  fillEntitySelect();
  if(entityId && state.data[entityId]) document.getElementById('eEntity').value = entityId;
  else if(currentView && state.data[currentView]) document.getElementById('eEntity').value = currentView;
  document.getElementById('eDate').value = today();
  document.getElementById('eAmount').value = '';
  document.getElementById('eDesc').value = '';
  document.getElementById('eNotes').value = '';
  document.getElementById('entryModal').classList.add('show');
  setTimeout(function(){ document.getElementById('eAmount').focus(); }, 50);
  document.getElementById('fab').classList.remove('open');
}
function closeEntry(){ document.getElementById('entryModal').classList.remove('show'); }
function saveEntry(keepOpen){
  var amount = num(document.getElementById('eAmount').value);
  var entityId = document.getElementById('eEntity').value;
  var cat = document.getElementById('eCategory').value;
  var desc = document.getElementById('eDesc').value.trim();
  if(!entityId || !state.data[entityId]){ alert('Select an entity'); return; }
  if(!amount){ alert('Enter an amount'); document.getElementById('eAmount').focus(); return; }
  if(!cat){ alert('Select a category'); return; }
  var row = {
    id: uid(),
    date: document.getElementById('eDate').value || today(),
    desc: desc || cat,
    category: cat,
    amount: amount,
    notes: document.getElementById('eNotes').value.trim()
  };
  var kind = entryType === 'income' ? 'income' : 'expenses';
  state.data[entityId][kind].push(row);
  save();
  toast((entryType==='income'?'Income':'Expense') + ' saved · ' + fmt(amount));
  if(keepOpen){
    document.getElementById('eAmount').value = '';
    document.getElementById('eDesc').value = '';
    document.getElementById('eNotes').value = '';
    document.getElementById('eAmount').focus();
  } else {
    closeEntry();
    var dest = pageHref(entityId);
    var here = location.pathname.split('/').pop() + location.search;
    if(dest && here.indexOf(dest) !== 0 && location.href.indexOf(dest) < 0){
      location.href = dest;
      return;
    }
    render();
  }
}

/* ---------- VIEWS ---------- */
function viewDashboard(){
  var rows = state.entities.map(function(e){
    var t = entityTotals(e.id);
    return { id:e.id, name:e.name, type:e.type, income:t.income, expenses:t.expenses, net:t.net };
  });
  var g = grandTotals();
  var p = personalTotals();
  var mil = mileageTotals();
  var meals = mealsDeductible();
  var maxAbs = 1;
  rows.forEach(function(r){ if(Math.abs(r.net) > maxAbs) maxAbs = Math.abs(r.net); });

  var h = '';
  h += '<div class="excel-banner">' +
       '<div class="icon">⬇</div>' +
       '<div class="txt">' +
         '<h3>Download Complete Excel Workbook</h3>' +
         '<p>14 sheets ready for your CPA — Dashboard, 1040, Foreign Property, entities, Rental, Balance Sheet, Assets, Mileage, Retirement, Issues</p>' +
       '</div>' +
       '<button data-act="excel">Download .xlsx</button>' +
       '</div>';

  h += '<div class="toolbar" style="margin-bottom:16px">';
  h += '<button class="btn inc" data-quick="income">＋ Income</button>';
  h += '<button class="btn exp" data-quick="expense">＋ Expense</button>';
  h += '<a class="btn primary" href="setup.html">＋ Add / Rename Entities</a>';
  h += '<a class="btn" href="tax-tools.html">Tax Tools</a>';
  h += '<span style="margin-left:auto;font-size:11px;color:var(--muted)">Tip: press <span class="shortcut">N</span> income · <span class="shortcut">E</span> expense</span>';
  h += '</div>';

  h += '<div class="kpi-row">';
  h += '<div class="kpi green"><div class="lbl">Entity Income</div><div class="val">' + fmt(g.income) + '</div><div class="meta">' + rows.length + ' entities</div></div>';
  h += '<div class="kpi red"><div class="lbl">Entity Expenses</div><div class="val">' + fmt(g.expenses) + '</div></div>';
  h += '<div class="kpi ' + (g.net >= 0 ? 'accent' : 'red') + '"><div class="lbl">Net Income</div><div class="val">' + fmt(g.net) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Mileage Deduction</div><div class="val" style="font-size:18px">' + fmt0(mil.deduction) + '</div><div class="meta">' + mil.biz.toLocaleString() + ' biz mi × $' + MILEAGE_RATE_2025.toFixed(2) + '</div></div>';
  h += '</div>';

  h += '<div class="grid-3" style="margin-bottom:16px">';
  h += '<div class="tool-card"><h3>Personal snapshot</h3><p>1040 income & itemized</p>';
  h += '<div class="tool-result"><div class="lbl">Personal income</div><div class="big">' + fmt(p.inc) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Itemized deductions</div><div class="big" style="font-size:18px">' + fmt(p.item) + '</div></div></div>';
  h += '<div class="tool-card"><h3>Meals (50% rule)</h3><p>Auto-summed from Meals category</p>';
  h += '<div class="tool-result"><div class="lbl">Booked</div><div class="big" style="font-size:18px">' + fmt(meals.total) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Likely deductible</div><div class="big" style="font-size:18px;color:var(--green)">' + fmt(meals.deductible) + '</div></div></div>';
  h += '<div class="tool-card"><h3>Filing checklist</h3><p>Open items before you file</p>';
  h += '<div class="tool-result"><div class="lbl">Open issues</div><div class="big" style="color:var(--red)">' + openIssuesCount() + '</div></div>';
  h += '<button class="btn sm primary" style="margin-top:10px" data-nav="issues">Review issues →</button></div>';
  h += '</div>';

  h += '<div class="card"><div class="card-head"><h2>Entity Performance</h2><span class="sub">Net income comparison</span></div><div class="card-body"><div class="bars">';
  rows.forEach(function(r){
    var pct = Math.abs(r.net) / maxAbs * 100;
    var color = r.net >= 0 ? 'var(--green)' : 'var(--red)';
    h += '<div class="bar-row">';
    h += '<div class="bar-name">' + esc(r.name) + '</div>';
    h += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
    h += '<div class="bar-val" style="color:' + color + '">' + fmt(r.net) + '</div>';
    h += '</div>';
  });
  h += '</div></div></div>';

  h += '<div class="card"><div class="card-head"><h2>Master Summary (P&L)</h2><span class="sub">Click a row to open</span></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid"><thead><tr><th>Entity</th><th>Type</th><th style="text-align:right">Income</th><th style="text-align:right">Expenses</th><th style="text-align:right">Net</th><th style="text-align:right">Margin</th></tr></thead><tbody>';
  rows.forEach(function(r){
    var m = r.income > 0 ? (r.net / r.income * 100) : 0;
    var color = r.net >= 0 ? 'var(--green)' : 'var(--red)';
    h += '<tr style="cursor:pointer" data-nav="' + r.id + '">';
    h += '<td style="padding:10px 12px;font-weight:600">' + esc(r.name) + '</td>';
    h += '<td style="padding:10px 12px;color:var(--muted);font-size:11px">' + esc(r.type) + '</td>';
    h += '<td class="num">' + fmt(r.income) + '</td>';
    h += '<td class="num">' + fmt(r.expenses) + '</td>';
    h += '<td class="num" style="font-weight:700;color:' + color + '">' + fmt(r.net) + '</td>';
    h += '<td class="num" style="color:var(--muted)">' + (r.income > 0 ? m.toFixed(1) + '%' : '—') + '</td>';
    h += '</tr>';
  });
  h += '</tbody><tfoot><tr><td colspan="2">TOTAL</td><td class="num">' + fmt(g.income) + '</td><td class="num">' + fmt(g.expenses) + '</td><td class="num">' + fmt(g.net) + '</td><td></td></tr></tfoot></table>';
  h += '</div></div></div>';

  var f = foreignTotals();
  h += '<div class="card"><div class="card-head"><h2>Foreign Property Snapshot</h2><span class="sub">Pakistan</span></div><div class="card-body"><div class="grid-2">';
  h += '<div><div style="font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase">Rental Income</div><div style="font-size:20px;font-weight:700;margin-top:5px;font-family:var(--mono)">' + pkrFmt(f.rentIncPKR) + '</div><div style="font-size:12px;color:var(--muted)">' + fmt(f.rentIncUSD) + '</div></div>';
  h += '<div><div style="font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase">Rental Expenses</div><div style="font-size:20px;font-weight:700;margin-top:5px;font-family:var(--mono)">' + pkrFmt(f.rentExpPKR) + '</div><div style="font-size:12px;color:var(--muted)">' + fmt(f.rentExpUSD) + '</div></div>';
  h += '<div><div style="font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase">Net Rental</div><div style="font-size:20px;font-weight:700;margin-top:5px;font-family:var(--mono);color:' + (f.rentNetPKR >= 0 ? 'var(--green)' : 'var(--red)') + '">' + pkrFmt(f.rentNetPKR) + '</div><div style="font-size:12px;color:var(--muted)">' + fmt(f.rentNetUSD) + '</div></div>';
  h += '<div><div style="font-size:11px;font-weight:700;color:var(--faint);text-transform:uppercase">Improvements</div><div style="font-size:20px;font-weight:700;margin-top:5px;font-family:var(--mono)">' + pkrFmt(f.impPKR) + '</div><div style="font-size:12px;color:var(--muted)">' + fmt(f.impUSD) + '</div></div>';
  h += '</div></div></div>';
  return h;
}

function filterRows(rows){
  var q = (txFilter.q || '').toLowerCase().trim();
  if(!q) return rows;
  return rows.filter(function(r){
    return (r.desc||'').toLowerCase().indexOf(q)>=0 ||
           (r.category||'').toLowerCase().indexOf(q)>=0 ||
           (r.notes||'').toLowerCase().indexOf(q)>=0 ||
           String(r.amount).indexOf(q)>=0;
  });
}

function sectionTable(label, kind, entityId, rows, cats, descLabel){
  var isIncome = kind === 'income';
  var filtered = filterRows(rows).slice().sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
  var total = rows.reduce(function(s,r){ return s + num(r.amount); }, 0);
  var h = '';
  h += '<div class="card"><div class="card-head">';
  h += '<h2>' + (isIncome ? '↑' : '↓') + ' ' + label + ' <span class="sub">' + rows.length + ' row' + (rows.length === 1 ? '' : 's') + '</span></h2>';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h += '<button class="btn sm ' + (isIncome?'inc':'exp') + '" data-quick="' + (isIncome?'income':'expense') + '" data-entity="' + entityId + '">＋ Quick Add</button>';
  h += '<button class="btn sm primary" data-add="' + kind + '" data-entity="' + entityId + '">+ Blank row</button>';
  h += '</div></div>';
  h += '<div class="card-body flush">';
  h += '<div class="toolbar" style="padding:10px 12px;margin:0;border-bottom:1px solid var(--border)">';
  h += '<div class="search"><span class="ico">⌕</span><input type="search" data-txsearch="1" placeholder="Filter ' + label.toLowerCase() + '…" value="' + esc(txFilter.q) + '"></div>';
  h += '</div>';
  h += '<div class="table-wrap">';
  h += '<table class="grid" data-entity="' + entityId + '" data-kind="' + kind + '">';
  h += '<thead><tr><th style="width:120px">Date</th><th>' + descLabel + '</th><th style="width:220px">Category</th><th style="width:130px;text-align:right">Amount ($)</th><th>Notes</th><th style="width:42px"></th></tr></thead><tbody>';
  if(filtered.length){
    filtered.forEach(function(r){
      h += '<tr data-id="' + r.id + '">';
      h += '<td><input type="date" data-field="date" value="' + esc(r.date) + '"></td>';
      h += '<td><input data-field="desc" value="' + esc(r.desc) + '" placeholder="Description"></td>';
      h += '<td><select data-field="category"><option value="">— select —</option>';
      cats.forEach(function(c){
        var sel = c.name === r.category ? ' selected' : '';
        h += '<option value="' + esc(c.name) + '"' + sel + '>' + esc(c.name) + '</option>';
      });
      h += '</select></td>';
      h += '<td><input type="number" step="0.01" data-field="amount" value="' + num(r.amount) + '" placeholder="0.00"></td>';
      h += '<td><input data-field="notes" value="' + esc(r.notes) + '" placeholder="Optional"></td>';
      h += '<td class="ctr"><button class="row-del" data-del="1" title="Delete">✕</button></td>';
      h += '</tr>';
    });
  } else {
    h += '<tr><td colspan="6" class="empty"><strong>No ' + label.toLowerCase() + (txFilter.q?' matching filter':'') + '</strong>Use Quick Add to enter a transaction.</td></tr>';
  }
  h += '</tbody><tfoot><tr><td colspan="3">Total ' + label + '</td><td class="num">' + fmt(total) + '</td><td colspan="2"></td></tr></tfoot></table>';
  h += '</div></div></div>';
  return h;
}

function viewEntity(id){
  var e = null;
  state.entities.forEach(function(x){ if(x.id === id) e = x; });
  if(!e) return '<div class="empty">Entity not found. <a href="setup.html">Go to Setup</a> to add one.</div>';
  var d = state.data[id];
  var t = entityTotals(id);
  var cats = categoryRows(id);
  var incCats = state.categories.filter(function(c){ return c.type === 'Revenue'; });
  var expCats = state.categories.filter(function(c){ return c.type !== 'Revenue'; });

  var h = '';
  h += '<div class="card" style="margin-bottom:14px"><div class="card-body"><div class="field-row">';
  h += '<div class="field" style="margin:0"><label>Entity name</label><input data-ent-meta="name" data-ent-id="' + id + '" value="' + esc(e.name) + '"></div>';
  h += '<div class="field" style="margin:0"><label>Entity type</label><input data-ent-meta="type" data-ent-id="' + id + '" value="' + esc(e.type) + '" placeholder="S-Corp / LLC"></div>';
  h += '</div><p style="font-size:11px;color:var(--muted);margin-top:8px">Rename here or in <a href="setup.html">Setup</a>. Changes auto-save and update the sidebar tab.</p></div></div>';
  h += '<div class="toolbar">';
  h += '<button class="btn inc" data-quick="income" data-entity="' + id + '">＋ Income</button>';
  h += '<button class="btn exp" data-quick="expense" data-entity="' + id + '">＋ Expense</button>';
  h += '<a class="btn sm" href="setup.html">Manage all entities</a>';
  h += '</div>';
  h += '<div class="kpi-row">';
  h += '<div class="kpi green"><div class="lbl">Income</div><div class="val">' + fmt(t.income) + '</div></div>';
  h += '<div class="kpi red"><div class="lbl">Expenses</div><div class="val">' + fmt(t.expenses) + '</div></div>';
  h += '<div class="kpi ' + (t.net >= 0 ? 'accent' : 'red') + '"><div class="lbl">Net Income</div><div class="val">' + fmt(t.net) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Transactions</div><div class="val">' + (d.income.length + d.expenses.length) + '</div></div>';
  h += '</div>';

  h += sectionTable('Income', 'income', id, d.income, incCats, 'Source');
  h += sectionTable('Expenses', 'expenses', id, d.expenses, expCats, 'Payee / Description');

  h += '<div class="card"><div class="card-head"><h2>Profit & Loss Statement</h2><span class="sub">Auto-calculated</span></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid"><thead><tr><th>Category</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead><tbody>';
  var revs = cats.filter(function(c){ return c.type === 'Revenue'; });
  var exps = cats.filter(function(c){ return c.type === 'Expense'; });
  if(revs.length){
    h += '<tr><td colspan="3" style="padding:8px 12px;font-weight:700;background:var(--green-soft);color:var(--green);font-size:11px;text-transform:uppercase;letter-spacing:.05em">Revenue</td></tr>';
    revs.forEach(function(c){
      h += '<tr><td style="padding:9px 12px">' + esc(c.category) + '</td>';
      h += '<td class="ctr"><span class="pill rev">Revenue</span></td>';
      h += '<td class="num">' + fmt(c.amount) + '</td></tr>';
    });
    h += '<tr style="background:var(--surface2)"><td style="padding:9px 12px;font-weight:700">Total Revenue</td><td></td><td class="num" style="font-weight:700">' + fmt(t.income) + '</td></tr>';
  }
  if(exps.length){
    h += '<tr><td colspan="3" style="padding:8px 12px;font-weight:700;background:var(--red-soft);color:var(--red);font-size:11px;text-transform:uppercase;letter-spacing:.05em">Expenses</td></tr>';
    exps.forEach(function(c){
      h += '<tr><td style="padding:9px 12px">' + esc(c.category) + '</td>';
      h += '<td class="ctr"><span class="pill exp">Expense</span></td>';
      h += '<td class="num">' + fmt(c.amount) + '</td></tr>';
    });
    h += '<tr style="background:var(--surface2)"><td style="padding:9px 12px;font-weight:700">Total Expenses</td><td></td><td class="num" style="font-weight:700">' + fmt(t.expenses) + '</td></tr>';
  }
  if(!cats.length) h += '<tr><td colspan="3" class="empty">No categorized transactions yet</td></tr>';
  h += '</tbody><tfoot><tr class="net"><td colspan="2">NET INCOME</td><td class="num" style="color:' + (t.net >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(t.net) + '</td></tr></tfoot></table>';
  h += '</div></div></div>';
  return h;
}

function personalTable(label, key, kind){
  var rows = state.personal[key] || [];
  var h = '';
  var headers = '';
  if(kind === 'income')        headers = '<th style="width:115px">Date</th><th>Description</th><th style="width:200px">Category</th><th style="width:125px;text-align:right">Amount ($)</th><th>Notes</th>';
  else if(kind === 'itemized') headers = '<th>Item</th><th style="width:110px">Person</th><th style="width:125px;text-align:right">Amount ($)</th><th>Notes</th>';
  else if(kind === 'roth')     headers = '<th>Account</th><th style="width:110px">Person</th><th style="width:125px;text-align:right">Amount ($)</th><th>Notes</th>';
  else if(kind === 'taxes')    headers = '<th style="width:115px">Date</th><th style="width:150px;text-align:right">Amount (PKR)</th><th style="width:100px;text-align:right">Rate</th><th style="width:130px;text-align:right">Amount (USD)</th><th>Notes</th>';
  h += '<div class="card"><div class="card-head">';
  h += '<h2>' + label + ' <span class="sub">' + rows.length + '</span></h2>';
  h += '<button class="btn sm primary" data-add="personal-' + kind + '">+ Add</button>';
  h += '</div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="personal-' + kind + '"><thead><tr>' + headers + '<th style="width:42px"></th></tr></thead><tbody>';
  if(rows.length){
    rows.forEach(function(r){
      h += '<tr data-id="' + r.id + '">';
      if(kind === 'income'){
        h += '<td><input type="date" data-field="date" value="' + esc(r.date) + '"></td>';
        h += '<td><input data-field="desc" value="' + esc(r.desc) + '"></td>';
        h += '<td><select data-field="category"><option value="">— select —</option>';
        state.categories.filter(function(c){ return c.type === 'Revenue'; }).forEach(function(c){
          var sel = c.name === r.category ? ' selected' : '';
          h += '<option value="' + esc(c.name) + '"' + sel + '>' + esc(c.name) + '</option>';
        });
        h += '</select></td>';
        h += '<td><input type="number" step="0.01" data-field="amount" value="' + num(r.amount) + '"></td>';
        h += '<td><input data-field="notes" value="' + esc(r.notes) + '"></td>';
      } else if(kind === 'itemized'){
        h += '<td><input data-field="item" value="' + esc(r.item) + '"></td>';
        h += '<td><input data-field="person" value="' + esc(r.person) + '"></td>';
        h += '<td><input type="number" step="0.01" data-field="amount" value="' + num(r.amount) + '"></td>';
        h += '<td><input data-field="notes" value="' + esc(r.notes) + '"></td>';
      } else if(kind === 'roth'){
        h += '<td><input data-field="account" value="' + esc(r.account) + '"></td>';
        h += '<td><input data-field="person" value="' + esc(r.person) + '"></td>';
        h += '<td><input type="number" step="0.01" data-field="amount" value="' + num(r.amount) + '"></td>';
        h += '<td><input data-field="notes" value="' + esc(r.notes) + '"></td>';
      } else if(kind === 'taxes'){
        h += '<td><input type="date" data-field="date" value="' + esc(r.date) + '"></td>';
        h += '<td><input type="number" step="1" data-field="amountPKR" value="' + num(r.amountPKR) + '"></td>';
        h += '<td><input type="number" step="0.01" data-field="rate" value="' + num(r.rate) + '"></td>';
        h += '<td><input type="number" step="0.01" data-field="amountUSD" value="' + num(r.amountUSD) + '"></td>';
        h += '<td><input data-field="notes" value="' + esc(r.notes) + '"></td>';
      }
      h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
      h += '</tr>';
    });
  } else {
    h += '<tr><td colspan="7" class="empty">No rows</td></tr>';
  }
  h += '</tbody></table></div></div></div>';
  return h;
}

function viewPersonal(){
  var p = personalTotals();
  var std = STD_DED_2025[state.settings.filingStatus] || STD_DED_2025.mfj;
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi green"><div class="lbl">Total Income</div><div class="val">' + fmt(p.inc) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Itemized Deductions</div><div class="val">' + fmt(p.item) + '</div></div>';
  h += '<div class="kpi accent"><div class="lbl">Roth / Investments</div><div class="val">' + fmt(p.roth) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Std Deduction (est.)</div><div class="val" style="font-size:18px">' + fmt0(std) + '</div><div class="meta">' + (p.item >= std ? 'Itemize likely better' : 'Standard may be better') + '</div></div>';
  h += '</div>';
  if(p.item > 0){
    h += '<div class="hint ' + (p.item >= std ? 'good' : 'warn') + '"><span>●</span><div>Itemized ' + fmt(p.item) + ' vs standard ~' + fmt0(std) + '. ' +
      (p.item >= std ? 'Itemizing appears advantageous by ' + fmt(p.item - std) + '.' : 'Standard deduction is higher by ' + fmt(std - p.item) + '.') +
      ' Confirm with your CPA — amounts are estimates.</div></div>';
  }
  h += personalTable('Income', 'income', 'income');
  h += personalTable('Itemized Deductions', 'itemized', 'itemized');
  h += personalTable('Roth IRA Conversions & Investments', 'roth', 'roth');
  h += personalTable('Taxes Paid in Pakistan', 'taxesPakistan', 'taxes');
  return h;
}

function viewForeign(){
  var f = foreignTotals();
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi"><div class="lbl">Property Cost</div><div class="val" style="font-size:16px">' + pkrFmt(f.propPKR) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Improvements</div><div class="val" style="font-size:16px">' + pkrFmt(f.impPKR) + '</div><div class="meta">' + fmt(f.impUSD) + '</div></div>';
  h += '<div class="kpi green"><div class="lbl">Rental Income</div><div class="val" style="font-size:16px">' + pkrFmt(f.rentIncPKR) + '</div><div class="meta">' + fmt(f.rentIncUSD) + '</div></div>';
  h += '<div class="kpi ' + (f.rentNetPKR >= 0 ? 'green' : 'red') + '"><div class="lbl">Net Rental</div><div class="val" style="font-size:16px">' + pkrFmt(f.rentNetPKR) + '</div><div class="meta">' + fmt(f.rentNetUSD) + '</div></div>';
  h += '</div>';
  h += '<div class="hint warn"><span>⚠</span><div>Confirm one PKR/USD rate source per transaction date. Original file used 3 rates (278, 172, 276.99).</div></div>';
  h += '<div class="card"><div class="card-head"><h2>Property Register</h2><button class="btn sm primary" data-add="foreign-properties">+ Add</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="foreign-properties"><thead><tr><th style="width:110px">Date</th><th>Property</th><th>Type</th><th>Address</th><th style="text-align:right">Buying (PKR)</th><th style="text-align:right">Other (PKR)</th><th style="text-align:right">Total (PKR)</th><th>Kind</th><th style="width:42px"></th></tr></thead><tbody>';
  state.foreign.properties.forEach(function(r){
    h += '<tr data-id="' + r.id + '">';
    h += '<td><input type="date" data-field="date" value="' + esc(r.date) + '"></td>';
    h += '<td><input data-field="property" value="' + esc(r.property) + '"></td>';
    h += '<td><input data-field="type" value="' + esc(r.type) + '"></td>';
    h += '<td><input data-field="address" value="' + esc(r.address) + '"></td>';
    h += '<td><input type="number" data-field="buyingPrice" value="' + num(r.buyingPrice) + '"></td>';
    h += '<td><input type="number" data-field="otherExpenses" value="' + num(r.otherExpenses) + '"></td>';
    h += '<td><input type="number" data-field="total" value="' + num(r.total) + '"></td>';
    h += '<td><input data-field="kind" value="' + esc(r.kind) + '"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';

  h += '<div class="card"><div class="card-head"><h2>Rental Improvements — Sample Property</h2><button class="btn sm primary" data-add="foreign-improvements">+ Add</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="foreign-improvements"><thead><tr><th>Item</th><th style="text-align:right;width:150px">Amount (PKR)</th><th style="text-align:right;width:130px">Amount (USD)</th><th style="width:42px"></th></tr></thead><tbody>';
  state.foreign.improvements.forEach(function(r){
    h += '<tr data-id="' + r.id + '">';
    h += '<td><input data-field="item" value="' + esc(r.item) + '"></td>';
    h += '<td><input type="number" data-field="amountPKR" value="' + num(r.amountPKR) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="amountUSD" value="' + num(r.amountUSD) + '"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody><tfoot><tr><td>TOTAL</td><td class="num">' + pkrFmt(f.impPKR) + '</td><td class="num">' + fmt(f.impUSD) + '</td><td></td></tr></tfoot></table>';
  h += '</div></div></div>';

  h += '<div class="card"><div class="card-head"><h2>Rental — Sample Foreign Property</h2></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid"><thead><tr><th style="width:110px">Date</th><th>Description</th><th style="text-align:right;width:150px">Amount (PKR)</th><th style="text-align:right;width:130px">Amount (USD)</th><th style="width:42px"></th></tr></thead><tbody>';
  h += '<tr><td colspan="5" style="padding:9px 12px;font-weight:700;background:var(--green-soft);color:var(--green);font-size:11px;letter-spacing:.05em;text-transform:uppercase">Rental Income</td></tr>';
  state.foreign.rental.income.forEach(function(r){
    h += '<tr data-coll="foreign-rental-inc" data-id="' + r.id + '">';
    h += '<td><input type="date" data-field="date" value="' + esc(r.date) + '"></td>';
    h += '<td><input data-field="desc" value="' + esc(r.desc) + '"></td>';
    h += '<td><input type="number" data-field="amountPKR" value="' + num(r.amountPKR) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="amountUSD" value="' + num(r.amountUSD) + '"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '<tr><td colspan="5" style="padding:9px 12px;font-weight:700;background:var(--red-soft);color:var(--red);font-size:11px;letter-spacing:.05em;text-transform:uppercase">Rental Expenses</td></tr>';
  state.foreign.rental.expenses.forEach(function(r){
    h += '<tr data-coll="foreign-rental-exp" data-id="' + r.id + '">';
    h += '<td><input type="date" data-field="date" value="' + esc(r.date) + '"></td>';
    h += '<td><input data-field="desc" value="' + esc(r.desc) + '"></td>';
    h += '<td><input type="number" data-field="amountPKR" value="' + num(r.amountPKR) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="amountUSD" value="' + num(r.amountUSD) + '"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody><tfoot>';
  h += '<tr><td colspan="2">Total Income</td><td class="num">' + pkrFmt(f.rentIncPKR) + '</td><td class="num">' + fmt(f.rentIncUSD) + '</td><td></td></tr>';
  h += '<tr><td colspan="2">Total Expenses</td><td class="num">' + pkrFmt(f.rentExpPKR) + '</td><td class="num">' + fmt(f.rentExpUSD) + '</td><td></td></tr>';
  h += '<tr class="net"><td colspan="2">Net Rental</td><td class="num">' + pkrFmt(f.rentNetPKR) + '</td><td class="num">' + fmt(f.rentNetUSD) + '</td><td></td></tr>';
  h += '</tfoot></table></div>';
  h += '<div style="padding:12px 18px"><button class="btn sm primary" data-add="foreign-rental-inc">+ Add Income</button> <button class="btn sm primary" data-add="foreign-rental-exp" style="margin-left:6px">+ Add Expense</button></div>';
  h += '</div></div>';
  return h;
}

function viewRental(){
  var ssre = state.data.rental;
  var inc = ssre.income.filter(function(r){ return catType(r.category) === 'Revenue'; });
  var exp = ssre.expenses;
  var tInc = inc.reduce(function(s,r){ return s + num(r.amount); }, 0);
  var tExp = exp.reduce(function(s,r){ return s + num(r.amount); }, 0);
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi green"><div class="lbl">Rental Income</div><div class="val">' + fmt(tInc) + '</div></div>';
  h += '<div class="kpi red"><div class="lbl">Rental Expenses</div><div class="val">' + fmt(tExp) + '</div></div>';
  h += '<div class="kpi ' + (tInc - tExp >= 0 ? 'green' : 'red') + '"><div class="lbl">Net Rental</div><div class="val">' + fmt(tInc - tExp) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Properties</div><div class="val">2</div></div>';
  h += '</div>';
  h += '<div class="hint"><span>ℹ</span><div>Add depreciation from Asset Register to expense total. Verify property-level allocation before filing.</div></div>';
  h += sectionTable('Rental Income', 'income', 'rental', inc, state.categories.filter(function(c){ return c.type === 'Revenue'; }), 'Source');
  h += sectionTable('Rental Expenses', 'expenses', 'rental', exp, state.categories.filter(function(c){ return c.type !== 'Revenue'; }), 'Payee / Description');
  return h;
}

var BS_LINES = {
  assets: ['Cash & bank accounts','Accounts receivable','Equipment & furniture, at cost','Less: accum. depreciation (negative)','Real estate, at cost','Less: accum. depreciation (negative)'],
  liab: ['Accounts payable','Loans & notes payable','Credit cards'],
  equity: ['Owner capital contributed','Owner draws / distributions (negative)','Retained earnings, prior years']
};

function bsKey(line, entityId){ return line + '||' + entityId; }
function bsVal(line, entityId){
  if(!state.balance) state.balance = {};
  return num(state.balance[bsKey(line, entityId)]);
}

function viewBalance(){
  var h = '';
  h += '<div class="hint warn"><span>⚠</span><div>Enter year-end balances below. Values auto-save. Net income flows automatically from each entity P&L.</div></div>';
  h += '<div class="card"><div class="card-head"><h2>Balance Sheet by Entity</h2><span class="sub">Year-end 2025</span></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="balance"><thead><tr><th>Line Item</th>';
  state.entities.forEach(function(e){ h += '<th style="text-align:right">' + esc(e.name) + '</th>'; });
  h += '</tr></thead><tbody>';
  h += '<tr><td colspan="' + (state.entities.length + 1) + '" style="padding:9px 12px;font-weight:700;background:var(--accent-soft);color:var(--accent);font-size:11px;text-transform:uppercase">Assets</td></tr>';
  BS_LINES.assets.forEach(function(line){
    h += '<tr><td style="padding:6px 12px">' + line + '</td>';
    state.entities.forEach(function(e){
      h += '<td><input type="number" step="0.01" data-bs-line="' + esc(line) + '" data-bs-entity="' + e.id + '" value="' + bsVal(line, e.id) + '" placeholder="0.00"></td>';
    });
    h += '</tr>';
  });
  h += '<tr style="background:var(--surface2)"><td style="padding:10px 12px;font-weight:700">Total Assets (inputs)</td>';
  state.entities.forEach(function(e){
    var sum = BS_LINES.assets.reduce(function(s,line){ return s + bsVal(line, e.id); }, 0);
    h += '<td class="num" style="font-weight:700">' + fmt(sum) + '</td>';
  });
  h += '</tr>';
  h += '<tr><td colspan="' + (state.entities.length + 1) + '" style="padding:9px 12px;font-weight:700;background:var(--amber-soft);color:var(--amber);font-size:11px;text-transform:uppercase">Liabilities</td></tr>';
  BS_LINES.liab.forEach(function(line){
    h += '<tr><td style="padding:6px 12px">' + line + '</td>';
    state.entities.forEach(function(e){
      h += '<td><input type="number" step="0.01" data-bs-line="' + esc(line) + '" data-bs-entity="' + e.id + '" value="' + bsVal(line, e.id) + '" placeholder="0.00"></td>';
    });
    h += '</tr>';
  });
  h += '<tr style="background:var(--surface2)"><td style="padding:10px 12px;font-weight:700">Total Liabilities</td>';
  state.entities.forEach(function(e){
    var sum = BS_LINES.liab.reduce(function(s,line){ return s + bsVal(line, e.id); }, 0);
    h += '<td class="num" style="font-weight:700">' + fmt(sum) + '</td>';
  });
  h += '</tr>';
  h += '<tr><td colspan="' + (state.entities.length + 1) + '" style="padding:9px 12px;font-weight:700;background:var(--green-soft);color:var(--green);font-size:11px;text-transform:uppercase">Equity</td></tr>';
  BS_LINES.equity.forEach(function(line){
    h += '<tr><td style="padding:6px 12px">' + line + '</td>';
    state.entities.forEach(function(e){
      h += '<td><input type="number" step="0.01" data-bs-line="' + esc(line) + '" data-bs-entity="' + e.id + '" value="' + bsVal(line, e.id) + '" placeholder="0.00"></td>';
    });
    h += '</tr>';
  });
  h += '<tr><td style="padding:9px 12px">Current-year net income (from P&L)</td>';
  state.entities.forEach(function(e){
    var t = entityTotals(e.id);
    h += '<td class="num" style="color:' + (t.net >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(t.net) + '</td>';
  });
  h += '</tr>';
  h += '</tbody></table></div></div></div>';
  return h;
}

function viewAssets(){
  var totalCost = 0, totalAccum = 0;
  state.assets.forEach(function(a){ totalCost += num(a.cost) + num(a.improvements); totalAccum += num(a.accumDep); });
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi"><div class="lbl">Total Basis</div><div class="val">' + fmt0(totalCost) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Accumulated Depr.</div><div class="val">' + fmt0(totalAccum) + '</div></div>';
  h += '<div class="kpi accent"><div class="lbl">Net Book Value</div><div class="val">' + fmt0(totalCost - totalAccum) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Assets</div><div class="val">' + state.assets.length + '</div></div>';
  h += '</div>';
  h += '<div class="card"><div class="card-head"><h2>Asset Register</h2><button class="btn sm primary" data-add="asset">+ Add Asset</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="assets"><thead><tr><th>Asset</th><th>Entity</th><th>Acquired</th><th style="text-align:right">Cost ($)</th><th style="text-align:right">Improv ($)</th><th style="text-align:right">Basis</th><th>Method</th><th style="text-align:right">Life</th><th style="text-align:right">Depr Yr</th><th style="text-align:right">Accum</th><th style="text-align:right">NBV</th><th>Sale Date</th><th style="text-align:right">Sale Price</th><th style="text-align:right">Gain/Loss</th><th>Notes</th><th style="width:42px"></th></tr></thead><tbody>';
  state.assets.forEach(function(a){
    var basis = num(a.cost) + num(a.improvements);
    var nbv = basis - num(a.accumDep);
    var gain = (a.saleDate && num(a.salePrice) > 0) ? num(a.salePrice) - num(a.sellingCosts) - nbv : null;
    h += '<tr data-id="' + a.id + '">';
    h += '<td><input data-field="name" value="' + esc(a.name) + '" style="min-width:160px"></td>';
    h += '<td><select data-field="entity">';
    state.entities.forEach(function(e){ h += '<option value="' + e.id + '"' + (e.id === a.entity ? ' selected' : '') + '>' + esc(e.name) + '</option>'; });
    h += '</select></td>';
    h += '<td><input type="date" data-field="acquired" value="' + esc(a.acquired) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="cost" value="' + num(a.cost) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="improvements" value="' + num(a.improvements) + '"></td>';
    h += '<td class="num">' + fmt0(basis) + '</td>';
    h += '<td><input data-field="method" value="' + esc(a.method) + '" style="min-width:130px"></td>';
    h += '<td><input type="number" step="0.1" data-field="life" value="' + num(a.life) + '" style="width:60px"></td>';
    h += '<td><input type="number" step="0.01" data-field="depThisYear" value="' + num(a.depThisYear) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="accumDep" value="' + num(a.accumDep) + '"></td>';
    h += '<td class="num">' + fmt0(nbv) + '</td>';
    h += '<td><input type="date" data-field="saleDate" value="' + esc(a.saleDate) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="salePrice" value="' + num(a.salePrice) + '"></td>';
    h += '<td class="num" style="color:' + (gain === null ? 'var(--faint)' : (gain >= 0 ? 'var(--green)' : 'var(--red)')) + '">' + (gain === null ? '—' : fmt0(gain)) + '</td>';
    h += '<td><input data-field="notes" value="' + esc(a.notes) + '"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';
  return h;
}

function viewMileage(){
  var mil = mileageTotals();
  var pct = mil.total ? (mil.biz / mil.total * 100) : 0;
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi"><div class="lbl">Total Miles</div><div class="val">' + mil.total.toLocaleString() + '</div></div>';
  h += '<div class="kpi accent"><div class="lbl">Business Miles</div><div class="val">' + mil.biz.toLocaleString() + '</div></div>';
  h += '<div class="kpi green"><div class="lbl">Business Use %</div><div class="val">' + pct.toFixed(1) + '%</div></div>';
  h += '<div class="kpi"><div class="lbl">Est. Deduction</div><div class="val" style="font-size:18px">' + fmt0(mil.deduction) + '</div><div class="meta">@$'+MILEAGE_RATE_2025.toFixed(2)+'/mi (2025)</div></div>';
  h += '</div>';
  h += '<div class="card"><div class="card-head"><h2>Mileage Log</h2><button class="btn sm primary" data-add="mileage">+ Add Trip</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="mileage"><thead><tr><th style="width:120px">Date</th><th>Vehicle</th><th>Purpose</th><th style="text-align:right">Start Odo</th><th style="text-align:right">End Odo</th><th style="text-align:right">Miles</th><th>Business?</th><th style="text-align:right">Biz Miles</th><th style="width:42px"></th></tr></thead><tbody>';
  state.mileage.forEach(function(m){
    var miles = (m.start !== '' && m.end !== '') ? num(m.end) - num(m.start) : null;
    var biz = miles !== null ? (m.business === 'Y' ? miles : 0) : null;
    h += '<tr data-id="' + m.id + '">';
    h += '<td><input type="date" data-field="date" value="' + esc(m.date) + '"></td>';
    h += '<td><input data-field="vehicle" value="' + esc(m.vehicle) + '"></td>';
    h += '<td><input data-field="purpose" value="' + esc(m.purpose) + '"></td>';
    h += '<td><input type="number" data-field="start" value="' + num(m.start) + '"></td>';
    h += '<td><input type="number" data-field="end" value="' + num(m.end) + '"></td>';
    h += '<td class="num">' + (miles === null ? '—' : miles.toLocaleString()) + '</td>';
    h += '<td class="ctr"><select data-field="business" style="text-align:center"><option value="Y"' + (m.business === 'Y' ? ' selected' : '') + '>Y</option><option value="N"' + (m.business !== 'Y' ? ' selected' : '') + '>N</option></select></td>';
    h += '<td class="num">' + (biz === null ? '—' : biz.toLocaleString()) + '</td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';
  return h;
}

function viewRetirement(){
  var totalContrib = 0;
  state.retirement.forEach(function(r){ totalContrib += num(r.contributed); });
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi"><div class="lbl">Total Contributed</div><div class="val">' + fmt0(totalContrib) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Plans Tracked</div><div class="val">' + state.retirement.length + '</div></div>';
  h += '<div class="kpi accent"><div class="lbl">Tax Year</div><div class="val">2025</div></div>';
  h += '</div>';
  h += '<div class="hint warn"><span>⚠</span><div>Enter the IRS limit for the tax year. Confirm all limits and eligibility rules with a CPA.</div></div>';
  h += '<div class="card"><div class="card-head"><h2>Retirement & HSA Contributions</h2><button class="btn sm primary" data-add="retirement">+ Add Plan</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="retirement"><thead><tr><th>Plan / Account</th><th>Owner</th><th style="text-align:right">Contributed YTD ($)</th><th style="text-align:right">Annual Limit ($)</th><th style="text-align:right">Remaining Room</th><th>Notes</th><th style="width:42px"></th></tr></thead><tbody>';
  state.retirement.forEach(function(r){
    var room = num(r.limit) > 0 ? Math.max(0, num(r.limit) - num(r.contributed)) : null;
    h += '<tr data-id="' + r.id + '">';
    h += '<td><input data-field="plan" value="' + esc(r.plan) + '"></td>';
    h += '<td><input data-field="owner" value="' + esc(r.owner) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="contributed" value="' + num(r.contributed) + '"></td>';
    h += '<td><input type="number" step="0.01" data-field="limit" value="' + num(r.limit) + '"></td>';
    h += '<td class="num">' + (room === null ? '—' : fmt0(room)) + '</td>';
    h += '<td><input data-field="notes" value="' + esc(r.notes) + '"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';
  return h;
}

function viewTaxTools(){
  var g = grandTotals();
  var p = personalTotals();
  var mil = mileageTotals();
  var meals = mealsDeductible();
  var fs = state.settings.filingStatus || 'mfj';
  var std = STD_DED_2025[fs] || STD_DED_2025.mfj;
  var betterDed = Math.max(std, p.item);
  var bracket = num(state.settings.estimatedBracket) || 0.24;
  var seRate = num(state.settings.seTaxRate) || 0.153;
  // rough taxable income estimate: entity net + personal - better deduction
  var roughTaxable = Math.max(0, g.net + p.inc - betterDed);
  var estIncomeTax = roughTaxable * bracket;
  var seBase = Math.max(0, g.net * 0.9235); // approx SE base
  var estSE = seBase * seRate;
  var quarterly = (estIncomeTax + estSE) / 4;

  var h = '';
  h += '<div class="hint"><span>ℹ</span><div>Planning helpers only — not tax advice. Confirm rates, limits, and entity treatment with your CPA before filing or paying estimates.</div></div>';

  h += '<div class="kpi-row">';
  h += '<div class="kpi accent"><div class="lbl">Est. Quarterly Payment</div><div class="val" style="font-size:20px">' + fmt0(quarterly) + '</div><div class="meta">Income tax + SE / 4</div></div>';
  h += '<div class="kpi"><div class="lbl">Mileage Deduction</div><div class="val" style="font-size:20px">' + fmt0(mil.deduction) + '</div></div>';
  h += '<div class="kpi green"><div class="lbl">Meals Deductible (~50%)</div><div class="val" style="font-size:20px">' + fmt0(meals.deductible) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Better Deduction</div><div class="val" style="font-size:20px">' + fmt0(betterDed) + '</div><div class="meta">' + (p.item>=std?'Itemized':'Standard') + '</div></div>';
  h += '</div>';

  h += '<div class="grid-2">';

  // Settings / assumptions
  h += '<div class="tool-card"><h3>Assumptions</h3><p>Used by the estimators below</p>';
  h += '<div class="field"><label>Filing status</label><select id="ttFiling">';
  [{v:'single',l:'Single'},{v:'mfj',l:'Married Filing Jointly'},{v:'mfs',l:'Married Filing Separately'},{v:'hof',l:'Head of Household'},{v:'qss',l:'Qualifying Surviving Spouse'}].forEach(function(o){
    h += '<option value="'+o.v+'"'+(fs===o.v?' selected':'')+'>'+o.l+'</option>';
  });
  h += '</select></div>';
  h += '<div class="field-row"><div class="field"><label>Est. marginal bracket</label><input type="number" step="0.01" min="0" max="1" id="ttBracket" value="'+bracket+'"></div>';
  h += '<div class="field"><label>SE tax rate</label><input type="number" step="0.001" id="ttSE" value="'+seRate+'"></div></div>';
  h += '<button class="btn primary sm" id="ttSaveAssumptions">Apply assumptions</button>';
  h += '</div>';

  // Std vs itemized
  h += '<div class="tool-card"><h3>Standard vs Itemized</h3><p>TY2025 approximate standard deductions</p>';
  h += '<div class="tool-result"><div class="lbl">Standard deduction</div><div class="big">' + fmt0(std) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Your itemized total</div><div class="big" style="font-size:18px">' + fmt(p.item) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Recommended path</div><div class="big" style="font-size:16px;color:' + (p.item>=std?'var(--green)':'var(--accent)') + '">' +
    (p.item>=std ? 'Itemize (+' + fmt0(p.item-std) + ')' : 'Take standard (+' + fmt0(std-p.item) + ')') + '</div></div>';
  h += '</div>';

  // Quarterly estimate
  h += '<div class="tool-card"><h3>Quarterly estimate worksheet</h3><p>Rough safe-harbor style planning number</p>';
  h += '<div class="tool-result"><div class="lbl">Entity net + personal income</div><div class="big" style="font-size:18px">' + fmt(g.net + p.inc) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Less better deduction</div><div class="big" style="font-size:18px">' + fmt(betterDed) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Rough taxable</div><div class="big" style="font-size:18px">' + fmt(roughTaxable) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Est. income tax @ ' + (bracket*100).toFixed(0) + '%</div><div class="big" style="font-size:18px">' + fmt0(estIncomeTax) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Est. SE tax</div><div class="big" style="font-size:18px">' + fmt0(estSE) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px;background:var(--accent-soft)"><div class="lbl">Suggested / quarter</div><div class="big">' + fmt0(quarterly) + '</div></div>';
  h += '</div>';

  // Mileage calc
  h += '<div class="tool-card"><h3>Mileage deduction</h3><p>IRS 2025 standard rate $' + MILEAGE_RATE_2025.toFixed(2) + ' / business mile</p>';
  h += '<div class="tool-result"><div class="lbl">Business miles logged</div><div class="big" style="font-size:18px">' + mil.biz.toLocaleString() + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Deduction</div><div class="big">' + fmt0(mil.deduction) + '</div></div>';
  h += '<div class="field" style="margin-top:12px"><label>What-if miles</label><input type="number" id="ttMiles" value="' + mil.biz + '"></div>';
  h += '<div class="tool-result" id="ttMilesOut"><div class="lbl">What-if deduction</div><div class="big" style="font-size:18px">' + fmt0(mil.deduction) + '</div></div>';
  h += '<button class="btn sm" style="margin-top:8px" data-nav="mileage">Edit mileage log →</button>';
  h += '</div>';

  // Meals
  h += '<div class="tool-card"><h3>Meals 50% calculator</h3><p>Sums categories containing “Meals”</p>';
  h += '<div class="tool-result"><div class="lbl">Booked meals</div><div class="big" style="font-size:18px">' + fmt(meals.total) + '</div></div>';
  h += '<div class="tool-result" style="margin-top:8px"><div class="lbl">Generally deductible</div><div class="big">' + fmt(meals.deductible) + '</div></div>';
  h += '<div class="field" style="margin-top:12px"><label>What-if meals total</label><input type="number" step="0.01" id="ttMeals" value="' + meals.total + '"></div>';
  h += '<div class="tool-result" id="ttMealsOut"><div class="lbl">What-if deductible</div><div class="big" style="font-size:18px">' + fmt(meals.deductible) + '</div></div>';
  h += '</div>';

  // PKR converter
  h += '<div class="tool-card"><h3>PKR → USD helper</h3><p>For foreign property notes</p>';
  h += '<div class="field-row"><div class="field"><label>Amount (PKR)</label><input type="number" id="ttPKR" value="100000"></div>';
  h += '<div class="field"><label>Rate (PKR per USD)</label><input type="number" step="0.01" id="ttRate" value="278"></div></div>';
  h += '<div class="tool-result" id="ttPKROut"><div class="lbl">USD</div><div class="big" style="font-size:18px">' + fmt(100000/278) + '</div></div>';
  h += '</div>';

  h += '</div>'; // grid
  return h;
}

function viewIssues(){
  var open = openIssuesCount();
  var h = '';
  h += '<div class="kpi-row">';
  h += '<div class="kpi red"><div class="lbl">Open</div><div class="val">' + open + '</div></div>';
  h += '<div class="kpi green"><div class="lbl">Closed</div><div class="val">' + (state.issues.length - open) + '</div></div>';
  h += '<div class="kpi"><div class="lbl">Total</div><div class="val">' + state.issues.length + '</div></div>';
  h += '</div>';
  h += '<div class="card"><div class="card-head"><h2>Open Issues Tracker</h2><button class="btn sm primary" data-add="issue">+ Add Item</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="issues"><thead><tr><th>Item</th><th>Entity</th><th>Priority</th><th>Status</th><th>Owner</th><th>Resolution</th><th style="width:42px"></th></tr></thead><tbody>';
  state.issues.forEach(function(it){
    h += '<tr data-id="' + it.id + '">';
    h += '<td><input data-field="item" value="' + esc(it.item) + '" style="min-width:280px"></td>';
    h += '<td><select data-field="entity">';
    state.entities.forEach(function(e){ h += '<option value="' + e.id + '"' + (e.id === it.entity ? ' selected' : '') + '>' + esc(e.name) + '</option>'; });
    h += '</select></td>';
    h += '<td class="ctr"><select data-field="priority" style="text-align:center"><option' + (it.priority === 'High' ? ' selected' : '') + '>High</option><option' + (it.priority === 'Medium' ? ' selected' : '') + '>Medium</option><option' + (it.priority === 'Low' ? ' selected' : '') + '>Low</option></select></td>';
    h += '<td class="ctr"><select data-field="status" style="text-align:center"><option' + (it.status === 'Open' ? ' selected' : '') + '>Open</option><option' + (it.status === 'In Progress' ? ' selected' : '') + '>In Progress</option><option' + (it.status === 'Closed' ? ' selected' : '') + '>Closed</option></select></td>';
    h += '<td><input data-field="owner" value="' + esc(it.owner) + '" placeholder="—"></td>';
    h += '<td><input data-field="resolution" value="' + esc(it.resolution) + '" placeholder="Notes"></td>';
    h += '<td class="ctr"><button class="row-del" data-del="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';
  return h;
}

function viewSetup(){
  var h = '';
  h += '<div class="hint"><span>⚙</span><div><strong>Edit entity names</strong> in the table below (auto-saves). <strong>Add Entity</strong> creates a new tab in the sidebar. Open an entity to enter income/expenses. Categories control every dropdown.</div></div>';
  h += '<div class="card"><div class="card-head"><h2>Entities</h2><button class="btn sm primary" data-add="entity">+ Add Entity</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="entities"><thead><tr><th>Entity name</th><th>Entity type</th><th style="width:90px">Open</th><th style="width:42px"></th></tr></thead><tbody>';
  state.entities.forEach(function(e){
    h += '<tr data-id="' + e.id + '">';
    h += '<td><input data-field="name" value="' + esc(e.name) + '" placeholder="Entity name"></td>';
    h += '<td><input data-field="type" value="' + esc(e.type) + '" placeholder="S-Corp / LLC"></td>';
    h += '<td class="ctr"><a class="btn sm" href="' + entityHref(e.id) + '">Open →</a></td>';
    h += '<td class="ctr"><button class="row-del" data-del-entity="1" title="Delete entity">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';
  h += '<div class="card"><div class="card-head"><h2>Categories</h2><button class="btn sm primary" data-add="category">+ Add Category</button></div><div class="card-body flush"><div class="table-wrap">';
  h += '<table class="grid" data-coll="categories"><thead><tr><th>Category</th><th style="width:180px">Type</th><th style="width:42px"></th></tr></thead><tbody>';
  state.categories.forEach(function(c, i){
    h += '<tr data-idx="' + i + '">';
    h += '<td><input data-field="name" value="' + esc(c.name) + '"></td>';
    h += '<td><select data-field="type">';
    ['Revenue', 'Expense', 'Owner/Transfer'].forEach(function(t){
      h += '<option' + (t === c.type ? ' selected' : '') + '>' + t + '</option>';
    });
    h += '</select></td>';
    h += '<td class="ctr"><button class="row-del" data-del-cat="1">✕</button></td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div></div>';
  h += '<div class="card"><div class="card-head"><h2>Data Management</h2></div><div class="card-body">';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  h += '<button class="btn success" data-act="excel">Download Excel (.xlsx)</button>';
  h += '<button class="btn" data-act="export">Export JSON Backup</button>';
  h += '<button class="btn" data-act="import">Import JSON</button>';
  h += '<button class="btn" data-act="csv">Export CSV</button>';
  h += '<button class="btn danger" data-act="reset">Reset to Defaults</button>';
  h += '</div>';
  h += '<p style="font-size:11.5px;color:var(--muted);margin-top:12px">Hybrid storage: live edits stay in localStorage; export Excel/JSON for CPA handoff and off-device backup.</p>';
  h += '</div></div>';
  return h;
}

/* ---------- MAIN RENDER ---------- */
function render(){
  try {
    var title = 'Dashboard', sub = 'Roll-up of all entities';
    if(VIEWS[currentView]){ title = VIEWS[currentView].title; sub = VIEWS[currentView].sub; }
    else {
      var e = null;
      state.entities.forEach(function(x){ if(x.id === currentView) e = x; });
      if(e){ title = e.name; sub = e.type + ' · enter income & expenses below'; }
    }
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSub').textContent = sub;

    document.getElementById('actions').innerHTML =
      '<span class="save-dot" id="saveDot"><i></i> Saved</span>' +
      '<button class="btn inc sm" data-quick="income">＋ Income</button>' +
      '<button class="btn exp sm" data-quick="expense">＋ Expense</button>' +
      '<button class="btn success big" data-act="excel">⬇ Excel</button>' +
      '<button class="btn sm" data-act="export">JSON</button>' +
      '<button class="btn sm" data-act="print">Print</button>';

    renderNav();

    var html = '';
    if(currentView === 'dashboard')       html = viewDashboard();
    else if(currentView === 'personal')   html = viewPersonal();
    else if(currentView === 'foreign')    html = viewForeign();
    else if(currentView === 'rental')     html = viewRental();
    else if(currentView === 'balance')    html = viewBalance();
    else if(currentView === 'assets')     html = viewAssets();
    else if(currentView === 'mileage')    html = viewMileage();
    else if(currentView === 'retirement') html = viewRetirement();
    else if(currentView === 'taxtools')   html = viewTaxTools()
      + '<div id="mileage"></div>' + viewMileage()
      + '<div id="retirement"></div>' + viewRetirement()
      + '<div id="assets"></div>' + viewAssets()
      + '<div id="balance"></div>' + viewBalance()
      + '<div id="issues"></div>' + viewIssues()
      + '<div id="setup"></div>' + viewSetup();
    else if(currentView === 'issues')     html = viewIssues();
    else if(currentView === 'setup')      html = viewSetup();
    else                                  html = viewEntity(currentView);

    document.getElementById('content').innerHTML = html;
    bindTaxTools();
  } catch(err){
    console.error('Render error:', err);
    document.getElementById('content').innerHTML =
      '<div style="padding:24px;background:var(--red-soft);color:var(--red);border-radius:12px;font-family:var(--mono);white-space:pre-wrap;font-size:12px">' +
      'Render error: ' + esc(err.message) + '\n\n' + esc(err.stack || '') + '</div>';
  }
}

function bindTaxTools(){
  if(currentView !== 'taxtools') return;
  var saveBtn = document.getElementById('ttSaveAssumptions');
  if(saveBtn){
    saveBtn.addEventListener('click', function(){
      state.settings.filingStatus = document.getElementById('ttFiling').value;
      state.settings.estimatedBracket = num(document.getElementById('ttBracket').value);
      state.settings.seTaxRate = num(document.getElementById('ttSE').value);
      save(); render(); toast('Assumptions updated');
    });
  }
  var miles = document.getElementById('ttMiles');
  if(miles){
    miles.addEventListener('input', function(){
      var d = num(miles.value) * MILEAGE_RATE_2025;
      document.getElementById('ttMilesOut').innerHTML = '<div class="lbl">What-if deduction</div><div class="big" style="font-size:18px">' + fmt0(d) + '</div>';
    });
  }
  var meals = document.getElementById('ttMeals');
  if(meals){
    meals.addEventListener('input', function(){
      document.getElementById('ttMealsOut').innerHTML = '<div class="lbl">What-if deductible</div><div class="big" style="font-size:18px">' + fmt(num(meals.value)*0.5) + '</div>';
    });
  }
  function updPKR(){
    var pkr = num(document.getElementById('ttPKR').value);
    var rate = num(document.getElementById('ttRate').value) || 1;
    document.getElementById('ttPKROut').innerHTML = '<div class="lbl">USD</div><div class="big" style="font-size:18px">' + fmt(pkr/rate) + '</div>';
  }
  var pkrEl = document.getElementById('ttPKR');
  var rateEl = document.getElementById('ttRate');
  if(pkrEl){ pkrEl.addEventListener('input', updPKR); rateEl.addEventListener('input', updPKR); }
}

/* ---------- EVENTS ---------- */
document.addEventListener('click', function(ev){
  var navEl = ev.target.closest('[data-nav]');
  if(navEl){
    var id = navEl.getAttribute('data-nav');
    var href = pageHref(id);
    if(href){ location.href = href; return; }
    currentView = id;
    txFilter.q = '';
    render();
    window.scrollTo({top:0, behavior:'smooth'});
    return;
  }
  var qBtn = ev.target.closest('[data-quick]');
  if(qBtn){
    openEntry(qBtn.getAttribute('data-quick') === 'income' ? 'income' : 'expense', qBtn.getAttribute('data-entity'));
    return;
  }
  var addBtn = ev.target.closest('[data-add]');
  if(addBtn){ handleAdd(addBtn.getAttribute('data-add'), addBtn.getAttribute('data-entity')); return; }
  var delBtn = ev.target.closest('.row-del');
  if(delBtn){ handleDelete(delBtn); return; }
  var actBtn = ev.target.closest('[data-act]');
  if(actBtn){ handleAction(actBtn.getAttribute('data-act')); return; }
});

document.getElementById('content').addEventListener('input', function(ev){
  var el = ev.target;
  if(el.hasAttribute('data-ent-meta')){
    var ent = findById(state.entities, el.getAttribute('data-ent-id'));
    if(ent){
      ent[el.getAttribute('data-ent-meta')] = el.value;
      save();
      renderNav();
      if(el.getAttribute('data-ent-meta') === 'name'){
        document.getElementById('pageTitle').textContent = el.value || 'Entity';
      }
    }
    return;
  }
  if(el.hasAttribute('data-txsearch')){
    txFilter.q = el.value;
    // soft re-render would lose focus — filter client-side by re-render with caret restore is heavy;
    // debounce re-render
    clearTimeout(txFilter._t);
    txFilter._t = setTimeout(function(){ render(); }, 280);
    return;
  }
  if(el.hasAttribute('data-bs-line')){
    if(!state.balance) state.balance = {};
    state.balance[bsKey(el.getAttribute('data-bs-line'), el.getAttribute('data-bs-entity'))] = el.value;
    save();
    return;
  }
  var field = el.getAttribute('data-field');
  if(!field) return;
  var row = el.closest('tr');
  if(!row) return;
  var id = row.getAttribute('data-id');
  var table = el.closest('table');
  var coll = table ? table.getAttribute('data-coll') : (row.getAttribute('data-coll') || null);
  var entityId = table ? table.getAttribute('data-entity') : null;
  var kind = table ? table.getAttribute('data-kind') : null;

  var target = null;
  if(coll === 'entities')                 target = findById(state.entities, id);
  else if(coll === 'categories')          target = state.categories[parseInt(row.getAttribute('data-idx'), 10)];
  else if(coll === 'personal-income')     target = findById(state.personal.income, id);
  else if(coll === 'personal-itemized')   target = findById(state.personal.itemized, id);
  else if(coll === 'personal-roth')       target = findById(state.personal.roth, id);
  else if(coll === 'personal-taxes')      target = findById(state.personal.taxesPakistan, id);
  else if(coll === 'foreign-properties')  target = findById(state.foreign.properties, id);
  else if(coll === 'foreign-improvements')target = findById(state.foreign.improvements, id);
  else if(coll === 'foreign-rental-inc')  target = findById(state.foreign.rental.income, id);
  else if(coll === 'foreign-rental-exp')  target = findById(state.foreign.rental.expenses, id);
  else if(coll === 'assets')              target = findById(state.assets, id);
  else if(coll === 'mileage')             target = findById(state.mileage, id);
  else if(coll === 'retirement')          target = findById(state.retirement, id);
  else if(coll === 'issues')              target = findById(state.issues, id);
  else if(entityId && kind)               target = findById(state.data[entityId][kind], id);

  if(!target) return;
  target[field] = el.value;
  if(coll === 'entities' && (field === 'name' || field === 'type')){
    save();
    renderNav();
    if(field === 'name' && currentView === id){
      document.getElementById('pageTitle').textContent = el.value || 'Entity';
    }
    return;
  }
  // auto USD from PKR*rate for taxes if rate+pkr set
  if(coll === 'personal-taxes' && (field === 'amountPKR' || field === 'rate')){
    if(num(target.rate) > 0 && num(target.amountPKR) > 0){
      target.amountUSD = +(num(target.amountPKR) / num(target.rate)).toFixed(2);
    }
  }
  if(coll === 'foreign-properties' && (field === 'buyingPrice' || field === 'otherExpenses')){
    target.total = num(target.buyingPrice) + num(target.otherExpenses);
  }
  save();
});

document.getElementById('content').addEventListener('change', function(ev){
  if(ev.target.getAttribute('data-field') || ev.target.hasAttribute('data-bs-line')){
    var e = new Event('input', {bubbles: true});
    ev.target.dispatchEvent(e);
    // re-render for computed columns after select/date changes that affect KPIs
    if(ev.target.tagName === 'SELECT' || ev.target.type === 'date' || ev.target.type === 'number'){
      clearTimeout(render._soft);
      render._soft = setTimeout(function(){
        // only soft-refresh views that show computed footers heavily
        if(['mileage','assets','retirement','dashboard','taxtools','personal'].indexOf(currentView)>=0 || state.data[currentView]){
          var active = document.activeElement;
          var aid = active && active.getAttribute('data-field');
          render();
        }
      }, 400);
    }
  }
});

function findById(arr, id){
  for(var i=0; i<arr.length; i++) if(arr[i].id === id) return arr[i];
  return null;
}

function handleAdd(kind, entityId){
  if(kind === 'income' || kind === 'expenses'){
    state.data[entityId][kind].push({id:uid(), date:today(), desc:'', category:'', amount:0, notes:''});
  }
  else if(kind === 'personal-income')    state.personal.income.push({id:uid(), date:today(), desc:'', category:'', amount:0, notes:''});
  else if(kind === 'personal-itemized')  state.personal.itemized.push({id:uid(), item:'', person:'', amount:0, notes:''});
  else if(kind === 'personal-roth')      state.personal.roth.push({id:uid(), account:'', person:'', amount:0, notes:''});
  else if(kind === 'personal-taxes')     state.personal.taxesPakistan.push({id:uid(), date:today(), amountPKR:0, rate:0, amountUSD:0, notes:''});
  else if(kind === 'foreign-properties') state.foreign.properties.push({id:uid(), date:today(), property:'', type:'', address:'', buyingPrice:0, otherExpenses:0, total:0, kind:''});
  else if(kind === 'foreign-improvements') state.foreign.improvements.push({id:uid(), item:'', amountPKR:0, amountUSD:0});
  else if(kind === 'foreign-rental-inc') state.foreign.rental.income.push({id:uid(), date:today(), desc:'', amountPKR:0, amountUSD:0});
  else if(kind === 'foreign-rental-exp') state.foreign.rental.expenses.push({id:uid(), date:today(), desc:'', amountPKR:0, amountUSD:0});
  else if(kind === 'asset')              state.assets.push({id:uid(), name:'', entity:state.entities[0].id, acquired:today(), cost:0, improvements:0, method:'', life:0, depThisYear:0, accumDep:0, saleDate:'', salePrice:0, sellingCosts:0, notes:''});
  else if(kind === 'mileage')            state.mileage.push({id:uid(), date:today(), vehicle:'', purpose:'', start:0, end:0, business:'Y'});
  else if(kind === 'retirement')         state.retirement.push({id:uid(), plan:'', owner:'Owner', contributed:0, limit:0, notes:''});
  else if(kind === 'entity'){
    var id = uid();
    state.entities.push({id:id, name:'New Entity', type:'LLC'});
    state.data[id] = {income:[], expenses:[]};
    save();
    toast('Entity added — rename it below, then Open');
    render();
    return;
  }
  else if(kind === 'category')           state.categories.push({name:'New Category', type:'Expense'});
  else if(kind === 'issue')              state.issues.push({id:uid(), item:'', entity:state.entities[0].id, priority:'Medium', status:'Open', owner:'', resolution:''});
  save(); render();
}

function handleDelete(btn){
  var row = btn.closest('tr');
  if(!row) return;
  var id = row.getAttribute('data-id');
  var table = row.closest('table');
  var coll = table ? table.getAttribute('data-coll') : (row.getAttribute('data-coll') || null);
  var entityId = table ? table.getAttribute('data-entity') : null;
  var kind = table ? table.getAttribute('data-kind') : null;

  if(btn.hasAttribute('data-del-entity')){
    var ent = findById(state.entities, id);
    if(!confirm('Delete entity "' + ent.name + '" and all its transactions?')) return;
    state.entities = state.entities.filter(function(x){ return x.id !== id; });
    delete state.data[id];
    if(currentView === id) currentView = 'dashboard';
    save(); render(); return;
  }
  if(btn.hasAttribute('data-del-cat')){
    var idx = parseInt(row.getAttribute('data-idx'), 10);
    if(!confirm('Delete category "' + state.categories[idx].name + '"?')) return;
    state.categories.splice(idx, 1);
    save(); render(); return;
  }

  if(!confirm('Delete this row?')) return;

  if(coll === 'personal-income')     state.personal.income = state.personal.income.filter(function(x){ return x.id !== id; });
  else if(coll === 'personal-itemized') state.personal.itemized = state.personal.itemized.filter(function(x){ return x.id !== id; });
  else if(coll === 'personal-roth')     state.personal.roth = state.personal.roth.filter(function(x){ return x.id !== id; });
  else if(coll === 'personal-taxes')    state.personal.taxesPakistan = state.personal.taxesPakistan.filter(function(x){ return x.id !== id; });
  else if(coll === 'foreign-properties') state.foreign.properties = state.foreign.properties.filter(function(x){ return x.id !== id; });
  else if(coll === 'foreign-improvements') state.foreign.improvements = state.foreign.improvements.filter(function(x){ return x.id !== id; });
  else if(coll === 'foreign-rental-inc') state.foreign.rental.income = state.foreign.rental.income.filter(function(x){ return x.id !== id; });
  else if(coll === 'foreign-rental-exp') state.foreign.rental.expenses = state.foreign.rental.expenses.filter(function(x){ return x.id !== id; });
  else if(coll === 'assets')             state.assets = state.assets.filter(function(x){ return x.id !== id; });
  else if(coll === 'mileage')            state.mileage = state.mileage.filter(function(x){ return x.id !== id; });
  else if(coll === 'retirement')         state.retirement = state.retirement.filter(function(x){ return x.id !== id; });
  else if(coll === 'issues')             state.issues = state.issues.filter(function(x){ return x.id !== id; });
  else if(entityId && kind)              state.data[entityId][kind] = state.data[entityId][kind].filter(function(x){ return x.id !== id; });

  save(); render();
}

function handleAction(act){
  if(act === 'excel')  exportExcel();
  if(act === 'export') exportJSON();
  if(act === 'import') document.getElementById('fileInput').click();
  if(act === 'csv')    exportCSV();
  if(act === 'print')  window.print();
  if(act === 'reset'){
    if(confirm('Reset ALL data to default template?')){ state = clone(DEFAULT); state.balance={}; state.settings={ theme: document.documentElement.getAttribute('data-theme')||'light', filingStatus:'mfj', seTaxRate:0.153, estimatedBracket:0.24 }; save(); render(); }
  }
}

document.getElementById('fileInput').addEventListener('change', function(ev){
  var file = ev.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try{
      var parsed = JSON.parse(e.target.result);
      if(!parsed.entities || !parsed.data) throw new Error('Invalid file');
      state = parsed;
      state.entities.forEach(function(en){ if(!state.data[en.id]) state.data[en.id] = {income:[], expenses:[]}; });
      if(!state.balance) state.balance = {};
      if(!state.settings) state.settings = { theme:'light', filingStatus:'mfj', seTaxRate:0.153, estimatedBracket:0.24 };
      save(); render(); toast('Imported successfully');
    }catch(err){ alert('Import failed: ' + err.message); }
  };
  reader.readAsText(file);
  ev.target.value = '';
});

function exportJSON(){
  var blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'TaxYear2025_Backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('JSON exported');
}

function exportCSV(){
  var lines = [];
  state.entities.forEach(function(e){
    var d = state.data[e.id];
    lines.push('=== ' + e.name + ' ===');
    lines.push('Section,Date,Description,Category,Amount,Notes');
    d.income.forEach(function(r){ lines.push('Income,' + r.date + ',"' + (r.desc||'').replace(/"/g,'""') + '","' + r.category + '",' + num(r.amount) + ',"' + (r.notes||'').replace(/"/g,'""') + '"'); });
    d.expenses.forEach(function(r){ lines.push('Expense,' + r.date + ',"' + (r.desc||'').replace(/"/g,'""') + '","' + r.category + '",' + num(r.amount) + ',"' + (r.notes||'').replace(/"/g,'""') + '"'); });
    var t = entityTotals(e.id);
    lines.push(',Total Income,,,' + t.income);
    lines.push(',Total Expenses,,,' + t.expenses);
    lines.push(',Net Income,,,' + t.net);
    lines.push('');
  });
  var blob = new Blob([lines.join('\n')], {type:'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'TaxYear2025_Export_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV exported');
}

function toast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('show'); }, 2500);
}

/* Theme */
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode';
  if(state && state.settings){ state.settings.theme = theme; save(); }
}
document.getElementById('themeBtn').addEventListener('click', function(){
  var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

document.getElementById('excelBtnSide').addEventListener('click', exportExcel);
document.getElementById('quickIncomeBtn').addEventListener('click', function(){ openEntry('income'); });
document.getElementById('quickExpenseBtn').addEventListener('click', function(){ openEntry('expense'); });
document.getElementById('fabMain').addEventListener('click', function(){ document.getElementById('fab').classList.toggle('open'); });
document.getElementById('entryClose').addEventListener('click', closeEntry);
document.getElementById('entryCancel').addEventListener('click', closeEntry);
document.getElementById('entrySave').addEventListener('click', function(){ saveEntry(false); });
document.getElementById('entrySaveAnother').addEventListener('click', function(){ saveEntry(true); });
document.getElementById('etypeInc').addEventListener('click', function(){ setEntryType('income'); });
document.getElementById('etypeExp').addEventListener('click', function(){ setEntryType('expense'); });
document.getElementById('entryModal').addEventListener('click', function(ev){ if(ev.target === this) closeEntry(); });

document.addEventListener('keydown', function(ev){
  var tag = (ev.target.tagName||'').toLowerCase();
  var typing = tag==='input'||tag==='select'||tag==='textarea';
  if(ev.key === 'Escape'){ closeEntry(); document.getElementById('fab').classList.remove('open'); }
  if(typing) return;
  if(ev.key === 'n' || ev.key === 'N'){ ev.preventDefault(); openEntry('income'); }
  if(ev.key === 'e' || ev.key === 'E'){ ev.preventDefault(); openEntry('expense'); }
});

/* INIT */
state = loadState();
if(!state.settings) state.settings = { theme:'light', filingStatus:'mfj', seTaxRate:0.153, estimatedBracket:0.24 };
if(!state.balance) state.balance = {};
applyTheme(state.settings.theme === 'dark' ? 'dark' : 'light');
render();

})();